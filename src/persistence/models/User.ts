import { DocumentData, serverTimestamp } from 'firebase/firestore';
import { BaseModel } from '../BaseModel';

export interface UserData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends BaseModel<UserData> {
  protected collectionName = 'users';
  protected idField = 'userId';

  constructor(data?: Partial<UserData>) {
    super(data);
  }

  // Getters for easy access
  get firstName(): string {
    return this.data.firstName || '';
  }

  get lastName(): string {
    return this.data.lastName || '';
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get email(): string {
    return this.data.email || '';
  }

  get initials(): string {
    const first = this.firstName.charAt(0).toUpperCase();
    const last = this.lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
  }

  get profilePicture(): string | undefined {
    return this.data.profilePicture;
  }

  // Business logic methods
  updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    profilePicture?: string;
  }): void {
    this.update(updates);
  }

  // Validation
  protected async validate(): Promise<void> {
    if (!this.data.firstName?.trim()) {
      throw new Error('First name is required');
    }
    if (!this.data.lastName?.trim()) {
      throw new Error('Last name is required');
    }
    if (!this.data.email?.trim()) {
      throw new Error('Email is required');
    }
    if (this.data.email && !this.isValidEmail(this.data.email)) {
      throw new Error('Invalid email format');
    }
  }

  protected transformForSave(): Record<string, any> {
    return {
      firstName: this.data.firstName,
      lastName: this.data.lastName,
      email: this.data.email,
      phoneNumber: this.data.phoneNumber,
      profilePicture: this.data.profilePicture,
    };
  }

  protected transformFromFirestore(data: DocumentData, id: string): UserData {
    return {
      userId: id,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phoneNumber: data.phoneNumber,
      profilePicture: data.profilePicture,
      createdAt: this.convertTimestamp(data.createdAt) || new Date(),
      updatedAt: this.convertTimestamp(data.updatedAt) || new Date(),
    };
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Static factory methods
  static createNew(userData: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
  }): User {
    return new User({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // User-specific query methods
  static async findByEmail(email: string): Promise<User | null> {
    const users = await this.findWhere('email', '==', email);
    return users.length > 0 ? users[0] : null;
  }
} 