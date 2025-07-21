import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import type { YouTubeSearchResult } from '@bellybearsings/shared';

interface SearchResultCardProps {
  song: YouTubeSearchResult;
  isFavorite: boolean;
  isAddingToQueue?: boolean;
  onPreview: (song: YouTubeSearchResult) => void;
  onAddToQueue: (song: YouTubeSearchResult) => void;
  onToggleFavorite: (song: YouTubeSearchResult) => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  song,
  isFavorite,
  isAddingToQueue = false,
  onPreview,
  onAddToQueue,
  onToggleFavorite,
}) => {
  // Format duration from ISO 8601 to readable format
  const formatDuration = (duration?: string) => {
    if (!duration) return '';
    
    // Parse ISO 8601 duration (e.g., PT4M13S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card 
      sx={{ 
        display: 'flex',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* Thumbnail */}
      <CardMedia
        component="img"
        sx={{ width: 120, height: 90, objectFit: 'cover' }}
        image={song.thumbnailUrl}
        alt={song.title}
      />
      
      {/* Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', py: 1, px: 2 }}>
          <Typography 
            component="div" 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {song.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {song.channelTitle}
          </Typography>
          {song.duration && (
            <Chip 
              label={formatDuration(song.duration)} 
              size="small" 
              sx={{ mt: 0.5 }}
            />
          )}
        </CardContent>
        
        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, pb: 1 }}>
          <IconButton 
            size="small" 
            onClick={() => onPreview(song)}
            sx={{ color: 'primary.main' }}
          >
            <PlayArrow />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onAddToQueue(song)}
            disabled={isAddingToQueue}
            sx={{ color: 'success.main' }}
          >
            {isAddingToQueue ? <CircularProgress size={20} /> : <Add />}
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onToggleFavorite(song)}
            sx={{ color: isFavorite ? 'error.main' : 'text.secondary' }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}; 