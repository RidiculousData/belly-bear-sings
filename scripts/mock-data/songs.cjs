/**
 * Sample songs for seeding with proper Firebase structure
 * These songs are used in the queue and for testing
 */
const sampleSongs = [
  {
    youtubeVideoId: 'dQw4w9WgXcQ',
    videoTitle: 'Rick Astley - Never Gonna Give You Up (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    artist: 'Rick Astley',
    title: 'Never Gonna Give You Up',
    isBoosted: true,
    boostedAt: new Date(Date.now() - 10000),
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
    boostedAt: new Date(Date.now() - 5000),
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

const mockFavoriteSongs = [
  {
    youtubeVideoId: 'fJ9rUzIMcZQ',
    videoTitle: 'Queen - Bohemian Rhapsody (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    artist: 'Queen',
    title: 'Bohemian Rhapsody',
    genre: 'Rock',
    playlists: ['Rock Classics', 'Karaoke Hits'],
  },
  {
    youtubeVideoId: 'VcjzHMhBtf0',
    videoTitle: 'Journey - Don\'t Stop Believin\' (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/VcjzHMhBtf0/hqdefault.jpg',
    artist: 'Journey',
    title: 'Don\'t Stop Believin\'',
    genre: 'Rock',
    playlists: ['Feel Good', 'Rock Classics'],
  },
  {
    youtubeVideoId: 'PI3dBLYUQfg',
    videoTitle: 'Neil Diamond - Sweet Caroline (Karaoke Version)',
    thumbnailUrl: 'https://i.ytimg.com/vi/PI3dBLYUQfg/hqdefault.jpg',
    artist: 'Neil Diamond',
    title: 'Sweet Caroline',
    genre: 'Pop',
    playlists: ['Crowd Pleasers', 'Sing-Along'],
  },
];

module.exports = {
  sampleSongs,
  mockFavoriteSongs,
};
