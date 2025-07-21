import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';

interface FeatureProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

export const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <Card
      sx={{
        height: '100%',
        textAlign: 'center',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
        
        <Typography variant="h5" component="h3" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}; 