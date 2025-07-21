// Export configuration
export * from './config';

// Export Firebase app and services
export * from './firebase';

// Export service wrappers
export * as authService from './services/auth';
export * as firestoreService from './services/firestore';
export * as functionsService from './services/functions';
export * as youtubeService from './services/youtube';
export * as partyService from './services/party';
export * as dashboardService from './services/dashboard';
export type { PastParty, FavoriteSongWithMetadata } from './services/dashboard'; 