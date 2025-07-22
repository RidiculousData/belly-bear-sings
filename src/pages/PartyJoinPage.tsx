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

export const PartyJoinPage: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh', background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7E6 100%)' }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Header */}
          <Box textAlign="center">
            <Typography variant="h3" component="h1" gutterBottom>
              Join Party
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Party ID: {partyId}
            </Typography>
          </Box>

          {/* Coming Soon */}
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                🎵 Party Join Coming Soon!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The party join feature is being developed. Soon guests will be able to:
              </Typography>
              <ul style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <li>Join parties by scanning QR codes</li>
                <li>Search for songs on YouTube</li>
                <li>Add songs to the queue</li>
                <li>View the live queue</li>
              </ul>
              <Button
                component={Link}
                to="/"
                variant="contained"
                size="large"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}; 