export interface Song {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  requestedBy: {
    id: string;
    name: string;
    initials: string;
    avatar?: string;
  };
  boosted: boolean;
  boostCount: number;
  praises: Array<{
    from: string;
    type: 'thumbsup' | 'heart' | 'fire' | 'star';
    timestamp: Date;
  }>;
}

export type Role = 'HOST' | 'GUEST';

export interface Participant {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  role: Role;
  joinedAt: Date;
  boostsRemaining: number;
  score: number;
} 