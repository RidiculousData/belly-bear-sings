import * as functions from 'firebase-functions';
import { db, admin } from './firebase';

// Function to boost a song
export const boostSong = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to boost a song');
    }

    const { partyId, songId } = data;
    const userId = context.auth.uid;

    try {
        // Check if user has boosts remaining
        const participantDoc = await db.collection('parties').doc(partyId)
            .collection('participants').doc(userId).get();

        if (!participantDoc.exists) {
            throw new functions.https.HttpsError('permission-denied', 'User is not in this party');
        }

        const boostsRemaining = participantDoc.data()?.boostsRemaining || 0;
        if (boostsRemaining <= 0) {
            throw new functions.https.HttpsError('resource-exhausted', 'No boosts remaining');
        }

        // Check if song belongs to user
        const songDoc = await db.collection('parties').doc(partyId)
            .collection('queueSongs').doc(songId).get();

        if (!songDoc.exists || songDoc.data()?.guestId !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Cannot boost this song');
        }

        // Update song and decrement boosts
        const batch = db.batch();

        batch.update(songDoc.ref, {
            isBoosted: true,
            boostedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        batch.update(participantDoc.ref, {
            boostsRemaining: admin.firestore.FieldValue.increment(-1),
        });

        await batch.commit();

        return { success: true, boostsRemaining: boostsRemaining - 1 };
    } catch (error) {
        console.error('Error boosting song:', error);
        throw new functions.https.HttpsError('internal', 'Failed to boost song');
    }
});
