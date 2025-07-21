import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Person,
  RocketLaunch,
  MusicNote,
  Favorite,
} from '@mui/icons-material';

interface ProfileSectionProps {
  partyId: string;
  partyInfo: {
    hostName: string;
    partyName: string;
  } | null;
}

/**
 * Profile section displaying user stats and party information
 * Mobile-first responsive design with user metrics
 */
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  partyId,
  partyInfo,
}) => {
  const theme = useTheme();
  const [userStats, setUserStats] = useState({
    displayName: 'Guest User',
    boostsRemaining: 3,
    songsAdded: 0,
    favoritesCount: 0,
  });

  // Mock data for now - TODO: Replace with real user data
  useEffect(() => {
    // Simulate loading user data
    setUserStats({
      displayName: 'Guest User',
      boostsRemaining: 3,
      songsAdded: 0,
      favoritesCount: 0,
    });
  }, [partyId]);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      pb: { xs: '70px', md: 0 }, // Account for mobile bottom navigation
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ color: 'primary.main' }} />
          My Profile
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Stack spacing={3}>
          {/* User Info Card */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {userStats.displayName.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {userStats.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Party Participant
                  </Typography>
                </Box>
              </Box>

              {/* Boost Credits */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 2,
                bgcolor: 'rgba(255, 215, 0, 0.1)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(255, 215, 0, 0.3)',
              }}>
                <RocketLaunch sx={{ color: '#FFD700' }} />
                <Typography variant="body1" fontWeight="bold">
                  {userStats.boostsRemaining} Boost Credits Remaining
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <MusicNote sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {userStats.songsAdded}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Songs Added
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Favorite sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {userStats.favoritesCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Favorites
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Party Info Card */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Party Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Party Name
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {partyInfo?.partyName || 'Karaoke Party'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Host
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {partyInfo?.hostName || 'Host'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Party Code
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    sx={{ 
                      fontFamily: 'monospace',
                      bgcolor: 'grey.100',
                      p: 1,
                      borderRadius: 1,
                      display: 'inline-block',
                    }}
                  >
                    {partyId}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Help Text */}
          <Card sx={{ borderRadius: 2, bgcolor: 'info.50' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Tip:</strong> Use your boost credits to move your songs to the top of the queue. 
                You get 3 boosts per party session.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}; 