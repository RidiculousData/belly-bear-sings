import { useState, useEffect } from 'react';
import { partyService, firestoreService } from '@bellybearsings/firebase-config';
import { Song, Participant } from '../types/party';

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

    useEffect(() => {
        if (!partyCode) return;

        setLoading(true);
        setError('');

        let queueUnsubscribe: (() => void) | undefined;
        let participantsUnsubscribe: (() => void) | undefined;

        const loadParty = async () => {
            try {
                // First, try to find the party by code in Firestore
                const party = await partyService.getPartyByCode(partyCode);
                if (party) {
                    setPartyId(party.partyId);

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
    }, [partyCode]);

    return { queue, participants, loading, error, partyId };
};
