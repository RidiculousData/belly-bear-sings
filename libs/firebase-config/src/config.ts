// Firebase configuration
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

// Firebase emulator configuration
export const emulatorConfig = {
  useEmulators: import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true',
  auth: {
    host: 'localhost',
    port: 9099,
  },
  firestore: {
    host: 'localhost',
    port: 8088,
  },
  functions: {
    host: 'localhost',
    port: 5001,
  },
}; 