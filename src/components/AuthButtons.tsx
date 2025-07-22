import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogo } from './GoogleLogo';

export const AuthButtons: React.FC = () => {
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
    <Button
      onClick={handleGoogleSignUp}
      variant="contained"
      startIcon={<GoogleLogo size={18} />}
      sx={{
        bgcolor: 'black',
        color: 'white',
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.8)',
        },
      }}
    >
      Sign Up with Google
    </Button>
  );
}; 