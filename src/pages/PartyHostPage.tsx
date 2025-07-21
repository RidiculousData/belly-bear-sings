import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';

export const PartyHostPage: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Party Host View
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Managing party: {partyId}
            </Typography>
          </Box>

          {/* Coming Soon */}
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                🎪 Party Host Dashboard Coming Soon!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The party host dashboard is being developed. Soon you'll be able to:
              </Typography>
              <ul style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <li>View the live song queue</li>
                <li>Control song playback</li>
                <li>Manage party settings</li>
                <li>View guest activity</li>
              </ul>
              <Button
                component={Link}
                to="/dashboard"
                variant="contained"
                size="large"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}; 