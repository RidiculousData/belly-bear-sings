import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig, emulatorConfig } from './config';

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId
  ? getAnalytics(app)
  : null;

// Connect to emulators in development
if (emulatorConfig.useEmulators && typeof window !== 'undefined') {
  // Only connect if not already connected
  if (!auth.emulatorConfig) {
    connectAuthEmulator(auth, `http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`);
  }
  
  // @ts-ignore - Firestore doesn't expose emulator state
  if (!db._settings?.host?.includes('localhost')) {
    connectFirestoreEmulator(db, emulatorConfig.firestore.host, emulatorConfig.firestore.port);
  }
  
  // @ts-ignore - Functions doesn't expose emulator state
  if (!functions._customDomain) {
    connectFunctionsEmulator(functions, emulatorConfig.functions.host, emulatorConfig.functions.port);
  }
} 