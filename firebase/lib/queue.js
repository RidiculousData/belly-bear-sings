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
exports.boostSong = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
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
        const participantDoc = await firebase_1.db.collection('parties').doc(partyId)
            .collection('participants').doc(userId).get();
        if (!participantDoc.exists) {
            throw new functions.https.HttpsError('permission-denied', 'User is not in this party');
        }
        const boostsRemaining = ((_a = participantDoc.data()) === null || _a === void 0 ? void 0 : _a.boostsRemaining) || 0;
        if (boostsRemaining <= 0) {
            throw new functions.https.HttpsError('resource-exhausted', 'No boosts remaining');
        }
        // Check if song belongs to user
        const songDoc = await firebase_1.db.collection('parties').doc(partyId)
            .collection('queueSongs').doc(songId).get();
        if (!songDoc.exists || ((_b = songDoc.data()) === null || _b === void 0 ? void 0 : _b.guestId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Cannot boost this song');
        }
        // Update song and decrement boosts
        const batch = firebase_1.db.batch();
        batch.update(songDoc.ref, {
            isBoosted: true,
            boostedAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        batch.update(participantDoc.ref, {
            boostsRemaining: firebase_1.admin.firestore.FieldValue.increment(-1),
        });
        await batch.commit();
        return { success: true, boostsRemaining: boostsRemaining - 1 };
    }
    catch (error) {
        console.error('Error boosting song:', error);
        throw new functions.https.HttpsError('internal', 'Failed to boost song');
    }
});
//# sourceMappingURL=queue.js.map