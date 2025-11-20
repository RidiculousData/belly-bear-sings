import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ParticipantDashboard } from '../components/ParticipantDashboard';
import { GoogleIdentityDialog } from '../components/GoogleIdentityDialog';
import { ParticipantLogin } from '../components/ParticipantLogin';
import { useAuth } from '../contexts/AuthContext';
import { ParticipantService } from '../services/ParticipantService';
import { Party, Participant } from '../persistence';

export const ParticipantPage: React.FC = () => {
  const { partyCode } = useParams<{ partyCode: string }>();
  const { userProfile, loading: authLoading, signOut, signInWithProvider } = useAuth();

  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);
  const [showIdentityDialog, setShowIdentityDialog] = useState(false);
  const [partyInfo, setPartyInfo] = useState<{ hostName: string; partyName: string } | null>(null);
  const [validatedParty, setValidatedParty] = useState<Party | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    if (!authLoading && userProfile && !hasJoined && !validatedParty) {
      setShowIdentityDialog(true);
    }
  }, [authLoading, userProfile, hasJoined, validatedParty]);

  const handleLogin = async () => {
    try {
      await signInWithProvider('google');
    } catch (error) {
      setJoinError('Failed to sign in. Please try again.');
    }
  };

  const handleConfirmIdentity = async () => {
    if (!partyCode || !userProfile) {
      setJoinError('Missing party code or user profile');
      return;
    }

    setIsJoining(true);
    setJoinError('');
    setShowIdentityDialog(false);

    try {

      // Validate party first
      const validation = await ParticipantService.validatePartyForJoining(partyCode);

      if (!validation.isValid) {
        setJoinError(validation.error || 'Invalid party');
        return;
      }

      const party = validation.party!;
      setValidatedParty(party);

      // Join the party
      const joinResult = await ParticipantService.joinParty(party.id!, {
        userId: userProfile.userId,
        displayName: userProfile.displayName || `${userProfile.firstName} ${userProfile.lastName}`,
        email: userProfile.email || '',
        profilePicture: undefined, // TODO: Add profilePicture to User type if needed
      });

      if (!joinResult.success) {
        setJoinError(joinResult.error || 'Failed to join party');
        return;
      }

      const participant = joinResult.participant!;
      setCurrentParticipant(participant);

      // Set party info for display
      setPartyInfo({
        hostName: 'Party Host', // TODO: Get actual host name from party.hostId
        partyName: party.name,
      });

      setHasJoined(true);

    } catch (error: any) {
      setJoinError(error.message || 'Failed to join party. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSwitchAccount = async () => {
    setShowIdentityDialog(false);
    try {
      await signOut();
      await signInWithProvider('google');
    } catch (error) {
      setJoinError('Failed to switch account. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowIdentityDialog(false);
  };

  if (authLoading || isJoining) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {isJoining ? 'Joining party...' : 'Loading...'}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!userProfile) {
    return <ParticipantLogin onLogin={handleLogin} />;
  }

  if (!partyCode) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">Invalid party link</Alert>
      </Container>
    );
  }

  if (joinError) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{joinError}</Alert>
      </Container>
    );
  }

  if (hasJoined && validatedParty && currentParticipant) {
    return (
      <ParticipantDashboard
        partyId={validatedParty.id!}
        partyInfo={partyInfo}
      />
    );
  }

  return (
    <>
      <GoogleIdentityDialog
        open={showIdentityDialog}
        onConfirm={handleConfirmIdentity}
        onSwitchAccount={handleSwitchAccount}
        onCancel={handleCancel}
      />
    </>
  );
}; 