import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Stack,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  OpenInNew, 
  PersonAdd, 
  Computer, 
  Smartphone,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';

interface GoogleIdentityDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onSwitchAccount: () => void;
}

export const GoogleIdentityDialog: React.FC<GoogleIdentityDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  onSwitchAccount,
}) => {
  const { userProfile } = useAuth();
  const { partyId } = useParams<{ partyId: string }>();
  const [showSwitchOptions, setShowSwitchOptions] = useState(false);

  const handleSwitchAccount = () => {
    setShowSwitchOptions(true);
  };

  const handleBackToDialog = () => {
    setShowSwitchOptions(false);
  };

  const handleForceSwitch = () => {
    onSwitchAccount();
  };

  const handleOpenIncognito = () => {
    const participantUrl = `${window.location.origin}/participant/${partyId}`;
    // Try to open in incognito window
    window.open(participantUrl, '_blank', 'incognito=yes');
    onCancel(); // Close the dialog
  };

  const handleOpenNewWindow = () => {
    const participantUrl = `${window.location.origin}/participant/${partyId}`;
    window.open(participantUrl, '_blank');
    onCancel(); // Close the dialog
  };

  if (showSwitchOptions) {
    return (
      <Dialog 
        open={open} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Switch Google Account
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Important:</strong> Switching accounts will sign you out of this browser tab. 
              If you're hosting a party in another tab, it will also be affected.
            </Typography>
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Recommended Options:
          </Typography>
          
          <List sx={{ textAlign: 'left' }}>
            <ListItem button onClick={handleOpenIncognito}>
              <ListItemIcon>
                <OpenInNew color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Open in Incognito/Private Window"
                secondary="Use a private browsing window to sign in with a different account"
              />
            </ListItem>
            <ListItem button onClick={handleOpenNewWindow}>
              <ListItemIcon>
                <Computer color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Open in New Window"
                secondary="Open the participant link in a new browser window"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Smartphone color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Use Your Phone"
                secondary="Scan the QR code with your phone's camera"
              />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            If you still want to switch accounts in this browser:
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button 
            onClick={handleBackToDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>
          <Button 
            onClick={handleForceSwitch} 
            variant="contained"
            color="warning"
            sx={{ borderRadius: 2 }}
          >
            Switch Account Anyway
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          Join as Participant
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You're currently signed in with this Google account:
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 3,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              src={userProfile?.photoURL} 
              sx={{ width: 48, height: 48 }}
            >
              {userProfile?.displayName?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {userProfile?.displayName || 'Unknown User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile?.email || 'No email'}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 24, 
              height: 24,
              borderRadius: '50%',
              bgcolor: 'white',
              border: '1px solid #ddd',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </Box>
          </Stack>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Do you want to join the party with this account?
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Tip:</strong> If you need to use a different account, consider using an incognito window 
            or different browser to avoid signing out your host account.
          </Typography>
        </Alert>
        
        <Typography variant="body2" color="text.secondary">
          You can switch to a different Google account if needed.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
        <Button 
          onClick={handleSwitchAccount} 
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Switch Account
        </Button>
        <Button 
          onClick={onCancel} 
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          Join Party
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 