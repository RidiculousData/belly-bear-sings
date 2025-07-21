import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  RocketLaunch,
  Delete,
  MusicNote,
} from '@mui/icons-material';

interface QueueItemCardProps {
  song: any; // Using any for now to avoid type issues
  index: number;
  isMySong: boolean;
  boostsRemaining: number;
  isBoosting?: boolean;
  onBoost: (songId: string) => void;
  onRemove: (songId: string) => void;
}

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  song,
  index,
  isMySong,
  boostsRemaining,
  isBoosting = false,
  onBoost,
  onRemove,
}) => {
  const canBoost = boostsRemaining > 0 && !song.boosted && !isMySong;

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: song.boosted ? '2px solid' : '1px solid',
        borderColor: song.boosted ? 'secondary.main' : 'divider',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Position Number */}
          <Avatar
            sx={{
              bgcolor: song.boosted ? 'secondary.main' : 'primary.main',
              width: 40,
              height: 40,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            {index + 1}
          </Avatar>

          {/* Song Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
              {song.artist}
            </Typography>
            
            {/* Metadata */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={song.requestedBy.name}
                size="small"
                icon={<MusicNote fontSize="small" />}
                sx={{ 
                  bgcolor: isMySong ? 'primary.light' : 'background.default',
                  color: isMySong ? 'primary.contrastText' : 'text.primary',
                }}
              />
              {song.boosted && (
                <Chip
                  label={`Boosted (${song.boostCount})`}
                  size="small"
                  color="secondary"
                  icon={<RocketLaunch fontSize="small" />}
                />
              )}
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canBoost && (
              <IconButton
                size="small"
                onClick={() => onBoost(song.id)}
                disabled={isBoosting}
                sx={{
                  color: 'secondary.main',
                  '&:hover': {
                    bgcolor: 'secondary.light',
                  },
                }}
              >
                {isBoosting ? <CircularProgress size={20} /> : <RocketLaunch />}
              </IconButton>
            )}
            {isMySong && (
              <IconButton
                size="small"
                onClick={() => onRemove(song.id)}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                  },
                }}
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}; 