import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { QRCodeSection } from './QRCodeSection';
import { ParticipantsSection } from './ParticipantsSection';
import { Participant } from '../types/party';

interface PartyInfoProps {
  partyCode: string;
  partyId: string;
  participants: Participant[];
  onCopyPartyCode: () => void;
}

export const PartyInfo: React.FC<PartyInfoProps> = ({
  partyCode,
  partyId,
  participants,
  onCopyPartyCode,
}) => {
  const participantUrl = `${window.location.origin}/party/${partyId}/participant`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(participantUrl);
    // You might want to show a snackbar here
  };

  return (
    <Stack 
      spacing={3} 
      sx={{ 
        height: '100%',
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        p: 3,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Party Header */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
          Party Central
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Manage your karaoke party
        </Typography>
      </Box>

      {/* QR Code Section */}
      <QRCodeSection 
        partyCode={partyCode} 
        partyId={partyId}
        onCopyPartyCode={onCopyPartyCode} 
      />

      {/* Participant URL Button */}
      <Button
        fullWidth
        variant="contained"
        startIcon={<LinkIcon />}
        onClick={handleCopyUrl}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.2)',
          },
          textTransform: 'none',
          py: 1.5,
        }}
      >
        Copy Participant Link
      </Button>

      {/* Participants Section */}
      <ParticipantsSection participants={participants} />
    </Stack>
  );
}; 