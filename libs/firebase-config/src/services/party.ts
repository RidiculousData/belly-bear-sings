import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { db, getEnvironment } from '../firebase';
import { Party } from '@bellybearsings/shared';

export interface QueuedSong {
  id: string;
  partyId: string;
  videoId: string;
  title: string;
  artist: string;
  requestedBy: {
    id: string;
    name: string;
    initials: string;
  };
  boosted: boolean;
  boostCount: number;
  addedAt: Timestamp;
  playedAt?: Timestamp;
  status: 'queued' | 'playing' | 'played' | 'skipped';
  praises: Array<{
    from: string;
    fromName: string;
    type: 'thumbsup' | 'heart' | 'fire' | 'star';
    timestamp: Timestamp;
  }>;
}

export interface SongHistory {
  id: string;
  userId: string;
  partyId: string;
  songId: string;
  title: string;
  artist: string;
  videoId: string;
  sungAt: Timestamp;
  praises: Array<{
    from: string;
    fromName: string;
    type: 'thumbsup' | 'heart' | 'fire' | 'star';
    timestamp: Timestamp;
  }>;
  totalPraises: {
    thumbsup: number;
    heart: number;
    fire: number;
    star: number;
  };
}

// Party management (multi-tenant)
export const createParty = async (hostId: string, name: string, settings: Party['settings']) => {
  const tenant = getEnvironment();
  const partyCode = generatePartyCode();
  
  const partyData: Omit<Party, 'partyId' | 'createdAt'> = {
    hostId,
    code: partyCode,
    name,
    isActive: true,
    participants: [hostId],
    settings,
  };
  
  const docRef = await addDoc(collection(db, 'tenants', tenant, 'parties'), {
    ...partyData,
    createdAt: serverTimestamp(),
  });
  
  return { 
    id: docRef.id, 
    ...partyData,
    createdAt: serverTimestamp() as Timestamp
  };
};

export const startParty = async (partyId: string) => {
  const tenant = getEnvironment();
  await updateDoc(doc(db, 'tenants', tenant, 'parties', partyId), {
    startedAt: serverTimestamp(),
  });
};

export const endParty = async (partyId: string) => {
  const tenant = getEnvironment();
  await updateDoc(doc(db, 'tenants', tenant, 'parties', partyId), {
    endedAt: serverTimestamp(),
  });
};

export const getPartyByCode = async (partyCode: string) => {
  // Use the firestore service which handles tenant-prefixed paths
  const { getPartyByCode: getPartyByCodeFromFirestore } = await import('./firestore');
  return await getPartyByCodeFromFirestore(partyCode);
};

export const joinParty = async (partyCode: string, userId: string, displayName?: string) => {
  const tenant = getEnvironment();
  const q = query(collection(db, 'tenants', tenant, 'parties'), where('code', '==', partyCode));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error('Party not found');
  }
  
  const partyDoc = snapshot.docs[0];
  const partyData = partyDoc.data() as Party;
  
  if (partyData.participants.length >= partyData.settings.maxParticipants) {
    throw new Error('Party is full');
  }
  
  // Add to participants array
  await updateDoc(partyDoc.ref, {
    participants: arrayUnion(userId),
  });
  
  // Also create a guest record if displayName is provided
  if (displayName) {
    await setDoc(doc(db, 'tenants', tenant, 'parties', partyDoc.id, 'partyGuests', userId), {
      guestId: userId,
      displayName: displayName,
      boostsRemaining: partyData.settings.boostsPerPerson,
      isAnonymous: false,
      isHost: false,
      joinedAt: serverTimestamp(),
    });
  }
  
  return { ...partyData, id: partyDoc.id };
};

// Song queue management (multi-tenant)
export const addSongToQueue = async (
  partyId: string,
  song: Omit<QueuedSong, 'id' | 'partyId' | 'addedAt' | 'status' | 'praises'>
) => {
  // Use the firestore service which handles tenant-prefixed paths
  const { addSongToQueue: addSongToQueueInFirestore } = await import('./firestore');
  const songId = await addSongToQueueInFirestore(partyId, {
    guestId: song.requestedBy.id,
    requesterName: song.requestedBy.name,
    youtubeVideoId: song.videoId,
    videoTitle: song.title,
    thumbnailUrl: '', // Will need to be provided
    duration: 0, // Will need to be provided
    isBoosted: false,
  });
  
  return {
    ...song,
    id: songId,
    partyId,
    addedAt: serverTimestamp() as Timestamp,
    status: 'queued' as const,
    praises: [],
  } as QueuedSong;
};

export const boostSong = async (songId: string, partyId: string) => {
  const tenant = getEnvironment();
  const songRef = doc(db, 'tenants', tenant, 'parties', partyId, 'queueSongs', songId);
  const songDoc = await getDoc(songRef);
  
  if (!songDoc.exists()) {
    throw new Error('Song not found');
  }
  
  await updateDoc(songRef, {
    isBoosted: true,
    boostedAt: serverTimestamp(),
  });
};

export const markSongAsPlaying = async (songId: string, partyId: string) => {
  const tenant = getEnvironment();
  await updateDoc(doc(db, 'tenants', tenant, 'parties', partyId, 'queueSongs', songId), {
    playedAt: serverTimestamp(),
  });
};

export const markSongAsPlayed = async (songId: string, partyId: string) => {
  // Songs are marked as played when playedAt is set
  // Additional status can be tracked if needed
  const tenant = getEnvironment();
  await updateDoc(doc(db, 'tenants', tenant, 'parties', partyId, 'queueSongs', songId), {
    playedAt: serverTimestamp(),
  });
};

export const markSongAsSkipped = async (songId: string, partyId: string) => {
  const tenant = getEnvironment();
  await updateDoc(doc(db, 'tenants', tenant, 'parties', partyId, 'queueSongs', songId), {
    playedAt: serverTimestamp(),
  });
};

// Praise management (multi-tenant)
// Note: Praise functionality can be added to QueueSong model if needed
export const addPraise = async (
  songId: string,
  partyId: string,
  praise: { from: string; fromName: string; type: 'thumbsup' | 'heart' | 'fire' | 'star' }
) => {
  // Praise functionality can be implemented by extending QueueSong model
  // For now, this is a placeholder
  console.warn('Praise functionality not yet implemented for multi-tenant architecture');
};

// Song history management (multi-tenant)
export const updateSongHistory = async (
  userId: string,
  song: QueuedSong,
  newPraise?: { from: string; fromName: string; type: 'thumbsup' | 'heart' | 'fire' | 'star' }
) => {
  const tenant = getEnvironment();
  const historyRef = doc(collection(db, 'tenants', tenant, 'songHistory'));
  const historyData: SongHistory = {
    id: historyRef.id,
    userId,
    partyId: song.partyId,
    songId: song.id,
    title: song.title,
    artist: song.artist,
    videoId: song.videoId,
    sungAt: song.playedAt || (serverTimestamp() as Timestamp),
    praises: song.praises,
    totalPraises: {
      thumbsup: song.praises.filter(p => p.type === 'thumbsup').length,
      heart: song.praises.filter(p => p.type === 'heart').length,
      fire: song.praises.filter(p => p.type === 'fire').length,
      star: song.praises.filter(p => p.type === 'star').length,
    },
  };
  
  if (newPraise) {
    historyData.praises.push({
      ...newPraise,
      timestamp: serverTimestamp() as Timestamp,
    });
    historyData.totalPraises[newPraise.type]++;
  }
  
  await setDoc(historyRef, historyData);
};

export const getUserSongHistory = async (userId: string) => {
  const tenant = getEnvironment();
  const q = query(
    collection(db, 'tenants', tenant, 'songHistory'),
    where('userId', '==', userId),
    orderBy('sungAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SongHistory));
};

// Real-time subscriptions
export const subscribeToPartyQueue = (
  partyId: string,
  callback: (songs: QueuedSong[]) => void
) => {
  const tenant = getEnvironment();
  const q = query(
    collection(db, 'tenants', tenant, 'parties', partyId, 'queueSongs'),
    orderBy('isBoosted', 'desc'),
    orderBy('addedAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const queueSongs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        partyId: partyId,
        videoId: data.youtubeVideoId || '',
        title: data.videoTitle || '',
        artist: '', // Will need to be added to QueueSong model
        requestedBy: {
          id: data.guestId || '',
          name: data.requesterName || '',
          initials: (data.requesterName || '').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        },
        boosted: data.isBoosted || false,
        boostCount: data.isBoosted ? 1 : 0,
        addedAt: data.addedAt?.toDate() ? Timestamp.fromDate(data.addedAt.toDate()) : serverTimestamp() as Timestamp,
        playedAt: data.playedAt?.toDate() ? Timestamp.fromDate(data.playedAt.toDate()) : undefined,
        status: data.playedAt ? 'played' as const : 'queued' as const,
        praises: [], // Can be added to QueueSong model if needed
      } as QueuedSong;
    });
    callback(queueSongs);
  }, (error) => {
    // Handle permission errors gracefully
    if (error.code === 'permission-denied') {
      console.warn(`Permission denied for party queue subscription (partyId: ${partyId}):`, error.message);
      callback([]);
    } else {
      console.error(`Error in party queue snapshot listener (partyId: ${partyId}):`, error);
    }
  });
};

export const subscribeToPartyParticipants = (
  partyId: string,
  callback: (participants: string[]) => void
) => {
  const tenant = getEnvironment();
  return onSnapshot(doc(db, 'tenants', tenant, 'parties', partyId), (doc) => {
    if (doc.exists()) {
      const party = doc.data() as Party;
      callback(party.participants);
    } else {
      callback([]);
    }
  }, (error) => {
    // Handle permission errors gracefully
    if (error.code === 'permission-denied') {
      console.warn(`Permission denied for party participants subscription (partyId: ${partyId}):`, error.message);
      callback([]);
    } else {
      console.error(`Error in party participants snapshot listener (partyId: ${partyId}):`, error);
    }
  });
};

// Helper functions
const generatePartyCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}; 