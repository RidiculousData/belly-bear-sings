import React from 'react';
import { AppBar, Toolbar, Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { BrandLogo } from './BrandLogo';
import { UserMenu } from './UserMenu';
import { AuthButtons } from './AuthButtons';

export const Navigation: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: user ? 'background.paper' : 'rgba(255, 255, 255, 0.85)',
        boxShadow: user ? 1 : 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backdropFilter: user ? 'none' : 'blur(10px)',
        borderBottom: user ? '1px solid' : '1px solid rgba(0, 0, 0, 0.08)',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <BrandLogo isAuthenticated={!!user} />
          
          {user ? (
            <UserMenu 
              user={user} 
              userProfile={userProfile} 
              onSignOut={signOut} 
            />
          ) : (
            <AuthButtons />
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}; 