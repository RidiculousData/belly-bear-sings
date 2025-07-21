import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { RocketLaunch } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Navigation } from './Navigation';

export const Hero: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        py: { xs: 4, md: 6 },
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Navigation />
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          alignItems="center"
          justifyContent="center"
          textAlign={{ xs: 'center', md: 'left' }}
        >
          <Box flex={1}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              The Ultimate Karaoke Party Experience
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
              }}
            >
              Host live karaoke parties with real-time song queues, YouTube integration, 
              and seamless guest participation. No downloads required!
            </Typography>
            
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                size="large"
                startIcon={<RocketLaunch />}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Let's Get This Party Started!
              </Button>
            </Stack>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                opacity: 0.9, 
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              Already have an account?{' '}
              <Typography
                component={Link}
                to="/login"
                sx={{
                  color: 'white',
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                Login
              </Typography>
            </Typography>
            
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              ✨ Free forever • 🎵 Unlimited songs • 📱 Works on any device
            </Typography>
          </Box>
          
          <Box
            flex={1}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Hero Image */}
            <Box
              component="img"
              src={isMobile ? '/images/hero-image-mobile.webp' : '/images/hero-image.webp'}
              alt="Two dogs wearing headphones singing karaoke"
              sx={{
                width: { xs: '100%', md: '100%' },
                maxWidth: { xs: 500, md: 800 },
                height: 'auto',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}; 