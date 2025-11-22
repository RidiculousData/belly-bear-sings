import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
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
                // Remove quotes if present
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

// Check if config is valid
if (!firebaseConfig.apiKey) {
    console.error("Error: Firebase config missing in .env.local");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tenant = env.VITE_TENANT || 'dev';

async function verifyData() {
    console.log(`Checking Firestore data for tenant: ${tenant}...`);

    try {
        // Check Parties
        const partiesRef = collection(db, `tenants/${tenant}/parties`);
        const partiesQuery = query(partiesRef, orderBy('createdAt', 'desc'), limit(5));
        const partiesSnapshot = await getDocs(partiesQuery);

        console.log('\n--- Recent Parties ---');
        if (partiesSnapshot.empty) {
            console.log('No parties found.');
        } else {
            partiesSnapshot.forEach(doc => {
                console.log(`Party ID: ${doc.id}, Data:`, doc.data());
            });
        }

        // Check Participants (we might need to know a party ID to check subcollections, 
        // or if participants are top level. Based on previous context, they might be subcollections or top level.
        // Let's assume top level for now or check the code if needed. 
        // Actually, usually participants are in a subcollection of party or a top level collection.
        // Let's check a 'participants' collection if it exists at tenant level, 
        // or try to find participants in the found parties.

        // Based on typical patterns, let's check if there is a global participants collection or just check the first party found.
        if (!partiesSnapshot.empty) {
            const firstPartyId = partiesSnapshot.docs[0].id;
            console.log(`\nChecking participants for Party ${firstPartyId}...`);
            const participantsRef = collection(db, `tenants/${tenant}/parties/${firstPartyId}/participants`);
            const participantsSnapshot = await getDocs(participantsRef);

            if (participantsSnapshot.empty) {
                console.log('No participants found in this party.');
            } else {
                participantsSnapshot.forEach(doc => {
                    console.log(`Participant ID: ${doc.id}, Data:`, doc.data());
                });
            }
        }

    } catch (error) {
        console.error('Error verifying data:', error);
    }
    process.exit(0);
}

verifyData();
