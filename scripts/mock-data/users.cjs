/**
 * Sample users for development and testing
 * These users are created in Firebase Auth and used for login testing
 */
const sampleUsers = [
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

module.exports = {
  sampleUsers,
};
