import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  isAuthenticated: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ isAuthenticated }) => {
  return (
    <Typography 
      variant="h5" 
      component={Link}
      to={isAuthenticated ? '/dashboard' : '/'}
      sx={{ 
        fontWeight: 'bold',
        color: isAuthenticated ? 'primary.main' : 'white',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
          opacity: 0.8,
        },
      }}
    >
      🎤 Belly Bear Sings
    </Typography>
  );
}; 