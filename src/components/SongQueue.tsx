import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Badge,
  Divider,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents,
  LocalFireDepartment,
  AutoAwesome,
} from '@mui/icons-material';
import { Song } from '../types/party';

interface SongQueueProps {
  queue: Song[];
  currentSongIndex: number;
}

export const SongQueue: React.FC<SongQueueProps> = ({ queue, currentSongIndex }) => {
  const theme = useTheme();

  return (
    <Card sx={{ 
      bgcolor: 'rgba(255, 255, 255, 0.95)', 
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents sx={{ color: theme.palette.primary.main }} />
          Song Queue
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </CardContent>
      
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
        {queue.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            textAlign: 'center',
            py: 4,
          }}>
            <EmojiEvents sx={{ 
              fontSize: 48, 
              color: 'text.secondary', 
              mb: 2,
              opacity: 0.5,
            }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No songs in queue
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Participants can add songs using the party code or QR code
            </Typography>
          </Box>
        ) : (
          <List>
            {queue.map((song, index) => (
              <ListItem
                key={song.id}
                sx={{
                  bgcolor: index === currentSongIndex ? 'action.selected' : 'transparent',
                  borderRadius: 2,
                  mb: 1,
                  position: 'relative',
                  overflow: 'hidden',
                  ...(song.boosted && {
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)',
                      },
                      '70%': {
                        boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)',
                      },
                      '100%': {
                        boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)',
                      },
                    },
                  }),
                }}
              >
                {song.boosted && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                
                <ListItemAvatar>
                  <Badge
                    invisible={!song.boosted}
                    badgeContent={
                      <AutoAwesome sx={{ fontSize: 16, color: '#FFD700' }} />
                    }
                    sx={{
                      '& .MuiBadge-badge': {
                        right: -3,
                        top: 3,
                        animation: 'spin 3s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      {song.requestedBy.initials}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {index + 1}. {song.title}
                      </Typography>
                      {song.boosted && (
                        <Chip
                          size="small"
                          label={`BOOSTED x${song.boostCount}`}
                          sx={{
                            bgcolor: '#FFD700',
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 20,
                            animation: 'flash 1.5s infinite',
                            '@keyframes flash': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.5 },
                            },
                          }}
                          icon={<LocalFireDepartment sx={{ fontSize: 14 }} />}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      by {song.artist}
                    </Typography>
                  }
                />
                
                {index === currentSongIndex && (
                  <ListItemSecondaryAction>
                    <Chip
                      label="NOW PLAYING"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Card>
  );
}; 