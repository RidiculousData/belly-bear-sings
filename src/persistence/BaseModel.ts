import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  Unsubscribe,
  FirestoreError,
} from 'firebase/firestore';
import { db, getTenantCollectionPath, getEnvironment } from '@bellybearsings/firebase-config';

export abstract class BaseModel<T extends Record<string, any>> {
  protected abstract collectionName: string;
  protected abstract idField: string;
  protected data: Partial<T> = {};
  
  constructor(data?: Partial<T>) {
    if (data) {
      this.data = { ...data };
    }
  }

  /**
   * Get the full collection path with tenant prefix (multi-tenancy)
   */
  protected getCollectionPath(): string {
    return getTenantCollectionPath(this.collectionName);
  }

  /**
   * Get the current tenant
   */
  protected getTenant(): string {
    return getEnvironment();
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract validate(): Promise<void>;
  protected abstract transformForSave(): Record<string, any>;
  protected abstract transformFromFirestore(data: DocumentData, id: string): T;

  // Getters and setters
  get id(): string | undefined {
    return this.data[this.idField as keyof T] as string;
  }

  get attributes(): Partial<T> {
    return { ...this.data };
  }

  // Instance methods
  async save(): Promise<void> {
    await this.validate();
    const transformedData = this.transformForSave();
    const collectionPath = this.getCollectionPath();
    
    if (this.id) {
      // Update existing document
      await updateDoc(doc(db, collectionPath, this.id), {
        ...transformedData,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new document
      const docRef = await addDoc(collection(db, collectionPath), {
        ...transformedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      this.data[this.idField as keyof T] = docRef.id as T[keyof T];
    }
  }

  async delete(): Promise<void> {
    if (!this.id) {
      throw new Error('Cannot delete model without ID');
    }
    const collectionPath = this.getCollectionPath();
    await deleteDoc(doc(db, collectionPath, this.id));
  }

  async reload(): Promise<void> {
    if (!this.id) {
      throw new Error('Cannot reload model without ID');
    }
    const collectionPath = this.getCollectionPath();
    const docSnap = await getDoc(doc(db, collectionPath, this.id));
    if (docSnap.exists()) {
      const transformed = this.transformFromFirestore(docSnap.data(), docSnap.id);
      this.data = transformed;
    } else {
      throw new Error('Document not found');
    }
  }

  update(updates: Partial<T>): void {
    this.data = { ...this.data, ...updates };
  }

  // Static methods for querying
  static async find<M extends BaseModel<any>>(
    this: new (data?: any) => M,
    id: string
  ): Promise<M | null> {
    const instance = new this();
    try {
      const collectionPath = instance.getCollectionPath();
      const docSnap = await getDoc(doc(db, collectionPath, id));
      if (docSnap.exists()) {
        const transformed = instance.transformFromFirestore(docSnap.data(), docSnap.id);
        return new this(transformed);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static async findWhere<M extends BaseModel<any>>(
    this: new (data?: any) => M,
    field: string,
    operator: any,
    value: any
  ): Promise<M[]> {
    const instance = new this();
    const collectionPath = instance.getCollectionPath();
    const q = query(collection(db, collectionPath), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const transformed = instance.transformFromFirestore(doc.data(), doc.id);
      return new this(transformed);
    });
  }

  static async findAll<M extends BaseModel<any>>(
    this: new (data?: any) => M,
    constraints: QueryConstraint[] = []
  ): Promise<M[]> {
    const instance = new this();
    const collectionPath = instance.getCollectionPath();
    const q = query(collection(db, collectionPath), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const transformed = instance.transformFromFirestore(doc.data(), doc.id);
      return new this(transformed);
    });
  }

  static subscribe<M extends BaseModel<any>>(
    this: new (data?: any) => M,
    callback: (models: M[]) => void,
    constraints: QueryConstraint[] = []
  ): Unsubscribe {
    const instance = new this();
    const collectionPath = instance.getCollectionPath();
    const q = query(collection(db, collectionPath), ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const models = snapshot.docs.map(doc => {
        const transformed = instance.transformFromFirestore(doc.data(), doc.id);
        return new this(transformed);
      });
      callback(models);
    }, (error: FirestoreError) => {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.warn(`Permission denied for ${collectionPath}:`, error.message);
        // Call callback with empty array on permission denied
        callback([]);
      } else {
        console.error(`Error in snapshot listener for ${collectionPath}:`, error);
      }
    });
  }

  // Utility methods
  protected convertTimestamp(timestamp: any): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    return undefined;
  }
} 