// Simple script to check Firestore data using admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkData() {
    try {
        console.log('Checking Firestore data...\n');

        // Check tenants/dev/parties
        const partiesRef = db.collection('tenants/dev/parties');
        const partiesSnapshot = await partiesRef.get();

        console.log(`Found ${partiesSnapshot.size} parties in tenants/dev/parties`);

        partiesSnapshot.forEach(doc => {
            console.log(`\nParty ID: ${doc.id}`);
            console.log('Data:', JSON.stringify(doc.data(), null, 2));

            // Check queueSongs subcollection
            checkQueueSongs(doc.id);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

async function checkQueueSongs(partyId) {
    try {
        const queueRef = db.collection(`tenants/dev/parties/${partyId}/queueSongs`);
        const queueSnapshot = await queueRef.get();
        console.log(`  Queue songs: ${queueSnapshot.size}`);
    } catch (error) {
        console.error(`  Error checking queue for ${partyId}:`, error.message);
    }
}

checkData().then(() => {
    console.log('\nDone!');
    process.exit(0);
});
