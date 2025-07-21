import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

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

    // Add host as first guest
    await db.collection('parties').doc(partyId).collection('partyGuests').doc(hostId).set({
      displayName: data.hostDisplayName || 'Host',
      boostsRemaining: 3,
      isAnonymous: false,
      isHost: true,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
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

  const { partyId, displayName } = data;
  const userId = context.auth.uid;

  try {
    // Check if party exists and is active
    const partyDoc = await db.collection('parties').doc(partyId).get();
    if (!partyDoc.exists || !partyDoc.data()?.isActive) {
      throw new functions.https.HttpsError('not-found', 'Party not found or is no longer active');
    }

    // Check if user is already in party
    const existingGuest = await db.collection('parties').doc(partyId)
      .collection('partyGuests').doc(userId).get();
    
    if (existingGuest.exists) {
      return { success: true, alreadyJoined: true };
    }

    // Add user as party guest
    await db.collection('parties').doc(partyId).collection('partyGuests').doc(userId).set({
      displayName: displayName || 'Guest',
      boostsRemaining: 3,
      isAnonymous: context.auth.token.firebase?.sign_in_provider === 'anonymous',
      isHost: false,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, alreadyJoined: false };
  } catch (error) {
    console.error('Error joining party:', error);
    throw new functions.https.HttpsError('internal', 'Failed to join party');
  }
});

// Function to boost a song
export const boostSong = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to boost a song');
  }

  const { partyId, songId } = data;
  const userId = context.auth.uid;

  try {
    // Check if user has boosts remaining
    const guestDoc = await db.collection('parties').doc(partyId)
      .collection('partyGuests').doc(userId).get();
    
    if (!guestDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'User is not in this party');
    }

    const boostsRemaining = guestDoc.data()?.boostsRemaining || 0;
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
    
    batch.update(guestDoc.ref, {
      boostsRemaining: admin.firestore.FieldValue.increment(-1),
    });

    await batch.commit();

    return { success: true, boostsRemaining: boostsRemaining - 1 };
  } catch (error) {
    console.error('Error boosting song:', error);
    throw new functions.https.HttpsError('internal', 'Failed to boost song');
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

// Cleanup function for old parties (scheduled to run daily)
export const cleanupOldParties = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const cutoffTime = new Date();
  cutoffTime.setDate(cutoffTime.getDate() - 1); // 24 hours ago

  try {
    const oldParties = await db.collection('parties')
      .where('isActive', '==', true)
      .where('createdAt', '<', cutoffTime)
      .get();

    const batch = db.batch();
    oldParties.forEach(doc => {
      batch.update(doc.ref, {
        isActive: false,
        endedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(`Cleaned up ${oldParties.size} old parties`);
  } catch (error) {
    console.error('Error cleaning up old parties:', error);
  }
}); 