import { DocumentData, where, orderBy } from 'firebase/firestore';
import { BaseModel } from '../BaseModel';

export interface PartyData {
  partyId: string;
  name: string;
  hostId: string;
  code: string;
  status: 'active' | 'paused' | 'ended';
  participants: string[];
  maxParticipants?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export class Party extends BaseModel<PartyData> {
  protected collectionName = 'parties';
  protected idField = 'partyId';

  constructor(data?: Partial<PartyData>) {
    super(data);
  }

  // Getters
  get name(): string {
    return this.data.name || '';
  }

  get hostId(): string {
    return this.data.hostId || '';
  }

  get code(): string {
    return this.data.code || '';
  }

  get status(): 'active' | 'paused' | 'ended' {
    return this.data.status || 'active';
  }

  get participants(): string[] {
    return this.data.participants || [];
  }

  get participantCount(): number {
    return this.participants.length;
  }

  get isActive(): boolean {
    return this.status === 'active';
  }

  get hasStarted(): boolean {
    return !!this.data.startedAt;
  }

  get hasEnded(): boolean {
    return !!this.data.endedAt;
  }

  // Business logic methods
  start(): void {
    if (this.hasStarted) {
      throw new Error('Party has already started');
    }
    this.update({
      status: 'active',
      startedAt: new Date(),
    });
  }

  pause(): void {
    if (!this.isActive) {
      throw new Error('Can only pause active parties');
    }
    this.update({ status: 'paused' });
  }

  resume(): void {
    if (this.status !== 'paused') {
      throw new Error('Can only resume paused parties');
    }
    this.update({ status: 'active' });
  }

  end(): void {
    if (this.hasEnded) {
      throw new Error('Party has already ended');
    }
    this.update({
      status: 'ended',
      endedAt: new Date(),
    });
  }

  addParticipant(userId: string): void {
    if (this.participants.includes(userId)) {
      throw new Error('User is already a participant');
    }
    if (this.data.maxParticipants && this.participantCount >= this.data.maxParticipants) {
      throw new Error('Party is at maximum capacity');
    }
    this.update({
      participants: [...this.participants, userId],
    });
  }

  removeParticipant(userId: string): void {
    if (!this.participants.includes(userId)) {
      throw new Error('User is not a participant');
    }
    if (userId === this.hostId) {
      throw new Error('Cannot remove the host');
    }
    this.update({
      participants: this.participants.filter(id => id !== userId),
    });
  }

  updateDetails(updates: {
    name?: string;
    description?: string;
    maxParticipants?: number;
  }): void {
    this.update(updates);
  }

  // Validation
  protected async validate(): Promise<void> {
    if (!this.data.name?.trim()) {
      throw new Error('Party name is required');
    }
    if (!this.data.hostId?.trim()) {
      throw new Error('Host ID is required');
    }
    if (!this.data.code?.trim()) {
      throw new Error('Party code is required');
    }
    if (this.data.maxParticipants && this.data.maxParticipants < 1) {
      throw new Error('Maximum participants must be at least 1');
    }
  }

  protected transformForSave(): Record<string, any> {
    return {
      name: this.data.name,
      hostId: this.data.hostId,
      code: this.data.code,
      status: this.data.status,
      participants: this.data.participants || [],
      maxParticipants: this.data.maxParticipants,
      description: this.data.description,
      startedAt: this.data.startedAt,
      endedAt: this.data.endedAt,
    };
  }

  protected transformFromFirestore(data: DocumentData, id: string): PartyData {
    return {
      partyId: id,
      name: data.name || '',
      hostId: data.hostId || '',
      code: data.code || '',
      status: data.status || 'active',
      participants: data.participants || [],
      maxParticipants: data.maxParticipants,
      description: data.description,
      createdAt: this.convertTimestamp(data.createdAt) || new Date(),
      updatedAt: this.convertTimestamp(data.updatedAt) || new Date(),
      startedAt: this.convertTimestamp(data.startedAt),
      endedAt: this.convertTimestamp(data.endedAt),
    };
  }

  // Static factory methods
  /**
   * Creates a new Party instance with generated code and default values.
   * Note: You must call save() on the returned instance to persist it to the database.
   * @example
   * const party = Party.createNew({ name: 'My Party', hostId: 'user123' });
   * await party.save(); // This saves to the database
   */
  static createNew(partyData: {
    name: string;
    hostId: string;
    description?: string;
    maxParticipants?: number;
  }): Party {
    const code = this.generatePartyCode();
    return new Party({
      ...partyData,
      code,
      status: 'active',
      participants: [partyData.hostId],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Party-specific query methods
  static async getPartyById(partyId: string): Promise<Party | null> {
    return this.find(partyId);
  }

  static async findByCode(code: string): Promise<Party | null> {
    const parties = await this.findWhere('code', '==', code);
    const found = parties.length > 0 ? parties[0] : null;
    if (found) {
    } else {
    }
    return found;
  }

  static async findByHost(hostId: string): Promise<Party[]> {
    return this.findWhere('hostId', '==', hostId);
  }

  static async findActiveParties(): Promise<Party[]> {
    return this.findAll([where('status', '==', 'active'), orderBy('createdAt', 'desc')]);
  }

  // Helper methods
  private static generatePartyCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
} 