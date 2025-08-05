import React, { useState, useEffect, useRef } from 'react';
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
  const [partyId, setPartyId] = useState<string>('');
  const [showCopiedSnackbar, setShowCopiedSnackbar] = useState(false);
  
  // Player state
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  
  // Get current song
  const currentSong = queue.length > 0 ? queue[currentSongIndex] : null;
  
  // Player control functions
  const handlePlayerReady = (event: any) => {
    playerRef.current = event.target;
  };

  const handlePlayerStateChange = (event: any) => {
    setIsPlaying(event.data === 1); // 1 = playing
  };

  const handlePlayPause = () => {
    if (playerRef.current && currentSong) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleSkipNext = () => {
    if (currentSongIndex < queue.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    }
  };

  const handleSkipPrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
    }
  };

  const handleSeek = (seconds: number) => {
    if (playerRef.current && currentSong) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + seconds);
    }
  };

  const handleVideoEnd = () => {
    handleSkipNext();
  };

  const handleCopyPartyCode = () => {
    if (partyCode) {
      const participantUrl = `${window.location.origin}/participant/${partyCode}`;
      navigator.clipboard.writeText(participantUrl);
      setShowCopiedSnackbar(true);
    }
  };

  // Skip controls
  const canSkipNext = currentSongIndex < queue.length - 1;
  const canSkipPrevious = currentSongIndex > 0;

  // Load party and subscribe to updates
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
          setPartyId(party.id);
          
          // Subscribe to queue updates
          queueUnsubscribe = partyService.subscribeToPartyQueue(
            party.id,
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

          // Subscribe to party guests updates (more reliable than participants array)
          participantsUnsubscribe = firestoreService.subscribeToPartyGuests(
            party.id,
            (guests: any[]) => {
              const participantDetails = guests.map(guest => ({
                id: guest.guestId,
                name: guest.displayName,
                initials: guest.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
                joinedAt: guest.joinedAt,
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

  // Update video when song index changes
  useEffect(() => {
    if (playerRef.current && currentSong) {
      playerRef.current.loadVideoById(currentSong.videoId);
    }
  }, [currentSongIndex, currentSong]);

  // Reset current song index when queue becomes empty
  useEffect(() => {
    if (queue.length === 0) {
      setCurrentSongIndex(0);
      setIsPlaying(false);
    } else if (currentSongIndex >= queue.length) {
      // If current index is beyond queue length, reset to 0
      setCurrentSongIndex(0);
    }
  }, [queue.length, currentSongIndex]);

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
          Authenticated participant link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}; 