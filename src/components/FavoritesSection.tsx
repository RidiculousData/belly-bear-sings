import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Favorite } from '@mui/icons-material';

interface FavoritesSectionProps {
  partyId: string;
}

/**
 * Favorites section displaying user's saved songs
 * Mobile-first responsive design with empty state
 */
export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  partyId,
}) => {
  const theme = useTheme();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - TODO: Replace with real Firestore data
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setFavorites([]); // Empty for now
      setIsLoading(false);
    }, 1000);
  }, [partyId]);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      pb: { xs: '70px', md: 0 }, // Account for mobile bottom navigation
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Favorite sx={{ color: 'secondary.main' }} />
          My Favorites ({favorites.length})
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Favorite sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No favorites yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Songs you favorite will appear here for quick access
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {/* TODO: Render favorite songs */}
            <Typography variant="body1">
              Favorite songs will be displayed here
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}; 