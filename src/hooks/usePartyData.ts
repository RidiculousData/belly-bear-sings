import { useState, useEffect } from 'react';
import { partyService, firestoreService } from '@bellybearsings/firebase-config';
import { Song, Participant } from '../types/party';
import { useAuth } from '../contexts/AuthContext';

interface UsePartyDataReturn {
    queue: Song[];
    participants: Participant[];
    loading: boolean;
    error: string;
    partyId: string;
}

export const usePartyData = (partyCode: string | undefined): UsePartyDataReturn => {
    const [queue, setQueue] = useState<Song[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [partyId, setPartyId] = useState<string>('');
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        // Wait for auth to be ready
        if (authLoading) {
            return;
        }

        // If no party code, don't try to load
        if (!partyCode) {
            setLoading(false);
            return;
        }

        // If user is not authenticated, don't try to subscribe
        if (!user) {
            setError('You must be signed in to view party data');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        let queueUnsubscribe: (() => void) | undefined;
        let participantsUnsubscribe: (() => void) | undefined;

        const loadParty = async () => {
            try {
                // Debug: Check auth state
                console.log('🔍 Debug: About to load party data');
                console.log('🔍 User authenticated:', !!user);
                console.log('🔍 User ID:', user?.uid);

                // Get current auth token to verify it exists
                if (user) {
                    try {
                        const token = await user.getIdToken();
                        console.log('🔍 Auth token exists:', !!token);
                        console.log('🔍 Token preview:', token.substring(0, 50) + '...');
                    } catch (tokenError) {
                        console.error('🔍 Error getting auth token:', tokenError);
                    }
                }

                // First, try to find the party by code in Firestore
                const party = await partyService.getPartyByCode(partyCode);
                if (party) {
                    setPartyId(party.partyId);
                    console.log('🔍 Party found, creating subscriptions for partyId:', party.partyId);

                    // Subscribe to queue updates
                    queueUnsubscribe = partyService.subscribeToPartyQueue(
                        party.partyId,
                        (songs: any[]) => {
                            // Transform Firebase songs to our Song type
                            const transformedSongs: Song[] = songs.map(song => ({
                                id: song.id,
                                videoId: song.videoId,
                                title: song.title,
                                artist: song.artist,
                                requestedBy: song.requestedBy,
                                boosted: song.boosted,
                                boostCount: song.boostCount,
                                praises: song.praises || [],
                            }));
                            setQueue(transformedSongs);
                            setLoading(false);
                        }
                    );

                    // Subscribe to party participants updates
                    participantsUnsubscribe = firestoreService.subscribeToPartyGuests(
                        party.partyId,
                        (guests: any[]) => {
                            const participantDetails = guests.map(guest => ({
                                id: guest.guestId,
                                name: guest.displayName,
                                initials: guest.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
                                avatar: guest.photoURL,
                                role: guest.role || 'GUEST',
                                joinedAt: guest.joinedAt,
                                boostsRemaining: guest.boostsRemaining || 0,
                                score: guest.score || 0,
                            }));
                            setParticipants(participantDetails);
                        }
                    );
                } else {
                    setError('Party not found. Please check the party code.');
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error loading party:', err);
                setError('Failed to load party data. Please try again.');
                setLoading(false);
            }
        };

        loadParty();

        return () => {
            queueUnsubscribe?.();
            participantsUnsubscribe?.();
        };
    }, [partyCode, user, authLoading]);

    return { queue, participants, loading, error, partyId };
};
