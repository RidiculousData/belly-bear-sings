import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import { GuestNameForm } from '../components/GuestNameForm';
import { useAuth } from '../contexts/AuthContext';
import { ParticipantService } from '../services/ParticipantService';
import { Party } from '../persistence';
import { updateProfile } from 'firebase/auth';

export const GuestJoinPage: React.FC = () => {
    const { partyCode } = useParams<{ partyCode: string }>();
    const navigate = useNavigate();
    const { user, signInAnonymously, isAnonymous } = useAuth();

    const [loading, setLoading] = useState(false);
    const [validatingParty, setValidatingParty] = useState(true);
    const [error, setError] = useState<string>('');
    const [partyInfo, setPartyInfo] = useState<{ name: string; hostName: string } | null>(null);
    const [validatedParty, setValidatedParty] = useState<Party | null>(null);

    // Validate party on mount
    useEffect(() => {
        const validateParty = async () => {
            if (!partyCode) {
                setError('Invalid party link');
                setValidatingParty(false);
                return;
            }

            try {
                const validation = await ParticipantService.validatePartyForJoining(partyCode);

                if (!validation.isValid) {
                    setError(validation.error || 'Invalid party');
                    setValidatingParty(false);
                    return;
                }

                const party = validation.party!;
                setValidatedParty(party);
                setPartyInfo({
                    name: party.name,
                    hostName: 'Party Host', // TODO: Get actual host name
                });
                setValidatingParty(false);
            } catch (err: any) {
                setError(err.message || 'Failed to validate party');
                setValidatingParty(false);
            }
        };

        validateParty();
    }, [partyCode]);

    const handleGuestJoin = async (displayName: string) => {
        if (!validatedParty || !partyCode) {
            setError('Party information not available');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Sign in anonymously if not already signed in
            if (!user || !isAnonymous) {
                await signInAnonymously();
                // Wait for auth state to update
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Update the anonymous user's display name
            if (user) {
                await updateProfile(user, { displayName });
            }

            // Join the party
            const joinResult = await ParticipantService.joinParty(validatedParty.id!, {
                userId: user!.uid,
                displayName: displayName,
                email: undefined as undefined, // Explicitly undefined for guests
                profilePicture: undefined,
            });

            if (!joinResult.success) {
                setError(joinResult.error || 'Failed to join party');
                setLoading(false);
                return;
            }

            // Navigate to participant dashboard
            navigate(`/participant/${partyCode}`);
        } catch (err: any) {
            setError(err.message || 'Failed to join party. Please try again.');
            setLoading(false);
        }
    };

    if (validatingParty) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Loading party...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error && !validatedParty) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                {partyInfo && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        }}
                    >
                        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                            {partyInfo.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Hosted by {partyInfo.hostName}
                        </Typography>
                    </Paper>
                )}

                <GuestNameForm
                    onSubmit={handleGuestJoin}
                    loading={loading}
                    error={error}
                />

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        No account needed! Just enter your name to join.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};
