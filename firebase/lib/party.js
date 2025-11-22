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
exports.endParty = exports.joinParty = exports.createParty = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
// Function to create a new party
exports.createParty = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create a party');
    }
    const hostId = context.auth.uid;
    const partyId = firebase_1.db.collection('parties').doc().id;
    try {
        // Create party document
        await firebase_1.db.collection('parties').doc(partyId).set({
            hostId,
            createdAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            name: data.name || 'Karaoke Party',
        });
        // Fetch host profile
        const userDoc = await firebase_1.db.collection('users').doc(hostId).get();
        const userData = userDoc.data();
        // Add host as first participant
        await firebase_1.db.collection('parties').doc(partyId).collection('participants').doc(hostId).set({
            displayName: (userData === null || userData === void 0 ? void 0 : userData.displayName) || data.hostDisplayName || 'Host',
            photoURL: (userData === null || userData === void 0 ? void 0 : userData.photoURL) || '',
            boostsRemaining: 3,
            role: 'HOST',
            joinedAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
            score: 0,
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
    const { partyId } = data;
    const userId = context.auth.uid;
    const isAnonymous = ((_a = context.auth.token.firebase) === null || _a === void 0 ? void 0 : _a.sign_in_provider) === 'anonymous';
    try {
        // Check if party exists and is active
        const partyDoc = await firebase_1.db.collection('parties').doc(partyId).get();
        if (!partyDoc.exists || !((_b = partyDoc.data()) === null || _b === void 0 ? void 0 : _b.isActive)) {
            throw new functions.https.HttpsError('not-found', 'Party not found or is no longer active');
        }
        // Check if user is already in party
        const existingParticipant = await firebase_1.db.collection('parties').doc(partyId)
            .collection('participants').doc(userId).get();
        if (existingParticipant.exists) {
            return { success: true, alreadyJoined: true };
        }
        let displayName = 'Guest';
        let photoURL = '';
        let email;
        if (isAnonymous) {
            // For anonymous users, use the display name from Firebase Auth
            // (which was set in the frontend before joining)
            displayName = context.auth.token.name || 'Guest';
            // Anonymous users don't have email or photo
            email = undefined;
            photoURL = '';
        }
        else {
            // For authenticated users, fetch from user profile
            const userDoc = await firebase_1.db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            displayName = (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'Guest';
            photoURL = (userData === null || userData === void 0 ? void 0 : userData.photoURL) || '';
            email = (userData === null || userData === void 0 ? void 0 : userData.email) || context.auth.token.email;
        }
        // Add user as participant
        const participantData = {
            displayName,
            photoURL,
            boostsRemaining: 3,
            role: 'GUEST',
            joinedAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
            score: 0,
            isAnonymous,
            userId,
            partyId,
        };
        // Only add email if it exists (not for anonymous users)
        if (email) {
            participantData.email = email;
        }
        await firebase_1.db.collection('parties').doc(partyId).collection('participants').doc(userId).set(participantData);
        return { success: true, alreadyJoined: false };
    }
    catch (error) {
        console.error('Error joining party:', error);
        throw new functions.https.HttpsError('internal', 'Failed to join party');
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
        const partyDoc = await firebase_1.db.collection('parties').doc(partyId).get();
        if (!partyDoc.exists || ((_a = partyDoc.data()) === null || _a === void 0 ? void 0 : _a.hostId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Only the host can end the party');
        }
        // Update party status
        await partyDoc.ref.update({
            isActive: false,
            endedAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error ending party:', error);
        throw new functions.https.HttpsError('internal', 'Failed to end party');
    }
});
//# sourceMappingURL=party.js.map