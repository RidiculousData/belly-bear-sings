import React, { useState } from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  QueueMusic,
  Favorite,
  Person,
} from '@mui/icons-material';
import { SongSearchSection } from './SongSearchSection';
import { QueueSection } from './QueueSection';
import { FavoritesSection } from './FavoritesSection';
import { ProfileSection } from './ProfileSection';
import { DesktopSidebar } from './DesktopSidebar';

interface ParticipantDashboardProps {
  partyId: string;
  partyInfo: {
    hostName: string;
    partyName: string;
  } | null;
}

type TabValue = 'search' | 'queue' | 'favorites' | 'profile';

/**
 * Main participant dashboard with responsive navigation
 * Mobile: Bottom navigation, Desktop: Sidebar navigation
 */
export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  partyId,
  partyInfo,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentTab, setCurrentTab] = useState<TabValue>('search');

  const renderContent = () => {
    switch (currentTab) {
      case 'search':
        return <SongSearchSection partyId={partyId} />;
      case 'queue':
        return <QueueSection partyId={partyId} />;
      case 'favorites':
        return <FavoritesSection partyId={partyId} />;
      case 'profile':
        return <ProfileSection partyId={partyId} partyInfo={partyInfo} />;
      default:
        return <SongSearchSection partyId={partyId} />;
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        pl: { xs: 0, md: '240px' }, // Account for desktop sidebar
      }}>
        {renderContent()}
      </Box>

      {/* Mobile Bottom Navigation */}
      <Box sx={{ 
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 1000,
        height: 70,
      }}>
        <BottomNavigation
          value={currentTab}
          onChange={(event, newValue) => setCurrentTab(newValue)}
          sx={{
            height: '100%',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
            },
          }}
        >
          <BottomNavigationAction
            label="Search"
            value="search"
            icon={<Search />}
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              }
            }}
          />
          <BottomNavigationAction
            label="Queue"
            value="queue"
            icon={<QueueMusic />}
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              }
            }}
          />
          <BottomNavigationAction
            label="Favorites"
            value="favorites"
            icon={<Favorite />}
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              }
            }}
          />
          <BottomNavigationAction
            label="Profile"
            value="profile"
            icon={<Person />}
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              }
            }}
          />
        </BottomNavigation>
      </Box>

      {/* Desktop Sidebar */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <DesktopSidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          partyInfo={partyInfo}
        />
      </Box>
    </Box>
  );
}; 