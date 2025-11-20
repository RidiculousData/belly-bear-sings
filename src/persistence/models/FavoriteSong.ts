import { DocumentData, query, where, orderBy, collection, getDocs, QueryDocumentSnapshot, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { BaseModel } from '../BaseModel';
import { db } from '@bellybearsings/firebase-config';

export interface FavoriteSongData {
  songId: string;
  userId: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnailUrl?: string;
  duration?: string;
  addedAt: Date;
  timesRequested: number;
  lastRequestedAt?: Date;
  tags: string[];
}

export class FavoriteSong extends BaseModel<FavoriteSongData> {
  protected collectionName = 'favoriteSongs';
  protected idField = 'songId';

  constructor(data?: Partial<FavoriteSongData>) {
    super(data);
  }

  // Override save method for correct subcollection path
  async save(): Promise<void> {
    if (!this.data.userId) {
      throw new Error('User ID is required for favorite songs');
    }
    
    await this.validate();
    const transformedData = this.transformForSave();
    
    if (this.id) {
      // Update existing document
      const docRef = doc(db, 'users', this.data.userId, 'favoriteSongs', this.id);
      await updateDoc(docRef, {
        ...transformedData,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new document
      const collectionRef = collection(db, 'users', this.data.userId, 'favoriteSongs');
      const docRef = await addDoc(collectionRef, {
        ...transformedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      (this.data as any)[this.idField] = docRef.id;
    }
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

  get userId(): string {
    return this.data.userId || '';
  }

  get thumbnailUrl(): string | undefined {
    return this.data.thumbnailUrl;
  }

  get duration(): string | undefined {
    return this.data.duration;
  }

  get timesRequested(): number {
    return this.data.timesRequested || 0;
  }

  get lastRequestedAt(): Date | undefined {
    return this.data.lastRequestedAt;
  }

  get tags(): string[] {
    return this.data.tags || [];
  }

  get displayTitle(): string {
    return `${this.title} - ${this.artist}`;
  }

  get isPopular(): boolean {
    return this.timesRequested >= 5;
  }

  get wasRecentlyRequested(): boolean {
    if (!this.lastRequestedAt) return false;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.lastRequestedAt > oneWeekAgo;
  }

  // Business logic methods
  markAsRequested(): void {
    this.update({
      timesRequested: this.timesRequested + 1,
      lastRequestedAt: new Date(),
    });
  }

  addTag(tag: string): void {
    const currentTags = this.tags;
    if (!currentTags.includes(tag.toLowerCase())) {
      this.update({
        tags: [...currentTags, tag.toLowerCase()],
      });
    }
  }

  removeTag(tag: string): void {
    const currentTags = this.tags;
    const filteredTags = currentTags.filter(t => t !== tag.toLowerCase());
    if (filteredTags.length !== currentTags.length) {
      this.update({ tags: filteredTags });
    }
  }

  updateMetadata(updates: {
    title?: string;
    artist?: string;
    thumbnailUrl?: string;
    duration?: string;
  }): void {
    this.update(updates);
  }

  // Validation
  protected async validate(): Promise<void> {
    if (!this.data.userId?.trim()) {
      throw new Error('User ID is required');
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
    if (this.data.timesRequested !== undefined && this.data.timesRequested < 0) {
      throw new Error('Times requested cannot be negative');
    }
  }

  protected transformForSave(): Record<string, any> {
    return {
      userId: this.data.userId,
      videoId: this.data.videoId,
      title: this.data.title,
      artist: this.data.artist,
      thumbnailUrl: this.data.thumbnailUrl,
      duration: this.data.duration,
      timesRequested: this.data.timesRequested || 0,
      lastRequestedAt: this.data.lastRequestedAt,
      tags: this.data.tags || [],
    };
  }

  protected transformFromFirestore(data: DocumentData, id: string): FavoriteSongData {
    return {
      songId: id,
      userId: data.userId || '',
      videoId: data.videoId || '',
      title: data.title || '',
      artist: data.artist || '',
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      addedAt: this.convertTimestamp(data.addedAt) || this.convertTimestamp(data.createdAt) || new Date(),
      timesRequested: data.timesRequested || 0,
      lastRequestedAt: this.convertTimestamp(data.lastRequestedAt),
      tags: data.tags || [],
    };
  }

  // Static factory methods
  static createNew(songData: {
    userId: string;
    videoId: string;
    title: string;
    artist: string;
    thumbnailUrl?: string;
    duration?: string;
    tags?: string[];
  }): FavoriteSong {
    return new FavoriteSong({
      ...songData,
      addedAt: new Date(),
      timesRequested: 0,
      tags: songData.tags || [],
    });
  }

  // FavoriteSong-specific query methods
  static async findByUser(userId: string): Promise<FavoriteSong[]> {
    const q = query(
      collection(db, 'users', userId, 'favoriteSongs'),
      orderBy('addedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const songs = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const instance = new FavoriteSong();
      const transformed = instance.transformFromFirestore(data, doc.id);
      return new FavoriteSong(transformed);
    });
    
    return songs;
  }

  static async findPopularByUser(userId: string): Promise<FavoriteSong[]> {
    const q = query(
      collection(db, 'users', userId, 'favoriteSongs'),
      where('timesRequested', '>=', 5),
      orderBy('timesRequested', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const songs = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const instance = new FavoriteSong();
      const transformed = instance.transformFromFirestore(data, doc.id);
      return new FavoriteSong(transformed);
    });
    
    return songs;
  }

  static async findByTag(userId: string, tag: string): Promise<FavoriteSong[]> {
    const q = query(
      collection(db, 'users', userId, 'favoriteSongs'),
      where('tags', 'array-contains', tag.toLowerCase()),
      orderBy('addedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const songs = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const instance = new FavoriteSong();
      const transformed = instance.transformFromFirestore(data, doc.id);
      return new FavoriteSong(transformed);
    });
    
    return songs;
  }

  static async findByVideoId(userId: string, videoId: string): Promise<FavoriteSong | null> {
    const q = query(
      collection(db, 'users', userId, 'favoriteSongs'),
      where('videoId', '==', videoId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const instance = new FavoriteSong();
    const transformed = instance.transformFromFirestore(data, doc.id);
    const song = new FavoriteSong(transformed);
    
    return song;
  }

  static async searchByTitle(userId: string, searchTerm: string): Promise<FavoriteSong[]> {
    
    // Note: Firestore doesn't support full-text search, so we get all songs and filter client-side
    // For production, consider using Algolia or similar for better search
    const allSongs = await this.findByUser(userId);
    const searchTermLower = searchTerm.toLowerCase();
    
    const filteredSongs = allSongs.filter(song => 
      song.title.toLowerCase().includes(searchTermLower) ||
      song.artist.toLowerCase().includes(searchTermLower)
    );
    
    return filteredSongs;
  }
} 