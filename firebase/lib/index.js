"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldParties = exports.endParty = exports.boostSong = exports.joinParty = exports.createParty = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Function to create a new party
exports.createParty = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        console.error('Error creating party:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create party');
    }
});
// Function to join a party
exports.joinParty = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to join a party');
    }
    const { partyId, displayName } = data;
    const userId = context.auth.uid;
    try {
        // Check if party exists and is active
        const partyDoc = await db.collection('parties').doc(partyId).get();
        if (!partyDoc.exists || !((_a = partyDoc.data()) === null || _a === void 0 ? void 0 : _a.isActive)) {
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
            isAnonymous: ((_b = context.auth.token.firebase) === null || _b === void 0 ? void 0 : _b.sign_in_provider) === 'anonymous',
            isHost: false,
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, alreadyJoined: false };
    }
    catch (error) {
        console.error('Error joining party:', error);
        throw new functions.https.HttpsError('internal', 'Failed to join party');
    }
});
// Function to boost a song
exports.boostSong = functions.https.onCall(async (data, context) => {
    var _a, _b;
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
        const boostsRemaining = ((_a = guestDoc.data()) === null || _a === void 0 ? void 0 : _a.boostsRemaining) || 0;
        if (boostsRemaining <= 0) {
            throw new functions.https.HttpsError('resource-exhausted', 'No boosts remaining');
        }
        // Check if song belongs to user
        const songDoc = await db.collection('parties').doc(partyId)
            .collection('queueSongs').doc(songId).get();
        if (!songDoc.exists || ((_b = songDoc.data()) === null || _b === void 0 ? void 0 : _b.guestId) !== userId) {
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
    }
    catch (error) {
        console.error('Error boosting song:', error);
        throw new functions.https.HttpsError('internal', 'Failed to boost song');
    }
});
// Function to end a party
exports.endParty = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to end a party');
    }
    const { partyId } = data;
    const userId = context.auth.uid;
    try {
        // Check if user is the host
        const partyDoc = await db.collection('parties').doc(partyId).get();
        if (!partyDoc.exists || ((_a = partyDoc.data()) === null || _a === void 0 ? void 0 : _a.hostId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Only the host can end the party');
        }
        // Update party status
        await partyDoc.ref.update({
            isActive: false,
            endedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error ending party:', error);
        throw new functions.https.HttpsError('internal', 'Failed to end party');
    }
});
// Cleanup function for old parties (scheduled to run daily)
exports.cleanupOldParties = functions.pubsub.schedule('every 24 hours').onRun(async () => {
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
    }
    catch (error) {
        console.error('Error cleaning up old parties:', error);
    }
});
//# sourceMappingURL=index.js.map