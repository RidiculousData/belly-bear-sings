import React from 'react';
import { Box, Typography } from '@mui/material';

interface WelcomeMessageProps {
  displayName: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ displayName }) => {
  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 80, 
      right: 20, 
      zIndex: 1000,
      bgcolor: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: 2,
      px: 2,
      py: 1,
    }}>
      <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
        Welcome back, {displayName}!
      </Typography>
    </Box>
  );
}; 