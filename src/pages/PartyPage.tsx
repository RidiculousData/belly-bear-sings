import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';

import { Navigation } from '../components/Navigation';
import { VideoPlayer } from '../components/VideoPlayer';
import { SongQueue } from '../components/SongQueue';
import { PartyInfo } from '../components/PartyInfo';
import { useParams } from 'react-router-dom';
import { usePartyData } from '../hooks/usePartyData';
import { usePlayerControls } from '../hooks/usePlayerControls';

export const PartyPage: React.FC = () => {
  const { partyCode } = useParams<{ partyCode: string }>();
  const [showCopiedSnackbar, setShowCopiedSnackbar] = useState(false);

  const { queue, participants, loading, error, partyId } = usePartyData(partyCode);
  const {
    currentSongIndex,
    isPlaying,
    handlePlayerReady,
    handlePlayerStateChange,
    handlePlayPause,
    handleSkipNext,
    handleSkipPrevious,
    handleSeek,
    handleVideoEnd,
    canSkipNext,
    canSkipPrevious,
  } = usePlayerControls(queue);

  const currentSong = queue.length > 0 ? queue[currentSongIndex] : null;

  const handleCopyPartyCode = () => {
    if (partyCode) {
      const participantUrl = `${window.location.origin}/participant/${partyCode}`;
      navigator.clipboard.writeText(participantUrl);
      setShowCopiedSnackbar(true);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: 'background.default',
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
          bgcolor: 'background.default',
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
        bgcolor: 'background.default',
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
