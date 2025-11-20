import * as functions from 'firebase-functions';
import { db, admin } from './firebase';

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
