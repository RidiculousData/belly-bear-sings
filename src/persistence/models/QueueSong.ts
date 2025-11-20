import { DocumentData, query, where, orderBy, collection, doc, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { BaseModel } from '../BaseModel';
import { db } from '@bellybearsings/firebase-config';

export interface QueueSongData {
  songId: string;
  partyId: string;
  videoId: string;
  title: string;
  artist: string;
  requestedBy: {
    id: string;
    name: string;
    initials: string;
    avatar?: string;
  };
  boosted: boolean;
  boostCount: number;
  status: 'queued' | 'playing' | 'played' | 'skipped';
  addedAt: Date;
  boostedAt?: Date;
  playedAt?: Date;
  praises: Array<{
    from: string;
    fromName: string;
    type: 'thumbsup' | 'heart' | 'fire' | 'star';
    timestamp: Date;
  }>;
}

export class QueueSong extends BaseModel<QueueSongData> {
  protected collectionName = 'queueSongs';
  protected idField = 'songId';

  constructor(data?: Partial<QueueSongData>) {
    super(data);
  }

  // Override collection path for subcollection
  protected getCollectionRef() {
    if (!this.data.partyId) {
      throw new Error('Party ID is required for queue songs');
    }
    return collection(db, 'parties', this.data.partyId, 'queueSongs');
  }

  // Getters
  get title(): string {
    return this.data.title || '';
  }

  get artist(): string {
    return this.data.artist || '';
  }

  get videoId(): string {
    return this.data.videoId || '';
  }

  get partyId(): string {
    return this.data.partyId || '';
  }

  get requestedBy(): QueueSongData['requestedBy'] | undefined {
    return this.data.requestedBy;
  }

  get boosted(): boolean {
    return this.data.boosted || false;
  }

  get status(): QueueSongData['status'] {
    return this.data.status || 'queued';
  }

  get isQueued(): boolean {
    return this.status === 'queued';
  }

  get isPlaying(): boolean {
    return this.status === 'playing';
  }

  get hasBeenPlayed(): boolean {
    return this.status === 'played';
  }

  get praises(): QueueSongData['praises'] {
    return this.data.praises || [];
  }

  get praiseCount(): number {
    return this.praises.length;
  }

  // Business logic methods
  boost(): void {
    if (this.boosted) {
      throw new Error('Song is already boosted');
    }
    if (this.status !== 'queued') {
      throw new Error('Can only boost queued songs');
    }
    this.update({
      boosted: true,
      boostCount: (this.data.boostCount || 0) + 1,
      boostedAt: new Date(),
    });
  }

  unboost(): void {
    if (!this.boosted) {
      throw new Error('Song is not boosted');
    }
    this.update({
      boosted: false,
      boostCount: Math.max(0, (this.data.boostCount || 0) - 1),
    });
  }

  markAsPlaying(): void {
    if (this.status !== 'queued') {
      throw new Error('Can only start playing queued songs');
    }
    this.update({ status: 'playing' });
  }

  markAsPlayed(): void {
    if (this.status !== 'playing') {
      throw new Error('Can only mark playing songs as played');
    }
    this.update({
      status: 'played',
      playedAt: new Date(),
    });
  }

  skip(): void {
    if (this.status === 'played' || this.status === 'skipped') {
      throw new Error('Song has already been played or skipped');
    }
    this.update({ status: 'skipped' });
  }

  addPraise(praise: {
    from: string;
    fromName: string;
    type: 'thumbsup' | 'heart' | 'fire' | 'star';
  }): void {
    // Check if user already praised this song
    const existingPraise = this.praises.find(p => p.from === praise.from);
    if (existingPraise) {
      throw new Error('User has already praised this song');
    }

    const newPraise = {
      ...praise,
      timestamp: new Date(),
    };

    this.update({
      praises: [...this.praises, newPraise],
    });
  }

  removePraise(userId: string): void {
    const filteredPraises = this.praises.filter(p => p.from !== userId);
    if (filteredPraises.length === this.praises.length) {
      throw new Error('User has not praised this song');
    }
    this.update({ praises: filteredPraises });
  }

  // Validation
  protected async validate(): Promise<void> {
    if (!this.data.partyId?.trim()) {
      throw new Error('Party ID is required');
    }
    if (!this.data.videoId?.trim()) {
      throw new Error('Video ID is required');
    }
    if (!this.data.title?.trim()) {
      throw new Error('Song title is required');
    }
    if (!this.data.artist?.trim()) {
      throw new Error('Artist name is required');
    }
    if (!this.data.requestedBy?.id?.trim()) {
      throw new Error('Requested by user ID is required');
    }
  }

  protected transformForSave(): Record<string, any> {
    return {
      partyId: this.data.partyId,
      videoId: this.data.videoId,
      title: this.data.title,
      artist: this.data.artist,
      requestedBy: this.data.requestedBy,
      boosted: this.data.boosted || false,
      boostCount: this.data.boostCount || 0,
      status: this.data.status || 'queued',
      boostedAt: this.data.boostedAt,
      playedAt: this.data.playedAt,
      praises: this.data.praises || [],
    };
  }

  protected transformFromFirestore(data: DocumentData, id: string): QueueSongData {
    return {
      songId: id,
      partyId: data.partyId || '',
      videoId: data.videoId || '',
      title: data.title || '',
      artist: data.artist || '',
      requestedBy: data.requestedBy || { id: '', name: '', initials: '' },
      boosted: data.boosted || false,
      boostCount: data.boostCount || 0,
      status: data.status || 'queued',
      addedAt: this.convertTimestamp(data.addedAt) || new Date(),
      boostedAt: this.convertTimestamp(data.boostedAt),
      playedAt: this.convertTimestamp(data.playedAt),
      praises: (data.praises || []).map((praise: any) => ({
        ...praise,
        timestamp: this.convertTimestamp(praise.timestamp) || new Date(),
      })),
    };
  }

  // Static factory methods
  static createNew(songData: {
    partyId: string;
    videoId: string;
    title: string;
    artist: string;
    requestedBy: {
      id: string;
      name: string;
      initials: string;
      avatar?: string;
    };
  }): QueueSong {
    return new QueueSong({
      ...songData,
      boosted: false,
      boostCount: 0,
      status: 'queued',
      addedAt: new Date(),
      praises: [],
    });
  }

  // Party-specific query methods
  static async findByParty(partyId: string): Promise<QueueSong[]> {
    const q = query(
      collection(db, 'parties', partyId, 'queueSongs'),
      orderBy('boosted', 'desc'),
      orderBy('addedAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const instance = new QueueSong();
      const transformed = instance.transformFromFirestore(data, doc.id);
      return new QueueSong(transformed);
    });
  }

  static async findQueuedByParty(partyId: string): Promise<QueueSong[]> {
    const q = query(
      collection(db, 'parties', partyId, 'queueSongs'),
      where('status', '==', 'queued'),
      orderBy('boosted', 'desc'),
      orderBy('addedAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const instance = new QueueSong();
      const transformed = instance.transformFromFirestore(data, doc.id);
      return new QueueSong(transformed);
    });
  }

  static async findBoostedByParty(partyId: string): Promise<QueueSong[]> {
    const q = query(
      collection(db, 'parties', partyId, 'queueSongs'),
      where('boosted', '==', true),
      orderBy('addedAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const instance = new QueueSong();
      const transformed = instance.transformFromFirestore(data, doc.id);
      return new QueueSong(transformed);
    });
  }
} 