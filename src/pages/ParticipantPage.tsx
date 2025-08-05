import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { firestoreService, partyService } from '@bellybearsings/firebase-config';
import { ParticipantDashboard } from '../components/ParticipantDashboard';
import { GoogleIdentityDialog } from '../components/GoogleIdentityDialog';
import { useAuth } from '../contexts/AuthContext';
import { ParticipantLogin } from '../components/ParticipantLogin';

export const ParticipantPage: React.FC = () => {
  const { partyCode } = useParams<{ partyCode: string }>();
  const { userProfile, loading: authLoading, signOut, signInWithProvider } = useAuth();

  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);
  const [showIdentityDialog, setShowIdentityDialog] = useState(false);
  const [partyInfo, setPartyInfo] = useState<{ hostName: string; partyName: string } | null>(null);
  const [actualPartyId, setActualPartyId] = useState<string>('');

  useEffect(() => {
    if (!authLoading && userProfile && !hasJoined && !actualPartyId) {
      setShowIdentityDialog(true);
    }
  }, [authLoading, userProfile, hasJoined, actualPartyId]);

  const handleLogin = async () => {
    try {
      await signInWithProvider('google');
    } catch (error) {
      console.error('Google sign in failed:', error);
      setJoinError('Failed to sign in. Please try again.');
    }
  };

  const handleConfirmIdentity = async () => {
    if (!partyCode || !userProfile) return;

    setShowIdentityDialog(false);
    setIsJoining(true);
    setJoinError('');

    try {
      // First, try to get party by code (since URL param might be a party code)
      let party;
      let foundPartyId = '';

      // Check if partyCode looks like a party code (letters and numbers, short)
      if (partyCode.length <= 10 && /^[A-Z0-9-]+$/i.test(partyCode)) {
        console.log('Looking up party by code:', partyCode);
        party = await partyService.getPartyByCode(partyCode);
        if (party) {
          foundPartyId = party.id;
          setActualPartyId(party.id);
        }
      } else {
        // Try as direct party ID
        console.log('Looking up party by ID:', partyCode);
        party = await firestoreService.getParty(partyCode);
        if (party) {
          foundPartyId = partyCode;
          setActualPartyId(partyCode);
        }
      }

      if (!party) {
        throw new Error('Party not found.');
      }
      
      // Check if party is active (if the property exists)
      if ('isActive' in party && !party.isActive) {
        throw new Error('This party is no longer active.');
      }
      
      // Check if party is full
      if (party.participants.length >= party.settings.maxParticipants) {
        throw new Error('This party is full.');
      }
      
      // Check if user is already a participant
      if (party.participants.includes(userProfile.userId)) {
        setPartyInfo({
          hostName: 'Party Host', // TODO: Get actual host name
          partyName: party.name,
        });
        setHasJoined(true);
        return;
      }
      
      // Add user as party guest
      await firestoreService.addPartyGuest(foundPartyId, userProfile.userId, {
        displayName: userProfile.displayName,
        boostsRemaining: party.settings.boostsPerPerson,
        isAnonymous: false,
        isHost: false,
      });
      
      // Add user to participants array
      await firestoreService.updateParty(foundPartyId, {
        participants: [...party.participants, userProfile.userId],
      });
      
      setPartyInfo({
        hostName: 'Party Host', // TODO: Get actual host name
        partyName: party.name,
      });
      setHasJoined(true);
    } catch (error: any) {
      console.error('Error joining party:', error);
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
      console.error('Error switching account:', error);
      setJoinError('Failed to switch account. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowIdentityDialog(false);
    // Optional: Redirect to home or show a message
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

  if (hasJoined && actualPartyId) {
    return <ParticipantDashboard partyId={actualPartyId} partyInfo={partyInfo} />;
  }

  return (
    <>
      <GoogleIdentityDialog
        open={showIdentityDialog}
        onConfirm={handleConfirmIdentity}
        onCancel={handleCancel}
        onSwitchAccount={handleSwitchAccount}
      />
      {/* Render a loading or placeholder state while dialog is open but not yet joined */}
      {!hasJoined && showIdentityDialog && (
          <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                      Confirming your identity...
                  </Typography>
              </Box>
          </Container>
      )}
    </>
  );
}; 