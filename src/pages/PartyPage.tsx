import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Stack,
  Snackbar,
  Alert,
  useTheme,
  CircularProgress,
  Typography,
} from '@mui/material';

import { Navigation } from '../components/Navigation';
import { VideoPlayer } from '../components/VideoPlayer';
import { SongQueue } from '../components/SongQueue';
import { PartyInfo } from '../components/PartyInfo';
import { usePartyPlayer } from '../hooks/usePartyPlayer';
import { Song, Participant } from '../types/party';
import { partyService, firestoreService } from '@bellybearsings/firebase-config';
import { useParams } from 'react-router-dom';

export const PartyPage: React.FC = () => {
  const theme = useTheme();
  const { partyCode } = useParams<{ partyCode: string }>();
  
  const [queue, setQueue] = useState<Song[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const {
    currentSong,
    currentSongIndex,
    isPlaying,
    partyId,
    showCopiedSnackbar,
    canSkipNext,
    canSkipPrevious,
    handlePlayerReady,
    handlePlayerStateChange,
    handlePlayPause,
    handleSkipNext,
    handleSkipPrevious,
    handleSeek,
    handleVideoEnd,
    handleCopyPartyCode,
    setShowCopiedSnackbar,
  } = usePartyPlayer(queue, participants);

  // Subscribe to real-time queue updates
  useEffect(() => {
    if (!partyId) return;

    setLoading(true);
    setError('');

    let queueUnsubscribe: (() => void) | undefined;
    let participantsUnsubscribe: (() => void) | undefined;

    try {
      // Subscribe to queue updates
      queueUnsubscribe = partyService.subscribeToPartyQueue(
        partyId,
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

      // Subscribe to participants updates
      participantsUnsubscribe = partyService.subscribeToPartyParticipants(
        partyId,
        async (participantIds: string[]) => {
          try {
            // Get participant details from Firebase
            const participantDetails = await Promise.all(
              participantIds.map(async (id) => {
                // Try to get user info from party guests
                const guests = await firestoreService.getPartyGuests(partyId);
                const guest = guests.find((g: any) => g.guestId === id);
                
                if (guest) {
                  return {
                    id: guest.guestId,
                    name: guest.displayName,
                    initials: guest.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
                    joinedAt: guest.joinedAt,
                  };
                }
                
                // Fallback for cases where guest info is not available
                return {
                  id,
                  name: `Guest ${id.substring(0, 6)}`,
                  initials: 'G',
                  joinedAt: new Date(),
                };
              })
            );
            
            setParticipants(participantDetails);
          } catch (error) {
            console.error('Error loading participant details:', error);
            // Set basic participant info if detailed info fails
            const basicParticipants = participantIds.map(id => ({
              id,
              name: `Guest ${id.substring(0, 6)}`,
              initials: 'G',
              joinedAt: new Date(),
            }));
            setParticipants(basicParticipants);
          }
        }
      );
    } catch (err) {
      console.error('Error setting up subscriptions:', err);
      setError('Failed to load party data. Please try again.');
      setLoading(false);
    }

    return () => {
      queueUnsubscribe?.();
      participantsUnsubscribe?.();
    };
  }, [partyId]);

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7E6 100%)',
          minHeight: '100vh',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} sx={{ color: 'white' }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Loading party...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7E6 100%)',
          minHeight: '100vh',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7E6 100%)',
        minHeight: '100vh',
        color: 'primary.main',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Navigation />
      
      <Container maxWidth="xl" sx={{ pt: 11, pb: 2, height: '100vh', overflow: 'hidden', mt: 3 }}>
        <Grid container spacing={3} sx={{ height: 'calc(100% - 100px)' }}>
          {/* Main Video Section */}
          <Grid item xs={12} lg={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <VideoPlayer
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onSkipNext={handleSkipNext}
                onSkipPrevious={handleSkipPrevious}
                onSeek={handleSeek}
                onVideoEnd={handleVideoEnd}
                onPlayerReady={handlePlayerReady}
                onPlayerStateChange={handlePlayerStateChange}
                canSkipNext={canSkipNext}
                canSkipPrevious={canSkipPrevious}
              />
            </Stack>
          </Grid>

          {/* Queue Section */}
          <Grid item xs={12} lg={3.5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <SongQueue
              queue={queue}
              currentSongIndex={currentSongIndex}
            />
          </Grid>

          {/* Party Info Section */}
          <Grid item xs={12} lg={2.5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PartyInfo
              partyCode={partyCode || ''}
              partyId={partyId}
              participants={participants}
              onCopyPartyCode={handleCopyPartyCode}
            />
          </Grid>
        </Grid>
      </Container>
      {/* Snackbar for copy notification */}
      <Snackbar
        open={showCopiedSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowCopiedSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowCopiedSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Party code copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}; 