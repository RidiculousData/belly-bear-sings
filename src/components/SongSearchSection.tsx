import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  Snackbar,
} from '@mui/material';
import {
  YouTube,
} from '@mui/icons-material';
import { youtubeService, partyService } from '@bellybearsings/firebase-config';
import type { YouTubeSearchResult } from '@bellybearsings/shared';
import { debounce } from '@bellybearsings/shared';
import { SongPreviewModal } from './SongPreviewModal';
import { SearchResultCard } from './SearchResultCard';

interface SongSearchSectionProps {
  partyId: string;
}

/**
 * Song search section with YouTube integration and preview functionality
 * Mobile-first responsive design with debounced search
 */
export const SongSearchSection: React.FC<SongSearchSectionProps> = ({
  partyId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>('');
  const [previewSong, setPreviewSong] = useState<YouTubeSearchResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [addingToQueue, setAddingToQueue] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  /**
   * Debounced search function to prevent excessive API calls
   */
  const debouncedSearchHandler = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setSearchError('');

      try {
        // Auto-prefix with "karaoke " for better results
        const searchTerm = query.startsWith('karaoke ') ? query : `karaoke ${query}`;
        const results = await youtubeService.searchKaraokeVideos(searchTerm);
        setSearchResults(results);
      } catch (error: any) {
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  /**
   * Handle search input changes
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearchHandler(query);
  };

  /**
   * Handle song preview
   */
  const handlePreview = (song: YouTubeSearchResult) => {
    setPreviewSong(song);
    setPreviewOpen(true);
  };

  /**
   * Handle adding song to queue
   */
  const handleAddToQueue = async (song: YouTubeSearchResult) => {
    const userInfo = getUserInfo();
    if (!userInfo) {
      setSnackbarMessage('Please rejoin the party to add songs');
      setSnackbarOpen(true);
      return;
    }

    setAddingToQueue(song.videoId);
    
    try {
      // Extract artist from channel title or use a default
      const artist = song.channelTitle.replace(/- Topic$/, '').trim();
      
      await partyService.addSongToQueue(partyId, {
        requestedBy: {
          id: userInfo.userId,
          name: userInfo.displayName,
          initials: userInfo.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        },
        videoId: song.videoId,
        title: song.title,
        artist: artist,
        boosted: false,
        boostCount: 0,
      });
      
      setSnackbarMessage('Song added to queue!');
      setSnackbarOpen(true);
      
      // Close preview modal if open
      if (previewOpen) {
        setPreviewOpen(false);
      }
    } catch (error: any) {
      console.error('Error adding song to queue:', error);
      setSnackbarMessage(error.message || 'Failed to add song to queue');
      setSnackbarOpen(true);
    } finally {
      setAddingToQueue(null);
    }
  };

  /**
   * Handle toggling favorite status
   */
  const handleToggleFavorite = (song: YouTubeSearchResult) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(song.videoId)) {
      newFavorites.delete(song.videoId);
    } else {
      newFavorites.add(song.videoId);
    }
    setFavorites(newFavorites);
    // TODO: Persist favorites to Firebase
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      pb: { xs: '70px', md: 0 }, // Account for mobile bottom navigation
    }}>
      {/* Search Header - Fixed */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        zIndex: 10,
        p: 2,
      }}>
        <TextField
          fullWidth
          placeholder="Search for songs..."
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="medium"
          InputProps={{
            startAdornment: <YouTube sx={{ mr: 1, color: 'red' }} />,
            endAdornment: isSearching ? <CircularProgress size={20} /> : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        
        {searchError && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {searchError}
          </Alert>
        )}
      </Box>

      {/* Search Results - Scrollable */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
      }}>
        {searchResults.length === 0 && searchQuery && !isSearching ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No songs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try searching for a different song or artist
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {searchResults.map((song) => (
              <SearchResultCard
                key={song.videoId}
                song={song}
                isFavorite={favorites.has(song.videoId)}
                isAddingToQueue={addingToQueue === song.videoId}
                onPreview={handlePreview}
                onAddToQueue={handleAddToQueue}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Song Preview Modal */}
      <SongPreviewModal
        open={previewOpen}
        song={previewSong}
        onClose={() => setPreviewOpen(false)}
        onAddToQueue={handleAddToQueue}
      />

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