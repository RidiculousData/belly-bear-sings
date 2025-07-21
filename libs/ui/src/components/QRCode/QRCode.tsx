import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import QRCodeLib from 'react-qr-code';

export interface QRCodeProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 256,
  title,
  subtitle,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
      }}
    >
      {title && (
        <Typography variant="h6" component="h3" align="center">
          {title}
        </Typography>
      )}
      
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <QRCodeLib
          value={value}
          size={size}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          viewBox={`0 0 256 256`}
        />
      </Box>
      
      {subtitle && (
        <Typography variant="body2" color="text.secondary" align="center">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}; 