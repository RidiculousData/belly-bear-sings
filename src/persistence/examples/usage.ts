// Example usage of the new persistence layer
// This file demonstrates how to use the domain models

import { User, Party, QueueSong } from '../index';

// Example: Creating and managing users
async function userExamples() {
  // Create a new user
  const user = User.createNew({
    userId: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
  });

  // Save to database
  await user.save();

  // Find a user by ID
  const foundUser = await User.find('user123');
  if (foundUser) {
  }

  // Find user by email
  const userByEmail = await User.findByEmail('john.doe@example.com');
  if (userByEmail) {
    // Update user profile
    userByEmail.updateProfile({
      firstName: 'Johnny',
      phoneNumber: '+1987654321',
    });
    await userByEmail.save();
  }
}

// Example: Creating and managing parties
async function partyExamples() {
  // Create a new party
  const party = Party.createNew({
    name: 'John\'s Birthday Bash',
    hostId: 'user123',
    description: 'Come sing karaoke!',
    maxParticipants: 20,
  });

  // Save to database
  await party.save();

  // Start the party
  party.start();
  await party.save();

  // Add participants
  party.addParticipant('user456');
  party.addParticipant('user789');
  await party.save();


  // Find party by code
  const foundParty = await Party.findByCode(party.code);
  if (foundParty) {
  }

  // Find all active parties
  const activeParties = await Party.findActiveParties();

  // Pause and resume party
  if (foundParty?.isActive) {
    foundParty.pause();
    await foundParty.save();

    foundParty.resume();
    await foundParty.save();
  }
}

// Example: Managing queue songs
async function queueSongExamples() {
  const partyId = 'party123';

  // Create a new queue song
  const song = QueueSong.createNew({
    partyId,
    videoId: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    requestedBy: {
      id: 'user456',
      name: 'Jane Smith',
      initials: 'JS',
      avatar: 'https://example.com/avatar.jpg',
    },
  });

  // Save to database
  await song.save();

  // Boost the song
  song.boost();
  await song.save();

  // Add praise
  song.addPraise({
    from: 'user789',
    fromName: 'Bob Johnson',
    type: 'heart',
  });
  await song.save();

  // Mark as playing
  song.markAsPlaying();
  await song.save();

  // Mark as played
  song.markAsPlayed();
  await song.save();

  // Query songs by party
  const queuedSongs = await QueueSong.findQueuedByParty(partyId);

  const boostedSongs = await QueueSong.findBoostedByParty(partyId);
}

// Example: Real-time subscriptions
async function subscriptionExamples() {
  const partyId = 'party123';

  // Subscribe to party queue changes
  const unsubscribeQueue = QueueSong.subscribe((songs) => {
    // Update UI with new queue
  });

  // Subscribe to all parties
  const unsubscribeParties = Party.subscribe((parties) => {
    // Update dashboard
  });

  // Clean up subscriptions when component unmounts
  // unsubscribeQueue();
  // unsubscribeParties();
}

// Example: Error handling
async function errorHandlingExamples() {
  try {
    // Try to create invalid user
    const invalidUser = User.createNew({
      userId: 'user123',
      firstName: '', // Empty name will fail validation
      lastName: 'Doe',
      email: 'invalid-email', // Invalid email format
    });

    await invalidUser.save(); // This will throw validation errors
  } catch (error) {
  }

  try {
    // Try to boost an already boosted song
    const song = await QueueSong.find('song123');
    if (song?.boosted) {
      song.boost(); // This will throw an error
    }
  } catch (error) {
  }
}

// Example: Batch operations using traditional methods
async function batchOperations() {
  // For complex operations, you can still use the underlying Firebase methods
  // by accessing the transformed data from your domain objects
  
  const party = await Party.getPartyById('party123');
  if (party) {
    // Get all queue songs for this party
    const songs = await QueueSong.findByParty('party123');
    
    // Process multiple songs at once
    const playedSongs = songs.filter(song => song.hasBeenPlayed);
    
    // You could implement batch updates if needed
    for (const song of playedSongs) {
      // Clean up old played songs
      await song.delete();
    }
  }
}

export {
  userExamples,
  partyExamples,
  queueSongExamples,
  subscriptionExamples,
  errorHandlingExamples,
  batchOperations,
}; 