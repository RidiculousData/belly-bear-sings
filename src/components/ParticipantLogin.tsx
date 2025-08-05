import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { GoogleLogo } from './GoogleLogo';

interface ParticipantLoginProps {
  onLogin: () => void;
}

export const ParticipantLogin: React.FC<ParticipantLoginProps> = ({
  onLogin,
}) => {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Join the Party!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sign in with your Google account to add songs to the queue and have fun!
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleLogo />}
          onClick={onLogin}
          sx={{
            bgcolor: 'black',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
        >
          Sign In with Google
        </Button>
      </Box>
    </Container>
  );
}; 