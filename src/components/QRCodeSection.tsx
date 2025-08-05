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
  onCopyPartyCode 
}) => {
  // Use the new participant URL format that requires authentication
  const participantUrl = `${window.location.origin}/participant/${partyCode}`;
  
  return (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
        Join the Party
      </Typography>
      
      <Tooltip title="Click to copy participant link">
        <Box 
          onClick={onCopyPartyCode}
          sx={{ 
            bgcolor: 'white', 
            p: 2, 
            borderRadius: 2,
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            mb: 2,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <QRCode value={participantUrl} size={120} />
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'monospace', 
              color: 'primary.main',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              mt: 1,
            }}
          >
            {partyCode}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}; 