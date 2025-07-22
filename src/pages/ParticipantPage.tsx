import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { MusicNote, Person, Group } from '@mui/icons-material';
import { firestoreService, functionsService } from '@bellybearsings/firebase-config';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { ParticipantDashboard } from '../components/ParticipantDashboard';

/**
 * Main participant page that handles party joining and dashboard display
 * Supports both mobile and desktop layouts with responsive design
 */
export const ParticipantPage: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const auth = getAuth();
  
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [joinError, setJoinError] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [partyInfo, setPartyInfo] = useState<{ hostName: string; partyName: string } | null>(null);
//   const [userId, setUserId] = useState<string>('');

  // Check if already joined on mount
  useEffect(() => {
    checkExistingSession();
  }, [partyId]);

  /**
   * Check if user has already joined this party
   */
  const checkExistingSession = async () => {
    if (!partyId) {
      setIsLoading(false);
      return;
    }

    try {
      // Check localStorage for existing session
      const storedSession = localStorage.getItem(`party-${partyId}-session`);
      if (storedSession) {
        const session = JSON.parse(storedSession);
        setHasJoined(true);
        setDisplayName(session.displayName);
        // setUserId(session.userId);
        await loadPartyInfo();
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load party information
   */
  const loadPartyInfo = async () => {
    if (!partyId) return;

    try {
      // Get party details
      const party = await firestoreService.getParty(partyId);
      if (party) {
        // TODO: Get host name from user service
        setPartyInfo({
          hostName: 'Party Host', // Placeholder
          partyName: party.name || 'Karaoke Party',
        });
      }
    } catch (error) {
      console.error('Error loading party info:', error);
    }
  };

  /**
   * Handle party joining with anonymous authentication
   */
  const handleJoinParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId || !displayName.trim()) {
      setJoinError('Please enter your name');
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      // Sign in anonymously first
      const userCredential = await signInAnonymously(auth);
      const anonymousUserId = userCredential.user.uid;
      // setUserId(anonymousUserId);

      // Check if party exists in localStorage first (for development)
      const localParty = localStorage.getItem(`party-${partyId}`);
      if (localParty) {
        // Party found in localStorage
        // const partyData = JSON.parse(localParty);
        
        // Store session in localStorage
        localStorage.setItem(`party-${partyId}-session`, JSON.stringify({
          userId: anonymousUserId,
          displayName: displayName.trim(),
          partyId,
          joinedAt: new Date().toISOString(),
        }));

        // Set party info
        setPartyInfo({
          hostName: 'Party Host',
          partyName: 'Karaoke Party',
        });
        
        setHasJoined(true);
      } else {
        // Try Firebase function
        try {
          const joinResult = await functionsService.joinParty(partyId, displayName.trim());
          
          if (joinResult.success) {
            // Store session in localStorage
            localStorage.setItem(`party-${partyId}-session`, JSON.stringify({
              userId: anonymousUserId,
              displayName: displayName.trim(),
              partyId,
              joinedAt: new Date().toISOString(),
            }));

            // Load party info
            await loadPartyInfo();
            
            setHasJoined(true);
          } else {
            throw new Error('Failed to join party');
          }
        } catch (firebaseError: any) {
          // If Firebase fails, show appropriate error
          if (firebaseError.message?.includes('not found')) {
            setJoinError('Party not found. Please check the link and try again.');
          } else {
            setJoinError(firebaseError.message || 'Failed to join party. Please try again.');
          }
        }
      }
    } catch (error: any) {
      console.error('Error joining party:', error);
      setJoinError(error.message || 'Failed to join party. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Show loading while checking party status
  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!partyId) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">Invalid party link</Alert>
      </Container>
    );
  }

  // Show landing page if not joined
  if (!hasJoined) {
    return (
      <Container 
        maxWidth="sm" 
        sx={{ 
          py: 4, 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7E6 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Stack spacing={4}>
          {/* Header */}
          <Box textAlign="center">
            <MusicNote 
              sx={{ 
                fontSize: 64, 
                color: 'primary.main',
                mb: 2,
              }} 
            />
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
              }}
            >
              Welcome to the Party!
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Join the Karaoke Fun
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
            >
              Please tell us who you are
            </Typography>
          </Box>

          {/* Join Form */}
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleJoinParty}>
                <Stack spacing={3}>
                  {joinError && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {joinError}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Your Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    variant="outlined"
                    size="medium"
                    autoFocus
                    disabled={isJoining}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1.1rem',
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!displayName.trim() || isJoining}
                    startIcon={isJoining ? <CircularProgress size={20} /> : <Group />}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                    }}
                  >
                    {isJoining ? 'Joining Party...' : 'Join Party'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>

          {/* Party Info */}
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Party Code: {partyId}
            </Typography>
          </Box>
        </Stack>
      </Container>
    );
  }

  // Show main dashboard after joining
  return <ParticipantDashboard partyId={partyId} partyInfo={partyInfo} />;
}; 