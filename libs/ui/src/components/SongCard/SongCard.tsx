import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Favorite,
  FavoriteBorder,
  Delete,
  RocketLaunch,
  Person,
  AccessTime,
} from '@mui/icons-material';
import { formatYouTubeDuration } from '@bellybearsings/shared';

export interface SongCardProps {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle?: string;
  duration?: string;
  requesterName?: string;
  isFavorite?: boolean;
  isOwner?: boolean;
  isBoosted?: boolean;
  boostsRemaining?: number;
  onAdd?: () => void;
  onToggleFavorite?: () => void;
  onRemove?: () => void;
  onBoost?: () => void;
  onPlay?: () => void;
  showActions?: boolean;
  variant?: 'search' | 'queue' | 'favorite';
}

export const SongCard: React.FC<SongCardProps> = ({
  title,
  thumbnailUrl,
  channelTitle,
  duration,
  requesterName,
  isFavorite = false,
  isOwner = false,
  isBoosted = false,
  boostsRemaining = 0,
  onAdd,
  onToggleFavorite,
  onRemove,
  onBoost,
  onPlay,
  showActions = true,
  variant = 'search',
}) => {
  const formattedDuration = duration ? formatYouTubeDuration(duration) : '';

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      {isBoosted && (
        <Chip
          icon={<RocketLaunch />}
          label="Boosted"
          color="secondary"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        />
      )}

      <CardMedia
        component="img"
        sx={{
          width: { xs: '100%', sm: 200 },
          height: { xs: 200, sm: 'auto' },
          objectFit: 'cover',
        }}
        image={thumbnailUrl}
        alt={title}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="h5" variant="h6" noWrap>
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            {channelTitle && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {channelTitle}
              </Typography>
            )}
            
            {formattedDuration && (
              <>
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formattedDuration}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          {requesterName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Requested by {requesterName}
              </Typography>
            </Box>
          )}
        </CardContent>

        {showActions && (
          <CardActions sx={{ px: 2, pb: 2 }}>
            {variant === 'search' && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={onAdd}
                  size="small"
                >
                  Add to Queue
                </Button>
                <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton onClick={onToggleFavorite} color={isFavorite ? 'secondary' : 'default'}>
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
              </>
            )}

            {variant === 'queue' && (
              <>
                {onPlay && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrow />}
                    onClick={onPlay}
                    size="small"
                  >
                    Play
                  </Button>
                )}
                {isOwner && !isBoosted && boostsRemaining > 0 && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<RocketLaunch />}
                    onClick={onBoost}
                    size="small"
                  >
                    Boost ({boostsRemaining})
                  </Button>
                )}
                {isOwner && (
                  <Tooltip title="Remove from queue">
                    <IconButton onClick={onRemove} color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}

            {variant === 'favorite' && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={onAdd}
                  size="small"
                >
                  Add to Queue
                </Button>
                <Tooltip title="Remove from favorites">
                  <IconButton onClick={onToggleFavorite} color="error">
                    <Delete />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </CardActions>
        )}
      </Box>
    </Card>
  );
}; 