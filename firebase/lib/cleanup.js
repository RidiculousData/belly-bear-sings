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
exports.cleanupOldParties = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
// Cleanup function for old parties (scheduled to run daily)
exports.cleanupOldParties = functions.pubsub.schedule('every 24 hours').onRun(async () => {
    const cutoffTime = new Date();
    cutoffTime.setDate(cutoffTime.getDate() - 1); // 24 hours ago
    try {
        const oldParties = await firebase_1.db.collection('parties')
            .where('isActive', '==', true)
            .where('createdAt', '<', cutoffTime)
            .get();
        const batch = firebase_1.db.batch();
        oldParties.forEach(doc => {
            batch.update(doc.ref, {
                isActive: false,
                endedAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
            });
        });
        await batch.commit();
        console.log(`Cleaned up ${oldParties.size} old parties`);
    }
    catch (error) {
        console.error('Error cleaning up old parties:', error);
    }
});
//# sourceMappingURL=cleanup.js.map