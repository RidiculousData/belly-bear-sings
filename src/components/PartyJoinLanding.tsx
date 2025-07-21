import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { MusicNote, Person, Group } from '@mui/icons-material';

interface PartyJoinLandingProps {
  partyId: string;
  onJoinParty: (displayName: string) => Promise<void>;
  isJoining: boolean;
  error: string;
  partyInfo: {
    hostName: string;
    partyName: string;
  } | null;
}

/**
 * Landing page for party joining with welcome message and name input
 * Mobile-first responsive design with clear call-to-action
 */
export const PartyJoinLanding: React.FC<PartyJoinLandingProps> = ({
  partyId,
  onJoinParty,
  isJoining,
  error,
  partyInfo,
}) => {
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      await onJoinParty(displayName.trim());
    }
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        py: 4, 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={4}>
        {/* Header */}
        <Box textAlign="center">
          <MusicNote 
            sx={{ 
              fontSize: 64, 
              color: 'primary.main',
              mb: 2,
            }} 
          />
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'text.primary',
            }}
          >
            Welcome to the Party!
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {partyInfo?.hostName || 'Host'}'s Karaoke Party
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
          >
            Please tell us who you are
          </Typography>
        </Box>

        {/* Join Form */}
        <Card 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  variant="outlined"
                  size="medium"
                  autoFocus
                  disabled={isJoining}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '1.1rem',
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!displayName.trim() || isJoining}
                  startIcon={isJoining ? <CircularProgress size={20} /> : <Group />}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                  }}
                >
                  {isJoining ? 'Joining Party...' : 'Join Party'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {/* Party Info */}
        <Box textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Party Code: {partyId}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}; 