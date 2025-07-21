import React from 'react';
import { Button, Stack } from '@mui/material';
import { Login, PersonAdd } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const AuthButtons: React.FC = () => {
  return (
    <Stack direction="row" spacing={2}>
      <Button
        component={Link}
        to="/login"
        variant="outlined"
        startIcon={<Login />}
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.5)',
          color: 'white',
          '&:hover': {
            borderColor: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Login
      </Button>
      
      <Button
        component={Link}
        to="/signup"
        variant="contained"
        startIcon={<PersonAdd />}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.3)',
          },
        }}
      >
        Sign Up
      </Button>
    </Stack>
  );
}; 