# Persistence Layer

This folder contains the domain-driven persistence layer for the Belly Bear Sings application. It implements the Active Record pattern with Firebase Firestore, providing type-safe, object-oriented access to your database collections.

## Architecture Overview

The persistence layer consists of:

- **BaseModel**: Abstract base class providing common CRUD operations
- **Domain Models**: Specific models for each collection (User, Party, QueueSong, etc.)
- **Type Safety**: Full TypeScript support with proper interfaces
- **Business Logic**: Validation and domain-specific operations encapsulated in models
- **Real-time Support**: Built-in subscription methods for live updates

## Benefits

✅ **Type Safety**: Full TypeScript support with autocompletion  
✅ **Clean API**: Intuitive object-oriented interface  
✅ **Validation**: Built-in data validation before saving  
✅ **Business Logic**: Domain rules encapsulated in models  
✅ **Real-time**: Easy subscription to data changes  
✅ **Testable**: Easy to mock and unit test  
✅ **Maintainable**: Clear separation of concerns  

## Quick Start

```typescript
import { User, Party, QueueSong } from './persistence';

// Create and save a user
const user = User.createNew({
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
});
await user.save();

// Find and update
const foundUser = await User.find('user123');
if (foundUser) {
  foundUser.updateProfile({ firstName: 'Johnny' });
  await foundUser.save();
}

// Create a party
const party = Party.createNew({
  name: 'Karaoke Night',
  hostId: 'user123',
});
await party.save();
console.log(party.code); // Auto-generated party code
```

## Available Models

### User Model

```typescript
// Create new user
const user = User.createNew({
  userId: 'unique-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
});

// Properties and methods
user.fullName        // "John Doe"
user.initials        // "JD"
user.updateProfile({ firstName: 'Johnny' })
await user.save()

// Static methods
await User.find('user-id')
await User.findByEmail('john@example.com')
```

### Party Model

```typescript
// Create new party
const party = Party.createNew({
  name: 'Birthday Bash',
  hostId: 'user123',
  maxParticipants: 20,
});

// Party management
party.start()
party.pause()
party.resume()
party.end()
party.addParticipant('user456')
party.removeParticipant('user456')

// Properties
party.isActive       // boolean
party.participantCount  // number
party.code           // "ABCD-1234"

// Static methods
await Party.findByCode('ABCD-1234')
await Party.findByHost('user123')
await Party.findActiveParties()
```

### QueueSong Model

```typescript
// Add song to queue
const song = QueueSong.createNew({
  partyId: 'party123',
  videoId: 'dQw4w9WgXcQ',
  title: 'Never Gonna Give You Up',
  artist: 'Rick Astley',
  requestedBy: {
    id: 'user456',
    name: 'Jane Smith',
    initials: 'JS',
  },
});

// Song management
song.boost()
song.unboost()
song.markAsPlaying()
song.markAsPlayed()
song.skip()
song.addPraise({
  from: 'user789',
  fromName: 'Bob',
  type: 'heart'
})

// Properties
song.isQueued        // boolean
song.isPlaying       // boolean
song.boosted         // boolean
song.praiseCount     // number

// Static methods
await QueueSong.findByParty('party123')
await QueueSong.findQueuedByParty('party123')
await QueueSong.findBoostedByParty('party123')
```

## Real-time Subscriptions

All models support real-time subscriptions:

```typescript
// Subscribe to party queue updates
const unsubscribe = QueueSong.subscribe((songs) => {
  console.log('Queue updated:', songs.length);
  // Update your UI
});

// Subscribe to all parties
const unsubscribe2 = Party.subscribe((parties) => {
  console.log('Parties:', parties.length);
});

// Clean up when component unmounts
unsubscribe();
unsubscribe2();
```

## Error Handling

Models provide validation and business logic errors:

```typescript
try {
  const user = User.createNew({
    userId: 'user123',
    firstName: '', // Invalid: empty name
    lastName: 'Doe',
    email: 'invalid-email', // Invalid: bad format
  });
  
  await user.save(); // Will throw validation error
} catch (error) {
  console.error('Validation failed:', error.message);
}

try {
  song.boost(); // If already boosted, will throw error
} catch (error) {
  console.error('Business logic error:', error.message);
}
```

## Migration from Old Service Layer

### Before (Service Functions)
```typescript
// Old way - scattered service functions
import { createUser, getUser, updateUser } from '@bellybearsings/firebase-config';

const userData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
await createUser('user123', userData);

const user = await getUser('user123');
if (user) {
  await updateUser('user123', { firstName: 'Johnny' });
}
```

### After (Domain Models)
```typescript
// New way - domain objects
import { User } from './persistence';

const user = User.createNew({
  userId: 'user123',
  firstName: 'John', 
  lastName: 'Doe',
  email: 'john@example.com',
});
await user.save();

user.updateProfile({ firstName: 'Johnny' });
await user.save();
```

## Adding New Models

To add a new model (e.g., `Playlist`):

1. Create `src/persistence/models/Playlist.ts`:

```typescript
import { DocumentData } from 'firebase/firestore';
import { BaseModel } from '../BaseModel';

export interface PlaylistData {
  playlistId: string;
  name: string;
  userId: string;
  songs: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Playlist extends BaseModel<PlaylistData> {
  protected collectionName = 'playlists';
  protected idField = 'playlistId';

  // Implement required abstract methods
  protected async validate(): Promise<void> {
    if (!this.data.name?.trim()) {
      throw new Error('Playlist name is required');
    }
  }

  protected transformForSave(): Record<string, any> {
    return {
      name: this.data.name,
      userId: this.data.userId,
      songs: this.data.songs || [],
    };
  }

  protected transformFromFirestore(data: DocumentData, id: string): PlaylistData {
    return {
      playlistId: id,
      name: data.name || '',
      userId: data.userId || '',
      songs: data.songs || [],
      createdAt: this.convertTimestamp(data.createdAt) || new Date(),
      updatedAt: this.convertTimestamp(data.updatedAt) || new Date(),
    };
  }

  // Add business logic methods
  addSong(songId: string): void {
    const songs = this.data.songs || [];
    if (!songs.includes(songId)) {
      this.update({ songs: [...songs, songId] });
    }
  }
}
```

2. Export in `src/persistence/index.ts`:

```typescript
export { Playlist, type PlaylistData } from './models/Playlist';
```

## Best Practices

### 1. Use Factory Methods
```typescript
// Good
const user = User.createNew({ ... });

// Avoid
const user = new User({ ... });
```

### 2. Always Validate Before Save
The models handle this automatically, but be aware:
```typescript
try {
  await model.save(); // Validation happens here
} catch (error) {
  // Handle validation errors
}
```

### 3. Use Business Logic Methods
```typescript
// Good - uses business logic
party.addParticipant('user123');
await party.save();

// Avoid - bypasses validation
party.update({ participants: [...party.participants, 'user123'] });
```

### 4. Clean Up Subscriptions
```typescript
useEffect(() => {
  const unsubscribe = QueueSong.subscribe(handleUpdate);
  return () => unsubscribe(); // Important!
}, []);
```

### 5. Handle Errors Gracefully
```typescript
const party = await Party.findByCode(code);
if (!party) {
  // Handle not found case
  return;
}

if (!party.isActive) {
  // Handle business logic constraints
  return;
}
```

## Examples

See `src/persistence/examples/usage.ts` for comprehensive examples of all model operations.

## Testing

Models are designed to be easily testable:

```typescript
// Mock the database
jest.mock('@bellybearsings/firebase-config');

// Test business logic
const user = User.createNew({ ... });
expect(user.fullName).toBe('John Doe');
expect(user.initials).toBe('JD');

// Test validation
await expect(user.save()).rejects.toThrow('Email is required');
```

This persistence layer replaces the scattered service functions with a clean, object-oriented approach that's easier to use, test, and maintain! 