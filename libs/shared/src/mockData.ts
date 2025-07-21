import { User, Party, PartyGuest, QueueSong, FavoriteSong } from './types';

// Sample users for development and testing
export const sampleUsers = [
  {
    email: 'alice@example.com',
    password: 'password123',
    displayName: 'Alice Johnson',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'Host',
    description: 'Experienced karaoke host with 50+ parties',
  },
  {
    email: 'bob@example.com',
    password: 'password123',
    displayName: 'Bob Smith',
    firstName: 'Bob',
    lastName: 'Smith',
    role: 'Host',
    description: 'New host, tech-savvy',
  },
  {
    email: 'charlie@example.com',
    password: 'password123',
    displayName: 'Charlie Brown',
    firstName: 'Charlie',
    lastName: 'Brown',
    role: 'Participant',
    description: 'Regular party-goer, loves classic rock',
  },
  {
    email: 'diana@example.com',
    password: 'password123',
    displayName: 'Diana Prince',
    firstName: 'Diana',
    lastName: 'Prince',
    role: 'Participant',
    description: 'Pop music enthusiast, frequent booster',
  },
  {
    email: 'evan@example.com',
    password: 'password123',
    displayName: 'Evan Miller',
    firstName: 'Evan',
    lastName: 'Miller',
    role: 'Participant',
    description: 'Shy singer, prefers duets',
  },
];

// Sample parties for user's dashboard
export const mockPastParties = [
  {
    id: '1',
    date: '2024-01-15',
    duration: 180, // minutes
    attendees: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince'],
    songs: [
      { title: 'Bohemian Rhapsody', artist: 'Queen', singer: 'Alice Johnson' },
      { title: 'Don\'t Stop Believin\'', artist: 'Journey', singer: 'Bob Smith' },
      { title: 'Sweet Caroline', artist: 'Neil Diamond', singer: 'Charlie Brown' },
    ],
  },
  {
    id: '2',
    date: '2024-01-08',
    duration: 120,
    attendees: ['John Doe', 'Jane Smith', 'Mike Wilson'],
    songs: [
      { title: 'Livin\' on a Prayer', artist: 'Bon Jovi', singer: 'John Doe' },
      { title: 'Mr. Brightside', artist: 'The Killers', singer: 'Jane Smith' },
    ],
  },
];

// Sample favorite songs for dashboard
export const mockFavoriteSongs = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    youtubeVideoId: 'fJ9rUzIMcZQ',
    thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    timesPlayed: 15,
    othersWhoLove: 127,
    friendsWhoLove: ['Alice Johnson', 'Bob Smith'],
    playlists: ['Rock Classics', 'Karaoke Hits'],
  },
  {
    id: '2',
    title: 'Don\'t Stop Believin\'',
    artist: 'Journey',
    youtubeVideoId: 'VcjzHMhBtf0',
    thumbnailUrl: 'https://i.ytimg.com/vi/VcjzHMhBtf0/hqdefault.jpg',
    timesPlayed: 8,
    othersWhoLove: 89,
    friendsWhoLove: ['Charlie Brown'],
    playlists: ['Feel Good'],
  },
  {
    id: '3',
    title: 'Sweet Caroline',
    artist: 'Neil Diamond',
    youtubeVideoId: 'PI3dBLYUQfg',
    thumbnailUrl: 'https://i.ytimg.com/vi/PI3dBLYUQfg/hqdefault.jpg',
    timesPlayed: 12,
    othersWhoLove: 156,
    friendsWhoLove: ['Diana Prince', 'Eve Thompson'],
    playlists: ['Crowd Pleasers', 'Sing-Along'],
  },
];

// Sample playlists
export const mockPlaylists = ['Rock Classics', 'Pop Hits', 'Feel Good', 'Crowd Pleasers', 'Sing-Along', 'Duets'];

// Sample queue songs for parties
export const mockQueueSongs = [
  {
    id: '1',
    videoId: '6VoT-KrseHA',
    title: 'Total Eclipse of the Heart',
    artist: 'Bonnie Tyler',
    youtubeVideoId: '6VoT-KrseHA',
    videoTitle: 'Total Eclipse of the Heart - Bonnie Tyler (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/6VoT-KrseHA/hqdefault.jpg',
    requestedBy: { id: '1', name: 'Alice Johnson', initials: 'AJ' },
    boosted: true,
    isBoosted: true,
    boostCount: 3,
    praises: [],
  },
  {
    id: '2',
    videoId: '1--pwdu-eJE',
    title: 'Livin\' on a Prayer',
    artist: 'Bon Jovi',
    youtubeVideoId: '1--pwdu-eJE',
    videoTitle: 'Livin\' on a Prayer - Bon Jovi (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/1--pwdu-eJE/hqdefault.jpg',
    requestedBy: { id: '2', name: 'Bob Smith', initials: 'BS' },
    boosted: false,
    isBoosted: false,
    boostCount: 0,
    praises: [],
  },
  {
    id: '3',
    videoId: 'eBpEmaoq5Jg',
    title: 'Summer Nights',
    artist: 'Grease Soundtrack',
    youtubeVideoId: 'eBpEmaoq5Jg',
    videoTitle: 'Summer Nights - Grease Soundtrack (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/eBpEmaoq5Jg/hqdefault.jpg',
    requestedBy: { id: '3', name: 'Charlie Brown', initials: 'CB' },
    boosted: true,
    isBoosted: true,
    boostCount: 1,
    praises: [],
  },
  {
    id: '4',
    videoId: 'RboXMihBLX0',
    title: 'This I Promise You',
    artist: 'NSYNC',
    youtubeVideoId: 'RboXMihBLX0',
    videoTitle: 'This I Promise You - NSYNC (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/RboXMihBLX0/hqdefault.jpg',
    requestedBy: { id: '4', name: 'Diana Prince', initials: 'DP' },
    boosted: false,
    isBoosted: false,
    boostCount: 0,
    praises: [],
  },
];

// Sample participants for parties
export const mockParticipants = [
  { id: '1', name: 'Alice Johnson', initials: 'AJ', joinedAt: new Date() },
  { id: '2', name: 'Bob Smith', initials: 'BS', joinedAt: new Date() },
  { id: '3', name: 'Charlie Brown', initials: 'CB', joinedAt: new Date() },
  { id: '4', name: 'Diana Prince', initials: 'DP', joinedAt: new Date() },
];

// Sample songs for seeding with proper Firebase structure
export const sampleSongs = [
  {
    youtubeVideoId: 'dQw4w9WgXcQ',
    videoTitle: 'Rick Astley - Never Gonna Give You Up (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    artist: 'Rick Astley',
    title: 'Never Gonna Give You Up',
    isBoosted: true,
    boostedAt: new Date(Date.now() - 10000), // 10 seconds ago
  },
  {
    youtubeVideoId: 'kJQP7kiw5Fk',
    videoTitle: 'Luis Fonsi - Despacito ft. Daddy Yankee (Karaoke)',
    thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    artist: 'Luis Fonsi',
    title: 'Despacito',
    isBoosted: false,
  },
  {
    youtubeVideoId: 'fJ9rUzIMcZQ',
    videoTitle: 'Queen - Bohemian Rhapsody (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    artist: 'Queen',
    title: 'Bohemian Rhapsody',
    isBoosted: true,
    boostedAt: new Date(Date.now() - 5000), // 5 seconds ago
  },
  {
    youtubeVideoId: 'L_jWHffIx5E',
    videoTitle: 'Smash Mouth - All Star (Karaoke)',
    thumbnailUrl: 'https://i.ytimg.com/vi/L_jWHffIx5E/hqdefault.jpg',
    artist: 'Smash Mouth',
    title: 'All Star',
    isBoosted: false,
  },
];

// Sample party data for seeding
export const samplePartyData = {
  name: 'Sample Karaoke Party',
  code: 'demo-party-123',
  isActive: true,
  settings: {
    maxParticipants: 20,
    allowDuplicates: false,
    requireApproval: false,
    boostsPerPerson: 3,
    maxSongsPerPerson: 10,
  },
};

// Export collections of Firebase-compatible data
export const firebaseCompatibleData = {
  users: sampleUsers,
  parties: [samplePartyData],
  songs: sampleSongs,
  favoriteSongs: mockFavoriteSongs,
  playlists: mockPlaylists,
  pastParties: mockPastParties,
}; 