import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogo } from './GoogleLogo';

export const CTA: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signInWithProvider } = useAuth();

  const handleGoogleSignUp = async () => {
    try {
      await signInWithProvider('google');
      // Redirect to party page after successful authentication
      navigate('/party');
    } catch (error) {
      console.error('Google sign up failed:', error);
    }
  };

  return (
    <Box
      sx={{
        py: 8,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Typography variant="h3" component="h2" fontWeight="bold">
            Ready to Host Your First Karaoke Party?
          </Typography>
          
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Join thousands of hosts who are already creating unforgettable karaoke experiences.
            Start your free party in less than 2 minutes!
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              onClick={handleGoogleSignUp}
              variant="contained"
              size="large"
              startIcon={<GoogleLogo size={20} />}
              sx={{
                bgcolor: 'black',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              Sign Up with Google
            </Button>

          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}; 