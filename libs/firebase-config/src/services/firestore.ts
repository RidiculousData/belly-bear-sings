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
import { db, getEnvironmentCollectionPath, getEnvironment } from '../firebase';
import { User, Party, PartyGuest, QueueSong, FavoriteSong } from '@bellybearsings/shared';

// Collection references (base names, will be prefixed with environment)
export const collections = {
  users: 'users',
  parties: 'parties',
  partyGuests: 'partyGuests',
  queueSongs: 'queueSongs',
  favoriteSongs: 'favoriteSongs',
};

// User operations (multi-tenant)
export async function createUser(userId: string, userData: Omit<User, 'userId' | 'createdAt'>): Promise<void> {
  const tenant = getEnvironment();
  await setDoc(doc(db, 'tenants', tenant, collections.users, userId), {
    ...userData,
    userId,
    createdAt: serverTimestamp(),
  });
}

export async function getUser(userId: string): Promise<User | null> {
  const tenant = getEnvironment();
  const docSnap = await getDoc(doc(db, 'tenants', tenant, collections.users, userId));
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
  const tenant = getEnvironment();
  await updateDoc(doc(db, 'tenants', tenant, collections.users, userId), updates);
}

// Party operations (multi-tenant)
export async function createParty(partyData: Omit<Party, 'partyId' | 'createdAt' | 'code' | 'participants'>): Promise<string> {
  const partyCode = generatePartyCode();
  const tenant = getEnvironment();
  const docRef = await addDoc(collection(db, 'tenants', tenant, collections.parties), {
    ...partyData,
    code: partyCode,
    participants: [partyData.hostId],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Helper function to generate party codes
function generatePartyCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getParty(partyId: string): Promise<Party | null> {
  const tenant = getEnvironment();
  const docSnap = await getDoc(doc(db, 'tenants', tenant, collections.parties, partyId));
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...(data as Omit<Party, 'partyId' | 'createdAt' | 'startedAt' | 'endedAt'>),
      partyId,
      createdAt: data.createdAt?.toDate() || new Date(),
      startedAt: data.startedAt?.toDate(),
      endedAt: data.endedAt?.toDate(),
    } as Party;
  }
  return null;
}

export async function getPartyByCode(partyCode: string): Promise<Party | null> {
  const tenant = getEnvironment();
  const q = query(collection(db, 'tenants', tenant, collections.parties), where('code', '==', partyCode));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();
  return {
    ...(data as Omit<Party, 'partyId' | 'createdAt' | 'startedAt' | 'endedAt'>),
    partyId: docSnap.id,
    createdAt: data.createdAt?.toDate() || new Date(),
    startedAt: data.startedAt?.toDate(),
    endedAt: data.endedAt?.toDate(),
  } as Party;
}

export async function updateParty(partyId: string, updates: Partial<Party>): Promise<void> {
  const tenant = getEnvironment();
  await updateDoc(doc(db, 'tenants', tenant, collections.parties, partyId), updates);
}

// Party guest operations (multi-tenant)
export async function addPartyGuest(
  partyId: string,
  guestId: string,
  guestData: Omit<PartyGuest, 'guestId' | 'joinedAt'>
): Promise<void> {
  const tenant = getEnvironment();
  await setDoc(
    doc(db, 'tenants', tenant, 'parties', partyId, collections.partyGuests, guestId),
    {
      ...guestData,
      guestId,
      joinedAt: serverTimestamp(),
    }
  );
}

export async function getPartyGuests(partyId: string): Promise<PartyGuest[]> {
  const tenant = getEnvironment();
  const querySnapshot = await getDocs(
    collection(db, 'tenants', tenant, 'parties', partyId, collections.partyGuests)
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

// Queue operations (multi-tenant)
export async function addSongToQueue(
  partyId: string,
  songData: Omit<QueueSong, 'songId' | 'addedAt'>
): Promise<string> {
  const tenant = getEnvironment();
  const docRef = await addDoc(
    collection(db, 'tenants', tenant, 'parties', partyId, collections.queueSongs),
    {
      ...songData,
      addedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function getQueueSongs(partyId: string): Promise<QueueSong[]> {
  const tenant = getEnvironment();
  const querySnapshot = await getDocs(
    collection(db, 'tenants', tenant, 'parties', partyId, collections.queueSongs)
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
  const tenant = getEnvironment();
  await updateDoc(
    doc(db, 'tenants', tenant, 'parties', partyId, collections.queueSongs, songId),
    updates
  );
}

export async function removeSongFromQueue(partyId: string, songId: string): Promise<void> {
  const tenant = getEnvironment();
  await deleteDoc(doc(db, 'tenants', tenant, 'parties', partyId, collections.queueSongs, songId));
}

// Real-time subscriptions (multi-tenant)
export function subscribeToQueue(
  partyId: string,
  callback: (songs: QueueSong[]) => void
): Unsubscribe {
  const tenant = getEnvironment();
  const q = query(
    collection(db, 'tenants', tenant, 'parties', partyId, collections.queueSongs),
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
  }, (error) => {
    // Handle permission errors gracefully
    if (error.code === 'permission-denied') {
      console.warn(`Permission denied for queue subscription (partyId: ${partyId}):`, error.message);
      callback([]);
    } else {
      console.error(`Error in queue snapshot listener (partyId: ${partyId}):`, error);
    }
  });
}

export function subscribeToPartyGuests(
  partyId: string,
  callback: (guests: PartyGuest[]) => void
): Unsubscribe {
  const tenant = getEnvironment();
  const q = collection(db, 'tenants', tenant, 'parties', partyId, collections.partyGuests);
  
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
  }, (error) => {
    // Handle permission errors gracefully
    if (error.code === 'permission-denied') {
      console.warn(`Permission denied for party guests subscription (partyId: ${partyId}):`, error.message);
      callback([]);
    } else {
      console.error(`Error in party guests snapshot listener (partyId: ${partyId}):`, error);
    }
  });
}

// Favorite songs operations (multi-tenant)
export async function addFavoriteSong(
  userId: string,
  songData: Omit<FavoriteSong, 'songId' | 'addedAt'>
): Promise<string> {
  const tenant = getEnvironment();
  const docRef = await addDoc(
    collection(db, 'tenants', tenant, 'users', userId, collections.favoriteSongs),
    {
      ...songData,
      addedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function getFavoriteSongs(userId: string): Promise<FavoriteSong[]> {
  const tenant = getEnvironment();
  const querySnapshot = await getDocs(
    collection(db, 'tenants', tenant, 'users', userId, collections.favoriteSongs)
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
  const tenant = getEnvironment();
  await deleteDoc(doc(db, 'tenants', tenant, 'users', userId, collections.favoriteSongs, songId));
}

// Batch operations
export function createBatch(): WriteBatch {
  return writeBatch(db);
}

// Helper to decrement boosts (multi-tenant)
export async function decrementBoosts(partyId: string, guestId: string): Promise<void> {
  const tenant = getEnvironment();
  await updateDoc(
    doc(db, 'tenants', tenant, 'parties', partyId, collections.partyGuests, guestId),
    {
      boostsRemaining: increment(-1),
    }
  );
} 