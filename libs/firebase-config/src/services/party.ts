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
import { db } from '../firebase';

export interface Party {
  id: string;
  hostId: string;
  code: string;
  name: string;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  participants: string[];
  settings: {
    maxParticipants: number;
    allowDuplicates: boolean;
    requireApproval: boolean;
    boostsPerPerson: number;
    maxSongsPerPerson: number;
  };
}

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

// Party management
export const createParty = async (hostId: string, name: string, settings: Party['settings']) => {
  const partyCode = generatePartyCode();
  const partyData: Omit<Party, 'id'> = {
    hostId,
    code: partyCode,
    name,
    createdAt: serverTimestamp() as Timestamp,
    participants: [hostId],
    settings,
  };
  
  const docRef = await addDoc(collection(db, 'parties'), partyData);
  return { id: docRef.id, ...partyData };
};

export const startParty = async (partyId: string) => {
  await updateDoc(doc(db, 'parties', partyId), {
    startedAt: serverTimestamp(),
  });
};

export const endParty = async (partyId: string) => {
  await updateDoc(doc(db, 'parties', partyId), {
    endedAt: serverTimestamp(),
  });
};

export const joinParty = async (partyCode: string, userId: string) => {
  const q = query(collection(db, 'parties'), where('code', '==', partyCode));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error('Party not found');
  }
  
  const partyDoc = snapshot.docs[0];
  const partyData = partyDoc.data() as Party;
  
  if (partyData.participants.length >= partyData.settings.maxParticipants) {
    throw new Error('Party is full');
  }
  
  await updateDoc(partyDoc.ref, {
    participants: arrayUnion(userId),
  });
  
  return { ...partyData, id: partyDoc.id };
};

// Song queue management
export const addSongToQueue = async (
  partyId: string,
  song: Omit<QueuedSong, 'id' | 'partyId' | 'addedAt' | 'status' | 'praises'>
) => {
  const songData = {
    ...song,
    partyId,
    addedAt: serverTimestamp() as Timestamp,
    status: 'queued' as const,
    praises: [],
  };
  
  const docRef = await addDoc(collection(db, 'queuedSongs'), songData);
  return { ...songData, id: docRef.id } as QueuedSong;
};

export const boostSong = async (songId: string) => {
  const songRef = doc(db, 'queuedSongs', songId);
  const songDoc = await getDoc(songRef);
  
  if (!songDoc.exists()) {
    throw new Error('Song not found');
  }
  
  const currentBoostCount = songDoc.data().boostCount || 0;
  
  await updateDoc(songRef, {
    boosted: true,
    boostCount: currentBoostCount + 1,
  });
};

export const markSongAsPlaying = async (songId: string) => {
  await updateDoc(doc(db, 'queuedSongs', songId), {
    status: 'playing',
    playedAt: serverTimestamp(),
  });
};

export const markSongAsPlayed = async (songId: string) => {
  await updateDoc(doc(db, 'queuedSongs', songId), {
    status: 'played',
  });
};

export const markSongAsSkipped = async (songId: string) => {
  await updateDoc(doc(db, 'queuedSongs', songId), {
    status: 'skipped',
  });
};

// Praise management
export const addPraise = async (
  songId: string,
  praise: { from: string; fromName: string; type: 'thumbsup' | 'heart' | 'fire' | 'star' }
) => {
  const songRef = doc(db, 'queuedSongs', songId);
  await updateDoc(songRef, {
    praises: arrayUnion({
      ...praise,
      timestamp: serverTimestamp(),
    }),
  });
  
  // Also update the user's song history
  const songDoc = await getDoc(songRef);
  if (songDoc.exists()) {
    const songData = songDoc.data() as QueuedSong;
    await updateSongHistory(songData.requestedBy.id, songData, praise);
  }
};

// Song history management
export const updateSongHistory = async (
  userId: string,
  song: QueuedSong,
  newPraise?: { from: string; fromName: string; type: 'thumbsup' | 'heart' | 'fire' | 'star' }
) => {
  const historyRef = doc(collection(db, 'songHistory'));
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
  const q = query(
    collection(db, 'songHistory'),
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
  const q = query(
    collection(db, 'queuedSongs'),
    where('partyId', '==', partyId),
    where('status', 'in', ['queued', 'playing']),
    orderBy('boosted', 'desc'),
    orderBy('addedAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QueuedSong));
    callback(songs);
  });
};

export const subscribeToPartyParticipants = (
  partyId: string,
  callback: (participants: string[]) => void
) => {
  return onSnapshot(doc(db, 'parties', partyId), (doc) => {
    if (doc.exists()) {
      const party = doc.data() as Party;
      callback(party.participants);
    }
  });
};

// Helper functions
const generatePartyCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PARTY-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}; 