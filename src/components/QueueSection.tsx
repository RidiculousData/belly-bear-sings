import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  CircularProgress,
  useTheme,
  Snackbar,
} from '@mui/material';
import {
  QueueMusic,
} from '@mui/icons-material';
import { partyService, firestoreService } from '@bellybearsings/firebase-config';
import type { PartyGuest } from '@bellybearsings/shared';
import { QueueItemCard } from './QueueItemCard';

interface QueueSectionProps {
  partyId: string;
}

type QueueFilter = 'all' | 'my' | 'boosted';

/**
 * Queue section displaying live party queue with filtering options
 * Real-time updates with mobile-first responsive design
 */
export const QueueSection: React.FC<QueueSectionProps> = ({
  partyId,
}) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [boostsRemaining, setBoostsRemaining] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [boosting, setBoosting] = useState<string | null>(null);

  // Get user info from localStorage
  const getUserInfo = () => {
    const sessionData = localStorage.getItem(`party-${partyId}-session`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      return {
        userId: session.userId,
        displayName: session.displayName,
      };
    }
    return null;
  };

  // Subscribe to real-time queue updates
  useEffect(() => {
    if (!partyId) return;

    setIsLoading(true);
    setError('');

    const unsubscribe = partyService.subscribeToPartyQueue(
      partyId,
      (songs: any[]) => {
        setQueue(songs);
        setIsLoading(false);
      }
    );

    // Load user's boost count
    const userInfo = getUserInfo();
    if (userInfo) {
      loadUserBoosts(userInfo.userId);
    }

    return () => {
      unsubscribe();
    };
  }, [partyId]);

  /**
   * Load user's remaining boosts
   */
  const loadUserBoosts = async (userId: string) => {
    try {
      const guests = await firestoreService.getPartyGuests(partyId);
      const currentGuest = guests.find((g: PartyGuest) => g.guestId === userId);
      if (currentGuest) {
        setBoostsRemaining(currentGuest.boostsRemaining);
      }
    } catch (error) {
      console.error('Error loading boosts:', error);
    }
  };

  /**
   * Get filtered queue based on current filter
   */
  const getFilteredQueue = () => {
    const userInfo = getUserInfo();
    if (!userInfo) return queue;

    switch (queueFilter) {
      case 'my':
        return queue.filter(song => song.requestedBy.id === userInfo.userId);
      case 'boosted':
        return queue.filter(song => song.boosted);
      case 'all':
      default:
        return queue;
    }
  };

  /**
   * Handle boost song action
   */
  const handleBoostSong = async (songId: string) => {
    const userInfo = getUserInfo();
    if (!userInfo) {
      setSnackbarMessage('Please rejoin the party to boost songs');
      setSnackbarOpen(true);
      return;
    }

    if (boostsRemaining <= 0) {
      setSnackbarMessage('No boosts remaining');
      setSnackbarOpen(true);
      return;
    }

    setBoosting(songId);

    try {
      await partyService.boostSong(songId);
      
      // Update local boost count
      const newBoostCount = boostsRemaining - 1;
      setBoostsRemaining(newBoostCount);
      
      // Update in Firestore
      await firestoreService.addPartyGuest(partyId, userInfo.userId, {
        displayName: userInfo.displayName,
        boostsRemaining: newBoostCount,
        isAnonymous: true,
        isHost: false,
      });
      
      setSnackbarMessage('Song boosted to top of queue!');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error boosting song:', error);
      setSnackbarMessage(error.message || 'Failed to boost song');
      setSnackbarOpen(true);
    } finally {
      setBoosting(null);
    }
  };

  /**
   * Handle remove song action
   */
  const handleRemoveSong = async (songId: string) => {
    const userInfo = getUserInfo();
    if (!userInfo) {
      setSnackbarMessage('Please rejoin the party to manage songs');
      setSnackbarOpen(true);
      return;
    }

    try {
      // Find the song to check ownership
      const song = queue.find(s => s.id === songId);
      if (!song || song.requestedBy.id !== userInfo.userId) {
        setSnackbarMessage('You can only remove your own songs');
        setSnackbarOpen(true);
        return;
      }

      await firestoreService.removeSongFromQueue(partyId, songId);
      setSnackbarMessage('Song removed from queue');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error removing song:', error);
      setSnackbarMessage(error.message || 'Failed to remove song');
      setSnackbarOpen(true);
    }
  };

  const filteredQueue = getFilteredQueue();
  const userInfo = getUserInfo();

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      pb: { xs: '70px', md: 0 }, // Account for mobile bottom navigation
    }}>
      {/* Queue Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QueueMusic sx={{ color: 'primary.main' }} />
            Party Queue ({queue.length} songs)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={`${boostsRemaining} boosts left`}
              color="secondary"
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        
        {/* Filter Tabs */}
        <ToggleButtonGroup
          value={queueFilter}
          exclusive
          onChange={(_, value) => value && setQueueFilter(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <ToggleButton value="all">All Songs</ToggleButton>
          <ToggleButton value="my">My Songs</ToggleButton>
          <ToggleButton value="boosted">Boosted</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Queue List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : filteredQueue.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <QueueMusic sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {queueFilter === 'all' ? 'No songs in queue' : 'No songs match filter'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {queueFilter === 'all' 
                ? 'Be the first to add a song!' 
                : 'Try a different filter or add some songs'
              }
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {filteredQueue.map((song, index) => (
              <QueueItemCard
                key={song.id}
                song={song}
                index={index}
                isMySong={userInfo ? song.requestedBy.id === userInfo.userId : false}
                boostsRemaining={boostsRemaining}
                isBoosting={boosting === song.id}
                onBoost={handleBoostSong}
                onRemove={handleRemoveSong}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}; 