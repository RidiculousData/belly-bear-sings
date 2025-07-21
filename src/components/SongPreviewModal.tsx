import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import type { YouTubeSearchResult } from '@bellybearsings/shared';

interface SongPreviewModalProps {
  open: boolean;
  song: YouTubeSearchResult | null;
  onClose: () => void;
  onAddToQueue: (song: YouTubeSearchResult) => void;
}

export const SongPreviewModal: React.FC<SongPreviewModalProps> = ({
  open,
  song,
  onClose,
  onAddToQueue,
}) => {
  if (!song) return null;

  const handleAddToQueue = () => {
    onAddToQueue(song);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
          {song.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {song.channelTitle}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <Box
          sx={{
            position: 'relative',
            paddingTop: '56.25%', // 16:9 aspect ratio
            bgcolor: 'black',
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${song.videoId}?autoplay=1`}
            title={song.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleAddToQueue}
          variant="contained"
          startIcon={<Add />}
          sx={{ textTransform: 'none' }}
        >
          Add to Queue
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 