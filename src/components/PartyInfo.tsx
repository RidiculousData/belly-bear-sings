import React from 'react';
import {
  Stack,
} from '@mui/material';
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

  return (
    <Stack 
      spacing={2} 
      sx={{ 
        height: '100%',
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        p: 3,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* QR Code Section with Party Code */}
      <QRCodeSection 
        partyCode={partyCode} 
        partyId={partyId}
        onCopyPartyCode={onCopyPartyCode} 
      />

      {/* Participants Section - moved up to save space */}
      <ParticipantsSection participants={participants} />
    </Stack>
  );
}; 