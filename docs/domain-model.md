# Domain Model

This document describes the domain model for the Belly Bear Sings karaoke queue platform. It captures the core entities, their relationships, business rules, and domain concepts.

## UML Diagrams

The domain model is also represented in UML format:

- **[UML Class Diagram](./uml-class-diagram.mermaid)** - Complete class diagram with attributes, methods, and relationships
- **[UML Relationships Diagram](./uml-relationships.mermaid)** - Detailed view of entity relationships with multiplicities
- **[UML Package Diagram](./uml-package-diagram.mermaid)** - Domain layer structure and package organization
- **[UML Sequence Diagrams](./uml-sequence-diagrams.mermaid)** - Key operation flows (create party, add song, boost song, play song, join party)
- **[Entity Relationship Diagram](./logical-data-model.mermaid)** - Database-level entity relationships
- **[Aggregate Boundaries](./aggregate-boundaries.mermaid)** - Visual representation of aggregate roots and boundaries
- **[State Machines](./state-machines.mermaid)** - State transition diagrams for Party and QueueSong

## Table of Contents

- [Overview](#overview)
- [Core Entities](#core-entities)
- [Aggregates](#aggregates)
- [Value Objects](#value-objects)
- [Domain Services](#domain-services)
- [Business Rules](#business-rules)
- [Entity Relationships](#entity-relationships)
- [State Machines](#state-machines)

## Overview

Belly Bear Sings is a live karaoke queue management platform where:
- **Hosts** create parties and manage song queues
- **Guests** join parties, search for songs, and add them to the queue
- **Songs** are queued, boosted, played, and praised
- **Users** maintain favorite songs and profiles

The domain is organized around the **Party** aggregate, which contains guests and queue songs as subcollections.

## Core Entities

### User

A registered user in the system who can host parties and participate as guests.

**Identity**: `userId` (string, unique)

**Attributes**:
- `firstName` (string, required)
- `lastName` (string, required)
- `email` (string, required, unique, validated)
- `phoneNumber` (string, optional)
- `profilePicture` (string, optional - URL)
- `createdAt` (Date)
- `updatedAt` (Date)

**Business Rules**:
- Email must be valid format
- Full name is derived from firstName + lastName
- Initials are derived from first letter of firstName and lastName

**Domain Methods**:
- `updateProfile(updates)` - Updates user profile information
- `fullName` - Computed property: `${firstName} ${lastName}`
- `initials` - Computed property: first letters of name

### Party

A karaoke party session created by a host. This is the root aggregate.

**Identity**: `partyId` (string, unique)

**Attributes**:
- `name` (string, required)
- `hostId` (string, required - references User)
- `code` (string, required, unique, auto-generated)
- `status` (enum: 'active' | 'paused' | 'ended', default: 'active')
- `participants` (string[] - array of userIds)
- `maxParticipants` (number, optional)
- `description` (string, optional)
- `createdAt` (Date)
- `updatedAt` (Date)
- `startedAt` (Date, optional)
- `endedAt` (Date, optional)

**Business Rules**:
- Party code is auto-generated (8 characters, format: XXXX-XXXX)
- Host is automatically added to participants list
- Cannot exceed maxParticipants if set
- Cannot remove host from participants
- Status transitions follow state machine rules

**Domain Methods**:
- `start()` - Transitions to 'active' status, sets startedAt
- `pause()` - Transitions to 'paused' status (only from 'active')
- `resume()` - Transitions to 'active' status (only from 'paused')
- `end()` - Transitions to 'ended' status, sets endedAt
- `addParticipant(userId)` - Adds user to participants list
- `removeParticipant(userId)` - Removes user from participants list
- `updateDetails(updates)` - Updates name, description, maxParticipants
- `isActive` - Computed: status === 'active'
- `hasStarted` - Computed: startedAt !== null
- `hasEnded` - Computed: endedAt !== null
- `participantCount` - Computed: participants.length

**Aggregate Root**: Yes - contains PartyGuest and QueueSong subcollections

### PartyGuest

Represents a user's participation in a specific party. Stored as subcollection under Party.

**Identity**: `guestId` (string, unique within party)

**Attributes**:
- `partyId` (string, required - references Party)
- `userId` (string, required - references User)
- `displayName` (string, required)
- `email` (string, required)
- `profilePicture` (string, optional)
- `isHost` (boolean, default: false)
- `boostsRemaining` (number, default: 3, min: 0)
- `joinedAt` (Date)
- `leftAt` (Date, optional)

**Business Rules**:
- Default boosts per guest: 3
- Cannot use boost if boostsRemaining === 0
- Host cannot leave party
- Guest can rejoin after leaving

**Domain Methods**:
- `useBoost()` - Decrements boostsRemaining by 1
- `addBoosts(count)` - Increments boostsRemaining
- `leave()` - Sets leftAt timestamp
- `rejoin()` - Clears leftAt timestamp
- `hasBoostsLeft` - Computed: boostsRemaining > 0
- `initials` - Computed: first letters of displayName

**Aggregate**: Part of Party aggregate

### QueueSong

A song in a party's queue. Stored as subcollection under Party.

**Identity**: `songId` (string, unique within party)

**Attributes**:
- `partyId` (string, required - references Party)
- `videoId` (string, required - YouTube video ID)
- `title` (string, required)
- `artist` (string, required)
- `requestedBy` (object, required):
  - `id` (string - userId)
  - `name` (string)
  - `initials` (string)
  - `avatar` (string, optional)
- `boosted` (boolean, default: false)
- `boostCount` (number, default: 0)
- `status` (enum: 'queued' | 'playing' | 'played' | 'skipped', default: 'queued')
- `addedAt` (Date)
- `boostedAt` (Date, optional)
- `playedAt` (Date, optional)
- `praises` (array of Praise objects, default: [])

**Business Rules**:
- Can only boost songs with status 'queued'
- Status transitions follow state machine rules
- Each user can only praise a song once
- Boosted songs appear first in queue (sorted by boosted desc, then addedAt asc)

**Domain Methods**:
- `boost()` - Sets boosted=true, increments boostCount, sets boostedAt
- `unboost()` - Sets boosted=false, decrements boostCount
- `markAsPlaying()` - Transitions to 'playing' status (only from 'queued')
- `markAsPlayed()` - Transitions to 'played' status, sets playedAt (only from 'playing')
- `skip()` - Transitions to 'skipped' status
- `addPraise(praise)` - Adds praise from user
- `removePraise(userId)` - Removes praise from user
- `isQueued` - Computed: status === 'queued'
- `isPlaying` - Computed: status === 'playing'
- `hasBeenPlayed` - Computed: status === 'played'
- `praiseCount` - Computed: praises.length

**Aggregate**: Part of Party aggregate

### FavoriteSong

A song saved to a user's favorites. Stored as subcollection under User.

**Identity**: `songId` (string, unique within user)

**Attributes**:
- `userId` (string, required - references User)
- `videoId` (string, required - YouTube video ID)
- `title` (string, required)
- `artist` (string, required)
- `thumbnailUrl` (string, optional)
- `duration` (string, optional)
- `addedAt` (Date)
- `timesRequested` (number, default: 0)
- `lastRequestedAt` (Date, optional)
- `tags` (string[], default: [])

**Business Rules**:
- Each user can have one favorite per videoId
- Tags are stored in lowercase
- Popular songs: timesRequested >= 5

**Domain Methods**:
- `markAsRequested()` - Increments timesRequested, sets lastRequestedAt
- `addTag(tag)` - Adds tag (lowercased) if not present
- `removeTag(tag)` - Removes tag (lowercased)
- `updateMetadata(updates)` - Updates title, artist, thumbnailUrl, duration
- `displayTitle` - Computed: `${title} - ${artist}`
- `isPopular` - Computed: timesRequested >= 5
- `wasRecentlyRequested` - Computed: lastRequestedAt within last 7 days

**Aggregate**: Part of User aggregate (conceptual)

## Aggregates

### Party Aggregate

**Root**: Party

**Boundary**: 
- Party (root entity)
- PartyGuest (subcollection)
- QueueSong (subcollection)

**Invariants**:
- All PartyGuests must reference valid partyId
- All QueueSongs must reference valid partyId
- Party status must be consistent with startedAt/endedAt
- Cannot remove host from participants

**Consistency Rules**:
- When party ends, all queue songs should be marked appropriately
- When guest leaves, their boosts are not transferred
- Queue songs are ordered by: boosted desc, addedAt asc

### User Aggregate

**Root**: User

**Boundary**:
- User (root entity)
- FavoriteSong (subcollection)

**Invariants**:
- All FavoriteSongs must reference valid userId
- Email must be unique across all users

## Value Objects

### PartyCode

**Format**: `XXXX-XXXX` (8 alphanumeric characters, hyphen at position 4)

**Generation**: Random selection from `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`

**Uniqueness**: Must be unique across all active parties

### Praise

**Structure**:
```typescript
{
  from: string;        // userId
  fromName: string;     // Display name
  type: 'thumbsup' | 'heart' | 'fire' | 'star';
  timestamp: Date;
}
```

**Rules**:
- Each user can only praise a song once
- Praise types are predefined emoji reactions

### SongMetadata

**Structure**:
```typescript
{
  videoId: string;      // YouTube video ID
  title: string;
  artist: string;
  thumbnailUrl?: string;
  duration?: string;
}
```

**Source**: YouTube API

## Domain Services

### PartyCodeGenerator

**Responsibility**: Generate unique party codes

**Method**: `generatePartyCode(): string`

**Rules**:
- 8 characters total
- Format: XXXX-XXXX
- Must be unique (checked before assignment)

### QueueOrderingService

**Responsibility**: Determine queue order

**Rules**:
1. Boosted songs first (boosted = true)
2. Within boosted: oldest first (addedAt asc)
3. Within non-boosted: oldest first (addedAt asc)

**Implementation**: Firestore query with `orderBy('boosted', 'desc'), orderBy('addedAt', 'asc')`

## Business Rules

### Party Management

1. **Party Creation**:
   - Host is automatically added to participants
   - Party code is auto-generated and unique
   - Initial status is 'active'

2. **Party Status**:
   - Can only start if not already started
   - Can only pause if status is 'active'
   - Can only resume if status is 'paused'
   - Can only end if not already ended

3. **Participant Management**:
   - Cannot add participant if at maxParticipants limit
   - Cannot remove host from participants
   - Cannot add duplicate participant

### Queue Management

1. **Song Addition**:
   - Must have valid YouTube videoId
   - Must have title and artist
   - Initial status is 'queued'
   - Initial boostCount is 0

2. **Song Boosting**:
   - Can only boost songs with status 'queued'
   - Guest must have boostsRemaining > 0
   - Using boost decrements guest's boostsRemaining
   - Boosted songs move to front of queue

3. **Song Status Transitions**:
   - queued → playing (markAsPlaying)
   - playing → played (markAsPlayed)
   - playing → skipped (skip)
   - queued → skipped (skip)
   - Cannot transition from played/skipped to other states

4. **Song Praising**:
   - Each user can only praise a song once
   - Praise types: thumbsup, heart, fire, star
   - Praises are timestamped

### Guest Management

1. **Boost Allocation**:
   - Default: 3 boosts per guest
   - Boosts are party-specific (not transferable)
   - Boosts are consumed when used

2. **Guest Lifecycle**:
   - Guest joins: creates PartyGuest record
   - Guest leaves: sets leftAt timestamp
   - Guest can rejoin: clears leftAt timestamp
   - Host cannot leave party

### Favorite Songs

1. **Favorite Management**:
   - One favorite per videoId per user
   - Tags are case-insensitive (stored lowercase)
   - Popular threshold: 5+ requests

2. **Request Tracking**:
   - timesRequested increments when song is added to queue
   - lastRequestedAt updated on each request

## Entity Relationships

### Relationship Diagram

```
User (1) ──< (0..*) Party [hostId]
User (1) ──< (0..*) PartyGuest [userId]
Party (1) ──< (0..*) PartyGuest [partyId]
Party (1) ──< (0..*) QueueSong [partyId]
User (1) ──< (0..*) FavoriteSong [userId]
PartyGuest (1) ──< (0..*) QueueSong [requestedBy.id]
```

### Cardinality

- **User → Party**: One-to-Many (user can host many parties)
- **User → PartyGuest**: One-to-Many (user can join many parties)
- **Party → PartyGuest**: One-to-Many (party has many guests)
- **Party → QueueSong**: One-to-Many (party has many queue songs)
- **User → FavoriteSong**: One-to-Many (user has many favorites)
- **PartyGuest → QueueSong**: One-to-Many (guest can request many songs)

### Referential Integrity

- `Party.hostId` must reference existing `User.userId`
- `PartyGuest.partyId` must reference existing `Party.partyId`
- `PartyGuest.userId` must reference existing `User.userId`
- `QueueSong.partyId` must reference existing `Party.partyId`
- `QueueSong.requestedBy.id` should reference existing `User.userId` (soft reference)
- `FavoriteSong.userId` must reference existing `User.userId`

## State Machines

### Party Status State Machine

```
[created] → active → paused → active
                ↓
              ended
```

**Transitions**:
- `start()`: created → active
- `pause()`: active → paused
- `resume()`: paused → active
- `end()`: active → ended, paused → ended

**Constraints**:
- Cannot transition from ended
- Cannot pause if not active
- Cannot resume if not paused

### QueueSong Status State Machine

```
queued → playing → played
   ↓         ↓
skipped   skipped
```

**Transitions**:
- `markAsPlaying()`: queued → playing
- `markAsPlayed()`: playing → played
- `skip()`: queued → skipped, playing → skipped

**Constraints**:
- Cannot transition from played/skipped
- Cannot mark as played if not playing
- Cannot mark as playing if not queued

## Domain Events (Conceptual)

While not currently implemented, these are important domain events that could be tracked:

1. **PartyCreated** - When a new party is created
2. **PartyStarted** - When party transitions to active
3. **PartyEnded** - When party is ended
4. **GuestJoined** - When a guest joins a party
5. **GuestLeft** - When a guest leaves a party
6. **SongQueued** - When a song is added to queue
7. **SongBoosted** - When a song is boosted
8. **SongPlaying** - When a song starts playing
9. **SongPlayed** - When a song finishes playing
10. **SongSkipped** - When a song is skipped
11. **SongPraised** - When a song receives praise

## Notes on Implementation

### Firestore Structure

The domain model maps to Firestore collections as follows:

```
users/{userId}
  └── favoriteSongs/{songId}

parties/{partyId}
  ├── partyGuests/{guestId}
  └── queueSongs/{songId}
```

### Subcollections

- `PartyGuest` and `QueueSong` are stored as subcollections under `Party` to ensure:
  - Data locality (all party data in one place)
  - Efficient queries (query party's guests/songs)
  - Cascade deletion (if party deleted, subcollections deleted)

- `FavoriteSong` is stored as subcollection under `User` for:
  - User-specific data isolation
  - Efficient user favorites queries
  - Privacy (user's favorites not in global collection)

### Query Patterns

1. **Find party by code**: Query parties collection where code == value
2. **Get party guests**: Query parties/{partyId}/partyGuests
3. **Get queue songs**: Query parties/{partyId}/queueSongs ordered by boosted desc, addedAt asc
4. **Get user favorites**: Query users/{userId}/favoriteSongs
5. **Find active parties**: Query parties where status == 'active'

