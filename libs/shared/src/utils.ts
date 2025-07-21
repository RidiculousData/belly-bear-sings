import { QueueSong } from './types';

// Format display name with first name and last initial
export function formatDisplayName(firstName?: string, lastName?: string, displayName?: string): string {
  if (displayName) return displayName;
  if (!firstName) return 'Guest';
  if (!lastName) return firstName;
  return `${firstName} ${lastName.charAt(0)}.`;
}

// Sort queue songs according to business logic
export function sortQueueSongs(songs: QueueSong[]): QueueSong[] {
  return [...songs].sort((a, b) => {
    // Boosted songs come first
    if (a.isBoosted && !b.isBoosted) return -1;
    if (!a.isBoosted && b.isBoosted) return 1;
    
    // Among boosted songs, sort by boost time
    if (a.isBoosted && b.isBoosted) {
      return (a.boostedAt?.getTime() || 0) - (b.boostedAt?.getTime() || 0);
    }
    
    // Among non-boosted songs, sort by added time
    return a.addedAt.getTime() - b.addedAt.getTime();
  });
}

// Generate party URI
export function generatePartyUri(partyId: string): string {
  return `${window.location.origin}/party/${partyId}`;
}

// Format YouTube duration from ISO 8601 to readable format
export function formatYouTubeDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  const parts = [];
  if (hours) parts.push(hours);
  if (minutes) parts.push(minutes.padStart(hours ? 2 : 1, '0'));
  if (seconds) parts.push(seconds.padStart(2, '0'));
  
  return parts.join(':');
}

// Validate YouTube video ID
export function isValidYouTubeVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

// Extract video ID from YouTube URL
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait) as unknown as number;
  };
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
} 