import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  Unsubscribe,
  WriteBatch,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Party, PartyGuest, QueueSong, FavoriteSong } from '@bellybearsings/shared';

// Collection references
export const collections = {
  users: 'users',
  parties: 'parties',
  partyGuests: 'partyGuests',
  queueSongs: 'queueSongs',
  favoriteSongs: 'favoriteSongs',
};

// User operations
export async function createUser(userId: string, userData: Omit<User, 'userId' | 'createdAt'>): Promise<void> {
  await setDoc(doc(db, collections.users, userId), {
    ...userData,
    userId,
    createdAt: serverTimestamp(),
  });
}

export async function getUser(userId: string): Promise<User | null> {
  const docSnap = await getDoc(doc(db, collections.users, userId));
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as User;
  }
  return null;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  await updateDoc(doc(db, collections.users, userId), updates);
}

// Party operations
export async function createParty(partyData: Omit<Party, 'partyId' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, collections.parties), {
    ...partyData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getParty(partyId: string): Promise<Party | null> {
  const docSnap = await getDoc(doc(db, collections.parties, partyId));
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      partyId,
      createdAt: data.createdAt?.toDate() || new Date(),
      endedAt: data.endedAt?.toDate(),
    } as Party;
  }
  return null;
}

export async function updateParty(partyId: string, updates: Partial<Party>): Promise<void> {
  await updateDoc(doc(db, collections.parties, partyId), updates);
}

// Party guest operations
export async function addPartyGuest(
  partyId: string,
  guestId: string,
  guestData: Omit<PartyGuest, 'guestId' | 'joinedAt'>
): Promise<void> {
  await setDoc(
    doc(db, collections.parties, partyId, collections.partyGuests, guestId),
    {
      ...guestData,
      guestId,
      joinedAt: serverTimestamp(),
    }
  );
}

export async function getPartyGuests(partyId: string): Promise<PartyGuest[]> {
  const querySnapshot = await getDocs(
    collection(db, collections.parties, partyId, collections.partyGuests)
  );
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      guestId: doc.id,
      joinedAt: data.joinedAt?.toDate() || new Date(),
    } as PartyGuest;
  });
}

// Queue operations
export async function addSongToQueue(
  partyId: string,
  songData: Omit<QueueSong, 'songId' | 'addedAt'>
): Promise<string> {
  const docRef = await addDoc(
    collection(db, collections.parties, partyId, collections.queueSongs),
    {
      ...songData,
      addedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function getQueueSongs(partyId: string): Promise<QueueSong[]> {
  const querySnapshot = await getDocs(
    collection(db, collections.parties, partyId, collections.queueSongs)
  );
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      songId: doc.id,
      addedAt: data.addedAt?.toDate() || new Date(),
      boostedAt: data.boostedAt?.toDate(),
      playedAt: data.playedAt?.toDate(),
    } as QueueSong;
  });
}

export async function updateQueueSong(
  partyId: string,
  songId: string,
  updates: Partial<QueueSong>
): Promise<void> {
  await updateDoc(
    doc(db, collections.parties, partyId, collections.queueSongs, songId),
    updates
  );
}

export async function removeSongFromQueue(partyId: string, songId: string): Promise<void> {
  await deleteDoc(doc(db, collections.parties, partyId, collections.queueSongs, songId));
}

// Real-time subscriptions
export function subscribeToQueue(
  partyId: string,
  callback: (songs: QueueSong[]) => void
): Unsubscribe {
  const q = query(
    collection(db, collections.parties, partyId, collections.queueSongs),
    orderBy('addedAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const songs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        songId: doc.id,
        addedAt: data.addedAt?.toDate() || new Date(),
        boostedAt: data.boostedAt?.toDate(),
        playedAt: data.playedAt?.toDate(),
      } as QueueSong;
    });
    callback(songs);
  });
}

export function subscribeToPartyGuests(
  partyId: string,
  callback: (guests: PartyGuest[]) => void
): Unsubscribe {
  const q = collection(db, collections.parties, partyId, collections.partyGuests);
  
  return onSnapshot(q, (snapshot) => {
    const guests = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        guestId: doc.id,
        joinedAt: data.joinedAt?.toDate() || new Date(),
      } as PartyGuest;
    });
    callback(guests);
  });
}

// Favorite songs operations
export async function addFavoriteSong(
  userId: string,
  songData: Omit<FavoriteSong, 'songId' | 'addedAt'>
): Promise<string> {
  const docRef = await addDoc(
    collection(db, collections.users, userId, collections.favoriteSongs),
    {
      ...songData,
      addedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function getFavoriteSongs(userId: string): Promise<FavoriteSong[]> {
  const querySnapshot = await getDocs(
    collection(db, collections.users, userId, collections.favoriteSongs)
  );
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      songId: doc.id,
      addedAt: data.addedAt?.toDate() || new Date(),
    } as FavoriteSong;
  });
}

export async function removeFavoriteSong(userId: string, songId: string): Promise<void> {
  await deleteDoc(doc(db, collections.users, userId, collections.favoriteSongs, songId));
}

// Batch operations
export function createBatch(): WriteBatch {
  return writeBatch(db);
}

// Helper to decrement boosts
export async function decrementBoosts(partyId: string, guestId: string): Promise<void> {
  await updateDoc(
    doc(db, collections.parties, partyId, collections.partyGuests, guestId),
    {
      boostsRemaining: increment(-1),
    }
  );
} 