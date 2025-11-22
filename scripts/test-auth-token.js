import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        if (!fs.existsSync(envPath)) {
            console.warn('Warning: .env.local not found');
            return {};
        }
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error('Error loading .env.local:', e);
        return {};
    }
}

const env = loadEnv();

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const tenant = env.VITE_TENANT || 'dev';

async function testAuth() {
    console.log('Testing authentication and Firestore access...');
    console.log('Current auth state:', auth.currentUser ? 'Signed in' : 'Not signed in');

    if (auth.currentUser) {
        console.log('User ID:', auth.currentUser.uid);
        console.log('Email:', auth.currentUser.email);

        try {
            const token = await auth.currentUser.getIdToken();
            console.log('Got auth token:', token.substring(0, 50) + '...');

            // Try to read parties
            console.log(`\nTrying to read tenants/${tenant}/parties...`);
            const partiesRef = collection(db, `tenants/${tenant}/parties`);
            const snapshot = await getDocs(partiesRef);
            console.log(`Success! Found ${snapshot.size} parties`);
            snapshot.forEach(doc => {
                console.log(`  Party ${doc.id}:`, doc.data());
            });
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.log('No user signed in. The client app should handle Google Sign-In.');
        console.log('This script cannot test Google Sign-In directly.');
    }

    process.exit(0);
}

testAuth();
