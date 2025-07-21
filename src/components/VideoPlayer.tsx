import React, { useRef, useEffect } from 'react';
import {
  Box,
  Card,
  IconButton,
  Stack,
  useTheme,
  Typography,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  FastForward,
  FastRewind,
} from '@mui/icons-material';
import YouTube from 'react-youtube';
import { Song } from '../types/party';

interface VideoPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onSeek: (seconds: number) => void;
  onVideoEnd: () => void;
  onPlayerReady: (event: any) => void;
  onPlayerStateChange: (event: any) => void;
  canSkipNext: boolean;
  canSkipPrevious: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onSkipNext,
  onSkipPrevious,
  onSeek,
  onVideoEnd,
  onPlayerReady,
  onPlayerStateChange,
  canSkipNext,
  canSkipPrevious,
}) => {
  const theme = useTheme();
  const playerRef = useRef<any>(null);

  // Update video when song changes
  useEffect(() => {
    if (playerRef.current && currentSong) {
      playerRef.current.loadVideoById(currentSong.videoId);
    }
  }, [currentSong]);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1 as 0 | 1,
      modestbranding: 1 as 1,
      rel: 0 as 0 | 1,
    },
  };

  return (
    <>
      <style>
        {`
          .youtube-player iframe {
            width: 100% !important;
            height: 100% !important;
          }
        `}
      </style>
      <Card 
        sx={{ 
          bgcolor: 'rgba(0, 0, 0, 0.9)', 
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'black',
        }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentSong ? (
              <Box sx={{ width: '100%', height: '100%' }}>
                <YouTube
                  videoId={currentSong.videoId}
                  opts={opts}
                  onReady={onPlayerReady}
                  onStateChange={onPlayerStateChange}
                  onEnd={onVideoEnd}
                  style={{ width: '100%', height: '100%' }}
                  className="youtube-player"
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  No songs in queue
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Waiting for participants to add songs...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Video Controls */}
        <Box sx={{ py: 1, px: 2, bgcolor: 'rgba(0, 0, 0, 0.8)' }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <IconButton onClick={onSkipPrevious} disabled={!canSkipPrevious}>
              <SkipPrevious sx={{ color: 'white' }} />
            </IconButton>
            <IconButton onClick={() => onSeek(-10)}>
              <FastRewind sx={{ color: 'white' }} />
            </IconButton>
            <IconButton 
              onClick={onPlayPause}
              disabled={!currentSong}
              sx={{ 
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark },
                '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                p: 2,
              }}
            >
              {isPlaying ? <Pause sx={{ color: 'white', fontSize: 32 }} /> : <PlayArrow sx={{ color: 'white', fontSize: 32 }} />}
            </IconButton>
            <IconButton onClick={() => onSeek(10)}>
              <FastForward sx={{ color: 'white' }} />
            </IconButton>
            <IconButton onClick={onSkipNext} disabled={!canSkipNext}>
              <SkipNext sx={{ color: 'white' }} />
            </IconButton>
          </Stack>
        </Box>
      </Card>
    </>
  );
}; 