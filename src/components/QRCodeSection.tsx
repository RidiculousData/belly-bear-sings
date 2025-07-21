import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import QRCode from 'react-qr-code';

interface QRCodeSectionProps {
  partyCode: string;
  partyId: string;
  onCopyPartyCode: () => void;
}

export const QRCodeSection: React.FC<QRCodeSectionProps> = ({ 
  partyCode, 
  partyId,
  onCopyPartyCode 
}) => {
  const participantUrl = `${window.location.origin}/party/${partyId}/participant`;
  
  return (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
        Join the Party
      </Typography>
      
      <Box sx={{ 
        bgcolor: 'white', 
        p: 1.5, 
        borderRadius: 2,
        display: 'inline-block',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        mb: 2,
      }}>
        <QRCode value={participantUrl} size={120} />
      </Box>
      
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
        Party Code:
      </Typography>
      <Tooltip title="Click to copy">
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: 'monospace', 
            color: 'primary.main',
            cursor: 'pointer',
            userSelect: 'all',
            letterSpacing: '0.1em',
            fontWeight: 'bold',
            p: 1,
            borderRadius: 1,
            border: '2px dashed',
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'white',
            },
          }}
          onClick={onCopyPartyCode}
        >
          {partyCode}
        </Typography>
      </Tooltip>
    </Box>
  );
}; 