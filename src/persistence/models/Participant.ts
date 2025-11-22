import { DocumentData, query, where, orderBy, collection, getDocs, QueryDocumentSnapshot, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { BaseModel } from '../BaseModel';
import { db } from '@bellybearsings/firebase-config';

export type Role = 'HOST' | 'GUEST';

export interface ParticipantData {
    guestId: string;
    partyId: string;
    userId: string;
    displayName: string;
    email?: string;
    profilePicture?: string;
    role: Role;
    score: number;
    boostsRemaining: number;
    isAnonymous: boolean;
    joinedAt: Date;
    leftAt?: Date;
}

export class Participant extends BaseModel<ParticipantData> {
    protected collectionName = 'participants';
    protected idField = 'guestId';

    constructor(data?: Partial<ParticipantData>) {
        super(data);
    }

    // Override save method for correct subcollection path
    async save(): Promise<void> {
        if (!this.data.partyId) {
            throw new Error('Party ID is required for participants');
        }

        await this.validate();
        const transformedData = this.transformForSave();

        if (this.id) {
            // Update existing document
            const docRef = doc(db, 'parties', this.data.partyId, 'participants', this.id);
            await updateDoc(docRef, {
                ...transformedData,
                updatedAt: serverTimestamp(),
            });
        } else {
            // Create new document
            const collectionRef = collection(db, 'parties', this.data.partyId, 'participants');
            const docRef = await addDoc(collectionRef, {
                ...transformedData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            (this.data as any)[this.idField] = docRef.id;
        }
    }

    // Getters
    get displayName(): string {
        return this.data.displayName || '';
    }

    get email(): string | undefined {
        return this.data.email;
    }

    get isAnonymous(): boolean {
        return this.data.isAnonymous || false;
    }

    get userId(): string {
        return this.data.userId || '';
    }

    get partyId(): string {
        return this.data.partyId || '';
    }

    get role(): Role {
        return this.data.role || 'GUEST';
    }

    get isHost(): boolean {
        return this.role === 'HOST';
    }

    get score(): number {
        return this.data.score || 0;
    }

    get boostsRemaining(): number {
        return this.data.boostsRemaining || 0;
    }

    get hasBoostsLeft(): boolean {
        return this.boostsRemaining > 0;
    }

    get profilePicture(): string | undefined {
        return this.data.profilePicture;
    }

    get initials(): string {
        const names = this.displayName.split(' ');
        const first = names[0]?.charAt(0).toUpperCase() || '';
        const last = names[1]?.charAt(0).toUpperCase() || '';
        return `${first}${last}`;
    }

    get leftAt(): Date | undefined {
        return this.data.leftAt;
    }

    // Business logic methods
    useBoost(): void {
        if (!this.hasBoostsLeft) {
            throw new Error('No boosts remaining');
        }
        this.update({
            boostsRemaining: this.boostsRemaining - 1,
        });
    }

    addBoosts(count: number = 1): void {
        this.update({
            boostsRemaining: this.boostsRemaining + count,
        });
    }

    leave(): void {
        if (this.data.leftAt) {
            throw new Error('Participant has already left');
        }
        this.update({
            leftAt: new Date(),
        });
    }

    rejoin(): void {
        if (!this.data.leftAt) {
            throw new Error('Participant has not left');
        }
        this.update({
            leftAt: undefined,
        });
    }

    // Validation
    protected async validate(): Promise<void> {
        if (!this.data.partyId?.trim()) {
            throw new Error('Party ID is required');
        }
        if (!this.data.userId?.trim()) {
            throw new Error('User ID is required');
        }
        if (!this.data.displayName?.trim()) {
            throw new Error('Display name is required');
        }
        // Email is only required for non-anonymous users
        if (!this.data.isAnonymous && !this.data.email?.trim()) {
            throw new Error('Email is required for authenticated users');
        }
        if (this.data.boostsRemaining !== undefined && this.data.boostsRemaining < 0) {
            throw new Error('Boosts remaining cannot be negative');
        }
    }

    protected transformForSave(): Record<string, any> {
        const data: Record<string, any> = {
            partyId: this.data.partyId,
            userId: this.data.userId,
            displayName: this.data.displayName,
            profilePicture: this.data.profilePicture,
            role: this.data.role || 'GUEST',
            score: this.data.score || 0,
            boostsRemaining: this.data.boostsRemaining || 3, // Default 3 boosts
            isAnonymous: this.data.isAnonymous || false,
            leftAt: this.data.leftAt,
        };
        // Only include email if it exists (not for anonymous users)
        if (this.data.email) {
            data.email = this.data.email;
        }
        return data;
    }

    protected transformFromFirestore(data: DocumentData, id: string): ParticipantData {
        return {
            guestId: id,
            partyId: data.partyId || '',
            userId: data.userId || '',
            displayName: data.displayName || '',
            email: data.email, // Optional for anonymous users
            profilePicture: data.profilePicture,
            role: data.role || (data.isHost ? 'HOST' : 'GUEST'), // Backward compatibility
            score: data.score || 0,
            boostsRemaining: data.boostsRemaining || 3,
            isAnonymous: data.isAnonymous || false,
            joinedAt: this.convertTimestamp(data.joinedAt) || this.convertTimestamp(data.createdAt) || new Date(),
            leftAt: this.convertTimestamp(data.leftAt),
        };
    }

    // Static factory methods
    static createNew(participantData: {
        partyId: string;
        userId: string;
        displayName: string;
        email?: string;
        profilePicture?: string;
        role?: Role;
        score?: number;
        boostsRemaining?: number;
        isAnonymous?: boolean;
    }): Participant {
        return new Participant({
            ...participantData,
            role: participantData.role || 'GUEST',
            score: participantData.score || 0,
            boostsRemaining: participantData.boostsRemaining || 3,
            isAnonymous: participantData.isAnonymous || false,
            joinedAt: new Date(),
        });
    }

    // Participant-specific query methods
    static async findByParty(partyId: string): Promise<Participant[]> {
        const q = query(
            collection(db, 'parties', partyId, 'participants'),
            orderBy('joinedAt', 'asc')
        );
        const querySnapshot = await getDocs(q);

        const participants = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            const instance = new Participant();
            const transformed = instance.transformFromFirestore(data, doc.id);
            return new Participant(transformed);
        });

        return participants;
    }

    static async findActiveByParty(partyId: string): Promise<Participant[]> {
        const q = query(
            collection(db, 'parties', partyId, 'participants'),
            where('leftAt', '==', null),
            orderBy('joinedAt', 'asc')
        );
        const querySnapshot = await getDocs(q);

        const participants = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            const instance = new Participant();
            const transformed = instance.transformFromFirestore(data, doc.id);
            return new Participant(transformed);
        });

        return participants;
    }

    static async findByUserAndParty(userId: string, partyId: string): Promise<Participant | null> {
        const q = query(
            collection(db, 'parties', partyId, 'participants'),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const instance = new Participant();
        const transformed = instance.transformFromFirestore(data, doc.id);
        const participant = new Participant(transformed);

        return participant;
    }
}
