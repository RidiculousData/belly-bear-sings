// Tenant/Environment type for multi-tenancy
// Each tenant (dev, test, prod) has isolated data in Firebase Cloud
export type Tenant = 'dev' | 'test' | 'prod';

// Tenant detection for multi-tenancy
function detectTenant(): Tenant {
  // 1. Check explicit tenant variable
  const tenantVar = import.meta.env.VITE_TENANT;
  if (tenantVar === 'dev' || tenantVar === 'test' || tenantVar === 'prod') {
    return tenantVar;
  }

  // 2. Check URL hostname for tenant identification
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('dev.') || hostname.includes('.dev.')) {
      return 'dev';
    }
    if (hostname.includes('test.') || hostname.includes('.test.')) {
      return 'test';
    }
    if (hostname.includes('prod.') || hostname.includes('.prod.') || hostname.includes('bellybearsings.web.app')) {
      return 'prod';
    }
  }

  // 3. Default to dev tenant for development
  // Override with VITE_TENANT environment variable for other tenants
  return 'dev';
}

// Get current tenant (for multi-tenancy data isolation)
export const currentTenant: Tenant = detectTenant();

// Firebase Cloud configuration (always use cloud, no emulators)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// YouTube API configuration
export const youtubeConfig = {
  apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
  apiUrl: 'https://www.googleapis.com/youtube/v3',
};

// Export tenant helper (alias for backward compatibility)
export function getEnvironment(): Tenant {
  return currentTenant;
}

// Get tenant-prefixed collection path for multi-tenancy data isolation
export function getEnvironmentCollectionPath(collectionName: string): string {
  return `tenants/${currentTenant}/${collectionName}`;
}

// Alias for clarity - get tenant collection path
export function getTenantCollectionPath(collectionName: string): string {
  return getEnvironmentCollectionPath(collectionName);
} 