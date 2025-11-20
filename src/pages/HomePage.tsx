import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  MusicNote,
  QrCode2,
  RocketLaunch,
  Group,
  YouTube,
  Favorite,
} from '@mui/icons-material';

import { Hero } from '../components/Hero';
import { Feature } from '../components/Feature';
import { CTA } from '../components/CTA';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: <YouTube fontSize="large" />,
      title: 'YouTube Integration',
      description: 'Search and play millions of karaoke tracks directly from YouTube.',
    },
    {
      icon: <QrCode2 fontSize="large" />,
      title: 'Easy Party Joining',
      description: 'Guests join instantly by scanning a QR code. No app download required!',
    },
    {
      icon: <RocketLaunch fontSize="large" />,
      title: 'Song Boosting',
      description: 'Move your song to the top of the queue with limited boosts per party.',
    },
    {
      icon: <Group fontSize="large" />,
      title: 'Real-time Queue',
      description: 'Everyone sees the live queue update as songs are added and played.',
    },
    {
      icon: <Favorite fontSize="large" />,
      title: 'Favorite Songs',
      description: 'Save your go-to karaoke songs for quick access at any party.',
    },
    {
      icon: <MusicNote fontSize="large" />,
      title: 'Social Features',
      description: 'Connect with friends through shared music tastes and playlists.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Hero />
      
      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Everything You Need for the Perfect Karaoke Party
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Feature {...feature} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            How It Works
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h2"
                    color="primary"
                    sx={{ fontSize: '3rem', fontWeight: 'bold', mb: 2 }}
                  >
                    1
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    Host Creates Party
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sign up for free and create a new karaoke party with one click.
                    Get a unique QR code to share with your guests.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h2"
                    color="primary"
                    sx={{ fontSize: '3rem', fontWeight: 'bold', mb: 2 }}
                  >
                    2
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    Guests Join & Queue
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Guests scan the QR code to join instantly. Search YouTube for
                    karaoke songs and add them to the live queue.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h2"
                    color="primary"
                    sx={{ fontSize: '3rem', fontWeight: 'bold', mb: 2 }}
                  >
                    3
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    Sing Your Heart Out
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    The host displays the queue on a big screen. Songs play
                    automatically, and everyone takes their turn!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <CTA />
    </Box>
  );
}; 