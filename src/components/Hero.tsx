import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Celebration } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from './Navigation';
import { partyService } from '@bellybearsings/firebase-config';

export const Hero: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signInWithProvider } = useAuth();

  // Get returnTo parameter from URL
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo');

  // Debug logging
  useEffect(() => {
    console.log('Hero - URL parameters:', {
      fullUrl: window.location.href,
      search: location.search,
      returnTo: returnTo,
      searchParams: Object.fromEntries(searchParams.entries())
    });
  }, [location.search, returnTo, searchParams]);

  // New state to track if party creation is pending after sign-in
  const [pendingPartyCreation, setPendingPartyCreation] = useState(false);
  const [pendingReturnTo, setPendingReturnTo] = useState<string | null>(returnTo);

  const handlePartyClick = async () => {
    if (loading) return;
    if (user && user.uid) {
      // If there's a returnTo URL, navigate there instead of creating a party
      if (pendingReturnTo) {
        console.log('Hero - Navigating to returnTo URL:', pendingReturnTo);
        navigate(pendingReturnTo);
        return;
      }
      
      // Create a new party and redirect to /party/:partyCode
      try {
        const party = await partyService.createParty(
          user.uid,
          'Karaoke Party',
          {
            maxParticipants: 50,
            allowDuplicates: true,
            requireApproval: false,
            boostsPerPerson: 3,
            maxSongsPerPerson: 10,
          }
        );
        navigate(`/party/${party.code}`);
      } catch (err) {
        console.error('Error creating party:', err);
      }
    } else {
      try {
        console.log('Hero - Starting sign in process, returnTo:', returnTo);
        setPendingPartyCreation(true);
        setPendingReturnTo(returnTo);
        await signInWithProvider('google');
        // No reload! Wait for user to be set, then useEffect will handle navigation
      } catch (error) {
        setPendingPartyCreation(false);
        setPendingReturnTo(null);
        console.error('Google sign in failed:', error);
      }
    }
  };

  // Effect to handle navigation after sign-in if needed
  useEffect(() => {
    if (pendingPartyCreation && user && user.uid && !loading) {
      // If there's a returnTo URL, navigate there
      if (pendingReturnTo) {
        console.log('Hero - Post sign-in, navigating to returnTo URL:', pendingReturnTo);
        setPendingPartyCreation(false);
        setPendingReturnTo(null);
        navigate(pendingReturnTo);
        return;
      }
      
      // Otherwise create party and navigate
      (async () => {
        try {
          const party = await partyService.createParty(
            user.uid,
            'Karaoke Party',
            {
              maxParticipants: 50,
              allowDuplicates: true,
              requireApproval: false,
              boostsPerPerson: 3,
              maxSongsPerPerson: 10,
            }
          );
          setPendingPartyCreation(false);
          navigate(`/party/${party.code}`);
        } catch (err) {
          setPendingPartyCreation(false);
          console.error('Error creating party after sign-in:', err);
        }
      })();
    }
  }, [pendingPartyCreation, user, loading, navigate, pendingReturnTo]);

  // Update button text based on context
  const getButtonText = () => {
    if (pendingReturnTo) {
      return 'Sign In to Join Party';
    }
    return 'Let\'s Party!';
  };

  // Debug what we're showing
  console.log('Hero - Rendering with:', {
    returnTo,
    pendingReturnTo,
    buttonText: getButtonText(),
    isParticipantFlow: !!pendingReturnTo
  });

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        py: { xs: 4, md: 6 },
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Navigation />
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          alignItems="center"
          justifyContent="center"
          textAlign={{ xs: 'center', md: 'left' }}
        >
          <Box flex={1}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              {pendingReturnTo ? 'Join the Party!' : 'The Ultimate Karaoke Party Experience'}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
              }}
            >
              {pendingReturnTo 
                ? 'Sign in with your Google account to join the karaoke party!'
                : 'Host live karaoke parties with real-time song queues, YouTube integration, and seamless guest participation. No downloads required!'
              }
            </Typography>
            
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Button
                onClick={handlePartyClick}
                variant="contained"
                size="large"
                startIcon={<Celebration />}
                sx={{
                  bgcolor: 'black',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                  },
                }}
              >
                {getButtonText()}
              </Button>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              ✨ Guests choose songs • 🎵 Works with your YouTube account • 📱 Any device
            </Typography>
          </Box>
          
          <Box
            flex={1}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Hero Image */}
            <Box
              component="img"
              src={isMobile ? '/images/hero-image-mobile.webp' : '/images/hero-image.webp'}
              alt="Two dogs wearing headphones singing karaoke"
              sx={{
                width: { xs: '100%', md: '100%' },
                maxWidth: { xs: 500, md: 800 },
                height: 'auto',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}; 