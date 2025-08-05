import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { firestoreService, functionsService } from '@bellybearsings/firebase-config';
import { ParticipantDashboard } from '../components/ParticipantDashboard';
import { GoogleIdentityDialog } from '../components/GoogleIdentityDialog';
import { useAuth } from '../contexts/AuthContext';

/**
 * Main participant page that handles party joining and dashboard display
 * Requires Google sign-in authentication
 * Shows identity confirmation dialog before joining
 */
export const ParticipantPage: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const { userProfile, loading: authLoading, signOut, signInWithProvider } = useAuth();
  
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [joinError, setJoinError] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);
  const [showIdentityDialog, setShowIdentityDialog] = useState(false);
  const [partyInfo, setPartyInfo] = useState<{ hostName: string; partyName: string } | null>(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [showSafariAuthPrompt, setShowSafariAuthPrompt] = useState(false);

  // Detect Safari
  const isSafari = typeof window !== 'undefined' && 
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Debug logging
  useEffect(() => {
    console.log('ParticipantPage - Auth state:', {
      userProfile: userProfile ? { 
        userId: userProfile.userId, 
        displayName: userProfile.displayName,
        email: userProfile.email 
      } : null,
      authLoading,
      authCheckComplete,
      isSafari,
      userAgent: navigator.userAgent
    });
  }, [userProfile, authLoading, authCheckComplete, isSafari]);

  // Check if already joined on mount
  useEffect(() => {
    checkExistingSession();
  }, [partyId]);

  // Wait for auth to be fully loaded before making decisions
  useEffect(() => {
    if (!authLoading) {
      setAuthCheckComplete(true);
    }
  }, [authLoading]);

  // Show identity dialog if user is authenticated and not already joined
  useEffect(() => {
    if (authCheckComplete && userProfile && !hasJoined && !isLoading) {
      console.log('Showing identity dialog for user:', userProfile.displayName);
      setShowIdentityDialog(true);
    } else if (authCheckComplete && !userProfile && !isLoading) {
      console.log('No user profile found, redirecting to auth');
      // For Safari, show a special prompt if no auth is detected
      if (isSafari) {
        setShowSafariAuthPrompt(true);
      }
    }
  }, [userProfile, hasJoined, isLoading, authCheckComplete, isSafari]);

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
        console.log('Found existing session:', session);
        setHasJoined(true);
        await loadPartyInfo();
      } else {
        console.log('No existing session found');
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
   * Handle identity confirmation and join party
   */
  const handleConfirmIdentity = async () => {
    if (!partyId || !userProfile) {
      return;
    }

    setShowIdentityDialog(false);
    setIsJoining(true);
    setJoinError('');

    try {
      // Check if party exists in localStorage first (for development)
      const localParty = localStorage.getItem(`party-${partyId}`);
      if (localParty) {
        // Party found in localStorage
        
        // Store session in localStorage
        localStorage.setItem(`party-${partyId}-session`, JSON.stringify({
          userId: userProfile.userId,
          displayName: userProfile.displayName,
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
        // Try Firebase function with error handling for CORS
        try {
          const joinResult = await functionsService.joinParty(partyId, userProfile.displayName);
          
          if (joinResult.success) {
            // Store session in localStorage
            localStorage.setItem(`party-${partyId}-session`, JSON.stringify({
              userId: userProfile.userId,
              displayName: userProfile.displayName,
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
          console.error('Firebase join error:', firebaseError);
          
          // Handle CORS or network errors gracefully
          if (firebaseError.message?.includes('CORS') || 
              firebaseError.message?.includes('fetch') ||
              firebaseError.message?.includes('network')) {
            // Fallback: Try to join using direct Firestore operations
            try {
              console.log('Attempting fallback join method...');
              
              // Add user to party guests directly
              await firestoreService.addPartyGuest(partyId, userProfile.userId, {
                displayName: userProfile.displayName,
                boostsRemaining: 3,
                isAnonymous: false,
                isHost: false,
              });
              
              // Store session in localStorage
              localStorage.setItem(`party-${partyId}-session`, JSON.stringify({
                userId: userProfile.userId,
                displayName: userProfile.displayName,
                partyId,
                joinedAt: new Date().toISOString(),
              }));

              // Load party info
              await loadPartyInfo();
              
              setHasJoined(true);
              console.log('Successfully joined using fallback method');
            } catch (fallbackError: any) {
              console.error('Fallback join error:', fallbackError);
              setJoinError('Unable to join party. Please try again later.');
            }
          } else if (firebaseError.message?.includes('not found')) {
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

  /**
   * Handle switching to a different Google account
   */
  const handleSwitchAccount = async () => {
    setShowIdentityDialog(false);
    try {
      await signOut();
      // Redirect to home page with return URL parameter
      const returnUrl = encodeURIComponent(`/participant/${partyId}`);
      window.location.href = `/?returnTo=${returnUrl}`;
    } catch (error) {
      console.error('Error signing out:', error);
      setJoinError('Failed to switch account. Please try again.');
    }
  };

  /**
   * Handle canceling the join process
   */
  const handleCancel = () => {
    setShowIdentityDialog(false);
    // Redirect to home page
    window.location.href = '/';
  };

  /**
   * Handle Safari-specific sign in
   */
  const handleSafariSignIn = async () => {
    try {
      await signInWithProvider('google');
    } catch (error) {
      console.error('Safari sign in failed:', error);
      setJoinError('Failed to sign in. Please try again.');
    }
  };

  // Show Safari-specific auth prompt
  if (showSafariAuthPrompt) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Safari Authentication
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Safari sometimes has issues detecting existing Google sign-in. 
            Please sign in again to join the party.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleSafariSignIn}
            sx={{ mr: 2 }}
          >
            Sign In with Google
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.href = '/'}
          >
            Go to Home Page
          </Button>
        </Box>
      </Container>
    );
  }

  // Show loading while checking authentication and party status
  if (authLoading || isLoading || isJoining) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {isJoining ? 'Joining party...' : 'Loading...'}
          </Typography>
          {authLoading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Checking authentication...
            </Typography>
          )}
        </Box>
      </Container>
    );
  }

  // Redirect to auth if not signed in (only after auth check is complete)
  if (authCheckComplete && !userProfile && !showSafariAuthPrompt) {
    console.log('Redirecting to auth with returnTo parameter');
    // Redirect to home page with return URL parameter
    const returnUrl = encodeURIComponent(`/participant/${partyId}`);
    return <Navigate to={`/?returnTo=${returnUrl}`} replace />;
  }

  if (!partyId) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">Invalid party link</Alert>
      </Container>
    );
  }

  // Show error if joining failed
  if (joinError) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {joinError}
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          <a href="/" style={{ color: 'inherit' }}>Return to home page</a>
        </Typography>
      </Container>
    );
  }

  return (
    <>
      {/* Google Identity Confirmation Dialog */}
      <GoogleIdentityDialog
        open={showIdentityDialog}
        onConfirm={handleConfirmIdentity}
        onCancel={handleCancel}
        onSwitchAccount={handleSwitchAccount}
      />
      
      {/* Show main dashboard after joining */}
      {hasJoined && <ParticipantDashboard partyId={partyId} partyInfo={partyInfo} />}
    </>
  );
}; 