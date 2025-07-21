/**
 * Mock Data Index
 * Centralized export for all mock data collections
 * Used for seeding Firebase and testing
 */

const { sampleUsers } = require('./users.cjs');
const { sampleSongs, mockFavoriteSongs } = require('./songs.cjs');
const { mockPastParties, mockParticipants } = require('./parties.cjs');
const { mockPlaylists } = require('./playlists.cjs');

module.exports = {
  // User data
  sampleUsers,
  
  // Song data
  sampleSongs,
  mockFavoriteSongs,
  
  // Party data
  mockPastParties,
  mockParticipants,
  
  // Playlist data
  mockPlaylists,
};
