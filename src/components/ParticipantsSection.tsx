import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Tooltip,
} from '@mui/material';
import { Participant } from '../types/party';

interface ParticipantsSectionProps {
  participants: Participant[];
}

// Rainbow colors for participant avatars
const rainbowColors = [
  '#FF6B6B', // Red
  '#FF8E53', // Orange
  '#FFA726', // Yellow-Orange
  '#FFCC02', // Yellow
  '#8BC34A', // Green
  '#26C6DA', // Cyan
  '#42A5F5', // Blue
  '#AB47BC', // Purple
  '#EC407A', // Pink
  '#FF5722', // Deep Orange
];

export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({ 
  participants 
}) => {
  const getParticipantColor = (index: number) => {
    return rainbowColors[index % rainbowColors.length];
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold', mb: 2 }}>
        Party People ({participants.length})
      </Typography>
      
      <Stack spacing={2}>
        {participants.map((participant, index) => (
          <Box key={participant.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={participant.name}>
              <Avatar 
                sx={{ 
                  bgcolor: getParticipantColor(index),
                  color: 'white',
                  width: 40,
                  height: 40,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)' },
                  },
                }}
              >
                {participant.initials}
              </Avatar>
            </Tooltip>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {participant.name}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}; 