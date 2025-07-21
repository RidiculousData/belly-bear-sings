import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { RocketLaunch } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const CTA: React.FC = () => {
  const theme = useTheme();

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
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              startIcon={<RocketLaunch />}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Start Hosting
            </Button>
            
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              No credit card required • Free forever
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}; 