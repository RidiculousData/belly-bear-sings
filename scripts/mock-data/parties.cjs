/**
 * Sample past parties for user dashboard
 * Used for displaying party history and statistics
 */
const mockPastParties = [
  {
    name: 'New Year\'s Eve Party',
    date: '2024-01-01',
    duration: 240,
    attendees: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince'],
    totalSongs: 18,
    songs: [
      { title: 'Bohemian Rhapsody', artist: 'Queen', singer: 'Alice Johnson' },
      { title: 'Don\'t Stop Believin\'', artist: 'Journey', singer: 'Bob Smith' },
      { title: 'Sweet Caroline', artist: 'Neil Diamond', singer: 'Charlie Brown' },
    ],
  },
  {
    name: 'Birthday Bash',
    date: '2024-01-15',
    duration: 180,
    attendees: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Evan Miller'],
    totalSongs: 12,
    songs: [
      { title: 'Livin\' on a Prayer', artist: 'Bon Jovi', singer: 'Diana Prince' },
      { title: 'Mr. Brightside', artist: 'The Killers', singer: 'Evan Miller' },
    ],
  },
];

const mockParticipants = [
  { id: '1', name: 'Alice Johnson', initials: 'AJ', joinedAt: new Date() },
  { id: '2', name: 'Bob Smith', initials: 'BS', joinedAt: new Date() },
  { id: '3', name: 'Charlie Brown', initials: 'CB', joinedAt: new Date() },
  { id: '4', name: 'Diana Prince', initials: 'DP', joinedAt: new Date() },
];

module.exports = {
  mockPastParties,
  mockParticipants,
};
