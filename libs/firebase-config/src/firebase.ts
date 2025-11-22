import { initializeApp } from 'firebase/app';
import {
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig, currentTenant } from './config';

// Initialize Firebase app (always using Firebase Cloud)
export const app = initializeApp(firebaseConfig);

// Initialize Auth with explicit persistence
// This ensures auth tokens are properly attached to all Firebase requests
export const auth = typeof window !== 'undefined'
  ? initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence]
  })
  : getAuth(app);

// Initialize Firestore AFTER auth to ensure auth context is available
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Initialize Analytics (only if measurementId is configured)
export const analytics =
  typeof window !== 'undefined' && firebaseConfig.measurementId
    ? getAnalytics(app)
    : null;

// Log tenant information
if (typeof window !== 'undefined') {
  console.log(`🌐 Tenant: ${currentTenant} - Using Firebase Cloud (Production)`);
  console.log(`📊 Project ID: ${firebaseConfig.projectId}`);
}

// Export tenant/environment helpers
export { currentTenant as currentEnvironment, getEnvironment, getEnvironmentCollectionPath, getTenantCollectionPath } from './config';
export type { Tenant as Environment } from './config';
