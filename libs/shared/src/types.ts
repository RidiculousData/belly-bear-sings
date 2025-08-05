// User types
export interface User {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  createdAt: Date;
  firstName?: string;
  lastName?: string;
}

// Party types
export interface Party {
  partyId: string;
  hostId: string;
  code: string;
  name: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  isActive: boolean;
  participants: string[];
  settings: {
    maxParticipants: number;
    allowDuplicates: boolean;
    requireApproval: boolean;
    boostsPerPerson: number;
    maxSongsPerPerson: number;
  };
}

// Party guest types
export interface PartyGuest {
  guestId: string;
  displayName: string;
  boostsRemaining: number;
  isAnonymous: boolean;
  isHost: boolean;
  joinedAt: Date;
  photoURL?: string;
}

// Song types
export interface QueueSong {
  songId: string;
  guestId: string;
  requesterName: string;
  youtubeVideoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  duration?: number;
  isBoosted: boolean;
  addedAt: Date;
  boostedAt?: Date;
  playedAt?: Date;
}

export interface FavoriteSong {
  songId: string;
  youtubeVideoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  artist?: string;
  genre?: string;
  playlists?: string[];
  addedAt: Date;
}

// YouTube API types
export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration?: string;
}

// Auth types
export type AuthProvider = 'email' | 'phone' | 'google' | 'apple' | 'facebook' | 'twitter' | 'anonymous';

// Queue sorting types
export type QueueSortOrder = 'boosted-first' | 'chronological' | 'user-songs';

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Party creation response
export interface CreatePartyResponse {
  partyId: string;
  success: boolean;
}

// Join party response
export interface JoinPartyResponse {
  success: boolean;
  alreadyJoined: boolean;
}

// Boost song response
export interface BoostSongResponse {
  success: boolean;
  boostsRemaining: number;
} 