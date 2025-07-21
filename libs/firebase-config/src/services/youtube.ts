import { youtubeConfig } from '../config';
import { YouTubeSearchResult, debounce } from '@bellybearsings/shared';

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
  };
  contentDetails?: {
    duration: string;
  };
}

export interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: YouTubeVideo['snippet'];
  }>;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

// Search for karaoke videos
export async function searchKaraokeVideos(
  searchTerm: string,
  pageToken?: string,
  maxResults: number = 10
): Promise<YouTubeSearchResult[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    q: `karaoke ${searchTerm}`,
    type: 'video',
    maxResults: maxResults.toString(),
    key: youtubeConfig.apiKey,
    ...(pageToken && { pageToken }),
  });

  const response = await fetch(`${youtubeConfig.apiUrl}/search?${params}`);
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`);
  }

  const data: YouTubeSearchResponse = await response.json();

  // Get video durations
  const videoIds = data.items.map(item => item.id.videoId).join(',');
  const durations = await getVideoDurations(videoIds);

  return data.items.map((item, index) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails.high.url,
    channelTitle: item.snippet.channelTitle,
    duration: durations[index],
  }));
}

// Get video durations
async function getVideoDurations(videoIds: string): Promise<string[]> {
  if (!videoIds) return [];

  const params = new URLSearchParams({
    part: 'contentDetails',
    id: videoIds,
    key: youtubeConfig.apiKey,
  });

  const response = await fetch(`${youtubeConfig.apiUrl}/videos?${params}`);
  
  if (!response.ok) {
    console.error('Failed to fetch video durations');
    return [];
  }

  const data = await response.json();
  return data.items.map((item: YouTubeVideo) => item.contentDetails?.duration || '');
}

// Get single video details
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    id: videoId,
    key: youtubeConfig.apiKey,
  });

  const response = await fetch(`${youtubeConfig.apiUrl}/videos?${params}`);
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items[0] || null;
}

// Create debounced search function
export const debouncedSearch = debounce(searchKaraokeVideos, 300); 