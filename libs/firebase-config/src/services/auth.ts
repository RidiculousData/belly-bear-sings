import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  User,
  onAuthStateChanged,
  Unsubscribe
} from 'firebase/auth';
import { auth } from '../firebase';
import { AuthProvider } from '@bellybearsings/shared';

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Create account with email and password
export async function createAccount(email: string, password: string, displayName?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

// Sign in with social providers
export async function signInWithProvider(provider: AuthProvider): Promise<User> {
  let authProvider;
  switch (provider) {
    case 'google':
      authProvider = googleProvider;
      break;
    case 'facebook':
      authProvider = facebookProvider;
      break;
    case 'twitter':
      authProvider = twitterProvider;
      break;
    case 'apple':
      authProvider = appleProvider;
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
  
  try {
    const result = await signInWithPopup(auth, authProvider);
    return result.user;
  } catch (error: any) {
    // Handle COOP (Cross-Origin-Opener-Policy) errors gracefully
    // These can occur when the browser blocks popup window closure
    if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('Cross-Origin-Opener-Policy')) {
      // User closed the popup - this is not necessarily an error
      throw new Error('Sign-in popup was closed. Please try again.');
    }
    // Re-throw other errors
    throw error;
  }
}

// Sign in anonymously
export async function signInAnonymous(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

// Sign in with phone number
export async function sendPhoneVerification(
  phoneNumber: string,
  recaptchaContainerId: string
): Promise<any> {
  const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    size: 'invisible',
  });
  
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

// Sign out
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Subscribe to auth state changes
export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// Update user profile
export async function updateUserProfile(updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('No user signed in');
  }
  
  await updateProfile(auth.currentUser, updates);
} 