import * as functions from 'firebase-functions';
import { db, admin } from './firebase';

// Function to create a new party
export const createParty = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create a party');
    }

    const hostId = context.auth.uid;
    const partyId = db.collection('parties').doc().id;

    try {
        // Create party document
        await db.collection('parties').doc(partyId).set({
            hostId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            name: data.name || 'Karaoke Party',
        });

        // Fetch host profile
        const userDoc = await db.collection('users').doc(hostId).get();
        const userData = userDoc.data();

        // Add host as first participant
        await db.collection('parties').doc(partyId).collection('participants').doc(hostId).set({
            displayName: userData?.displayName || data.hostDisplayName || 'Host',
            photoURL: userData?.photoURL || '',
            boostsRemaining: 3,
            role: 'HOST',
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            score: 0,
        });

        return { partyId, success: true };
    } catch (error) {
        console.error('Error creating party:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create party');
    }
});

// Function to join a party
export const joinParty = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to join a party');
    }

    const { partyId } = data;
    const userId = context.auth.uid;
    const isAnonymous = context.auth.token.firebase?.sign_in_provider === 'anonymous';

    try {
        // Check if party exists and is active
        const partyDoc = await db.collection('parties').doc(partyId).get();
        if (!partyDoc.exists || !partyDoc.data()?.isActive) {
            throw new functions.https.HttpsError('not-found', 'Party not found or is no longer active');
        }

        // Check if user is already in party
        const existingParticipant = await db.collection('parties').doc(partyId)
            .collection('participants').doc(userId).get();

        if (existingParticipant.exists) {
            return { success: true, alreadyJoined: true };
        }

        let displayName = 'Guest';
        let photoURL = '';
        let email: string | undefined;

        if (isAnonymous) {
            // For anonymous users, use the display name from Firebase Auth
            // (which was set in the frontend before joining)
            displayName = context.auth.token.name || 'Guest';
            // Anonymous users don't have email or photo
            email = undefined;
            photoURL = '';
        } else {
            // For authenticated users, fetch from user profile
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            displayName = userData?.displayName || 'Guest';
            photoURL = userData?.photoURL || '';
            email = userData?.email || context.auth.token.email;
        }

        // Add user as participant
        const participantData: any = {
            displayName,
            photoURL,
            boostsRemaining: 3,
            role: 'GUEST',
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            score: 0,
            isAnonymous,
            userId,
            partyId,
        };

        // Only add email if it exists (not for anonymous users)
        if (email) {
            participantData.email = email;
        }

        await db.collection('parties').doc(partyId).collection('participants').doc(userId).set(participantData);

        return { success: true, alreadyJoined: false };
    } catch (error) {
        console.error('Error joining party:', error);
        throw new functions.https.HttpsError('internal', 'Failed to join party');
    }
});

// Function to end a party
export const endParty = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to end a party');
    }

    const { partyId } = data;
    const userId = context.auth.uid;

    try {
        // Check if user is the host
        const partyDoc = await db.collection('parties').doc(partyId).get();
        if (!partyDoc.exists || partyDoc.data()?.hostId !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Only the host can end the party');
        }

        // Update party status
        await partyDoc.ref.update({
            isActive: false,
            endedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error ending party:', error);
        throw new functions.https.HttpsError('internal', 'Failed to end party');
    }
});
