import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  isAuthenticated: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ isAuthenticated }) => {
  // Use dark color for better visibility on light backgrounds
  // When over Hero gradient, the Navigation backdrop should provide contrast
  return (
    <Typography 
      variant="h5" 
      component={Link}
      to="/"
      sx={{ 
        fontWeight: 700,
        color: '#1a1a1a',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.5rem',
        letterSpacing: '-0.02em',
        '&:hover': {
          opacity: 0.8,
        },
      }}
    >
      🎤 Belly Bear Sings
    </Typography>
  );
}; 