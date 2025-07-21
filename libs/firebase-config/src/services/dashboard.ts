import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { FavoriteSong } from '@bellybearsings/shared';

// Interface for past party data
export interface PastParty {
  id: string;
  name: string;
  date: string;
  duration: number;
  attendees: string[];
  totalSongs: number;
  songs: Array<{
    title: string;
    artist: string;
    singer: string;
  }>;
}

// Interface for favorite song with additional metadata
export interface FavoriteSongWithMetadata extends FavoriteSong {
  timesPlayed?: number;
  othersWhoLove?: number;
  friendsWhoLove?: string[];
  playlists?: string[];
}

/**
 * Fetch past parties for a user
 * @param userId - The user's ID
 * @returns Promise<PastParty[]>
 */
export async function fetchPastParties(userId: string): Promise<PastParty[]> {
  try {
    const partiesRef = collection(db, 'parties');
    const q = query(
      partiesRef,
      where('hostId', '==', userId),
      where('isActive', '==', false),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const pastParties: PastParty[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pastParties.push({
        id: doc.id,
        name: data.name,
        date: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        duration: data.duration || 0,
        attendees: data.attendees || [],
        totalSongs: data.totalSongs || 0,
        songs: data.songs || [],
      });
    });
    
    return pastParties;
  } catch (error) {
    console.error('Error fetching past parties:', error);
    throw error;
  }
}

/**
 * Fetch favorite songs for a user
 * @param userId - The user's ID
 * @returns Promise<FavoriteSongWithMetadata[]>
 */
export async function fetchFavoriteSongs(userId: string): Promise<FavoriteSongWithMetadata[]> {
  try {
    const favoriteSongsRef = collection(db, 'favoriteSongs');
    const q = query(
      favoriteSongsRef,
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const favoriteSongs: FavoriteSongWithMetadata[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      favoriteSongs.push({
        songId: doc.id,
        youtubeVideoId: data.youtubeVideoId,
        videoTitle: data.videoTitle,
        thumbnailUrl: data.thumbnailUrl,
        artist: data.artist,
        genre: data.genre,
        playlists: data.playlists || [],
        addedAt: data.addedAt?.toDate?.() || new Date(),
        // Mock additional metadata for now
        timesPlayed: Math.floor(Math.random() * 20) + 1,
        othersWhoLove: Math.floor(Math.random() * 200) + 10,
        friendsWhoLove: ['Alice Johnson', 'Bob Smith'].slice(0, Math.floor(Math.random() * 3)),
      });
    });
    
    return favoriteSongs;
  } catch (error) {
    console.error('Error fetching favorite songs:', error);
    throw error;
  }
}

/**
 * Add a song to user's favorites
 * @param userId - The user's ID
 * @param songData - The song data to add
 * @returns Promise<void>
 */
export async function addFavoriteSong(userId: string, songData: Omit<FavoriteSong, 'songId' | 'addedAt'>): Promise<void> {
  try {
    const favoriteSongsRef = collection(db, 'favoriteSongs');
    await addDoc(favoriteSongsRef, {
      ...songData,
      userId,
      addedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding favorite song:', error);
    throw error;
  }
}

/**
 * Remove a song from user's favorites
 * @param songId - The song's ID
 * @returns Promise<void>
 */
export async function removeFavoriteSong(songId: string): Promise<void> {
  try {
    const songRef = doc(db, 'favoriteSongs', songId);
    await deleteDoc(songRef);
  } catch (error) {
    console.error('Error removing favorite song:', error);
    throw error;
  }
}

/**
 * Get available playlists
 * @returns Promise<string[]>
 */
export async function fetchPlaylists(): Promise<string[]> {
  try {
    // For now, return mock playlists
    // In the future, this could be fetched from a playlists collection
    return [
      'Rock Classics',
      'Pop Hits',
      'Feel Good',
      'Crowd Pleasers',
      'Sing-Along',
      'Duets',
      'Love Songs',
      'Party Anthems',
      'Karaoke Hits',
    ];
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
}

/**
 * Search favorite songs by query and playlist filter
 * @param userId - The user's ID
 * @param searchQuery - Search query for song title or artist
 * @param playlistFilter - Filter by playlist name
 * @returns Promise<FavoriteSongWithMetadata[]>
 */
export async function searchFavoriteSongs(
  userId: string,
  searchQuery: string = '',
  playlistFilter: string | null = null
): Promise<FavoriteSongWithMetadata[]> {
  try {
    const allFavorites = await fetchFavoriteSongs(userId);
    
    return allFavorites.filter(song => {
      const matchesSearch = !searchQuery || 
        song.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlaylist = !playlistFilter || 
        song.playlists?.includes(playlistFilter);
      
      return matchesSearch && matchesPlaylist;
    });
  } catch (error) {
    console.error('Error searching favorite songs:', error);
    throw error;
  }
} 