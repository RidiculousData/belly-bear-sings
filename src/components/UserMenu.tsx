import React, { useState } from 'react';
import {
  Stack,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
} from '@mui/material';
import { AccountCircle, Logout as LogoutIcon, Dashboard as DashboardIcon, Schema as SchemaIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { User as AppUser } from '@bellybearsings/shared';

interface UserMenuProps {
  user: User;
  userProfile: AppUser | null;
  onSignOut: () => Promise<void>;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, userProfile, onSignOut }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleDashboard = () => {
    handleClose();
    navigate('/dashboard');
  };

  const handleDomainModel = () => {
    handleClose();
    navigate('/domain-model');
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await onSignOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get initials from first and last name, or fall back to display name or email
  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
    }
    if (userProfile?.displayName) {
      const name = userProfile.displayName;
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  // Get welcome name - prefer firstName, then display name, then email prefix
  const getWelcomeName = () => {
    if (userProfile?.firstName) {
      return userProfile.firstName;
    }
    return userProfile?.displayName || user?.email?.split('@')[0] || 'User';
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'text.primary',
          fontWeight: 400,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        Welcome back, {getWelcomeName()}!
      </Typography>
      
      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
        sx={{
          ml: 2,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: theme.palette.primary.main,
          }}
          src={userProfile?.photoURL || undefined}
        >
          {getInitials()}
        </Avatar>
      </IconButton>
      
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {userProfile?.displayName || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleDashboard}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDomainModel}>
          <ListItemIcon>
            <SchemaIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Domain Model</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
}; 