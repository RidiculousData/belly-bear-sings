import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Search,
  QueueMusic,
  Favorite,
  Person,
  MusicNote,
} from '@mui/icons-material';

interface DesktopSidebarProps {
  currentTab: 'search' | 'queue' | 'favorites' | 'profile';
  onTabChange: (tab: 'search' | 'queue' | 'favorites' | 'profile') => void;
  partyInfo: {
    hostName: string;
    partyName: string;
  } | null;
}

/**
 * Desktop sidebar navigation for larger screens
 * Fixed position with party info and navigation buttons
 */
export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onTabChange,
  partyInfo,
}) => {
  const theme = useTheme();

  const navigationItems = [
    {
      key: 'search' as const,
      label: 'Search Songs',
      icon: <Search />,
      description: 'Find and add songs to the queue',
    },
    {
      key: 'queue' as const,
      label: 'Party Queue',
      icon: <QueueMusic />,
      description: 'View and manage the live queue',
    },
    {
      key: 'favorites' as const,
      label: 'My Favorites',
      icon: <Favorite />,
      description: 'Your saved favorite songs',
    },
    {
      key: 'profile' as const,
      label: 'My Profile',
      icon: <Person />,
      description: 'Your stats and party info',
    },
  ];

  return (
    <Box sx={{ 
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: 240,
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Party Info */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MusicNote sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {partyInfo?.partyName || 'Karaoke Party'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Host: {partyInfo?.hostName || 'Host'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Stack spacing={1}>
          {navigationItems.map((item) => (
            <Button
              key={item.key}
              variant={currentTab === item.key ? 'contained' : 'text'}
              startIcon={item.icon}
              onClick={() => onTabChange(item.key)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                '&.MuiButton-contained': {
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
                '&.MuiButton-text': {
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" fontWeight="bold">
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {item.description}
                </Typography>
              </Box>
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
          Belly Bear Sings
        </Typography>
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
}; 