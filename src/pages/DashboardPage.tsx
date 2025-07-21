import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Tooltip,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  CalendarToday,
  People,
  MusicNote,
  Favorite,
  Delete,
  Search,
  FilterList,
  PlaylistAdd,
  YouTube,
  AccessTime,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { dashboardService, partyService } from '@bellybearsings/firebase-config';
import type { PastParty, FavoriteSongWithMetadata } from '@bellybearsings/firebase-config';

// Component for dashboard data display

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  
  // State management
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playlistFilter, setPlaylistFilter] = useState<string | null>(null);
  const [creatingParty, setCreatingParty] = useState(false);
  
  // Data state
  const [pastParties, setPastParties] = useState<PastParty[]>([]);
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSongWithMetadata[]>([]);
  const [playlists, setPlaylists] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile?.userId) return;

      try {
        setLoading(true);
        const [pastPartiesData, favoriteSongsData, playlistsData] = await Promise.all([
          dashboardService.fetchPastParties(userProfile.userId),
          dashboardService.fetchFavoriteSongs(userProfile.userId),
          dashboardService.fetchPlaylists(),
        ]);

        setPastParties(pastPartiesData);
        setFavoriteSongs(favoriteSongsData);
        setPlaylists(playlistsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  const handleCreateParty = async () => {
    if (!user) return;
    
    setCreatingParty(true);
    try {
      // Create party with default settings
      const party = await partyService.createParty(
        user.uid,
        'Karaoke Party',
        {
          maxParticipants: 50,
          allowDuplicates: true,
          requireApproval: false,
          boostsPerPerson: 3,
          maxSongsPerPerson: 10,
        }
      );
      
      // Navigate to the party page
      navigate('/party');
    } catch (err) {
      console.error('Error creating party:', err);
      setError('Failed to create party. Please try again.');
    } finally {
      setCreatingParty(false);
    }
  };

  const handleRemoveFavorite = async (songId: string) => {
    try {
      await dashboardService.removeFavoriteSong(songId);
      setFavoriteSongs(prev => prev.filter(song => song.songId !== songId));
    } catch (err) {
      console.error('Error removing favorite song:', err);
    }
  };

  const filteredFavoriteSongs = favoriteSongs.filter(song => {
    const matchesSearch = song.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlaylist = !playlistFilter || song.playlists?.includes(playlistFilter);
    return matchesSearch && matchesPlaylist;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        minHeight: '100vh',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Navigation />
      
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Stack spacing={4}>
          {/* Start Party Button */}
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Ready to start the party?
            </Typography>
            <Button
              onClick={handleCreateParty}
              variant="contained"
              size="large"
              startIcon={creatingParty ? <CircularProgress size={20} /> : <Add />}
              disabled={creatingParty}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                color: 'black',
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 30px rgba(0, 0, 0, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {creatingParty ? 'Creating Party...' : 'Start the Party'}
            </Button>
          </Box>

          {/* Past Parties */}
          <Card sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday />
                Past Parties
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : (
                <List>
                  {pastParties.map((party) => (
                    <ListItem key={party.id} sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <CalendarToday />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {party.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(party.date)}
                            </Typography>
                            <Chip
                              icon={<AccessTime />}
                              label={formatDuration(party.duration)}
                              size="small"
                              color="primary"
                            />
                            <Tooltip
                              title={
                                <Box>
                                  <Typography variant="subtitle2" gutterBottom>Attendees:</Typography>
                                  {party.attendees.map((attendee: string, index: number) => (
                                    <Typography key={index} variant="body2">• {attendee}</Typography>
                                  ))}
                                </Box>
                              }
                            >
                              <Chip
                                icon={<People />}
                                label={`${party.attendees.length} attendees`}
                                size="small"
                                color="secondary"
                                sx={{ cursor: 'pointer' }}
                              />
                            </Tooltip>
                            <Tooltip
                              title={
                                <Box>
                                  <Typography variant="subtitle2" gutterBottom>Songs:</Typography>
                                  {party.songs.map((song: any, index: number) => (
                                    <Typography key={index} variant="body2">
                                      • {song.title} by {song.artist} (sung by {song.singer})
                                    </Typography>
                                  ))}
                                </Box>
                              }
                            >
                              <Chip
                                icon={<MusicNote />}
                                label={`${party.totalSongs} songs`}
                                size="small"
                                color="info"
                                sx={{ cursor: 'pointer' }}
                              />
                            </Tooltip>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* My Favorite Songs */}
          <Card sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Favorite />
                  My Favorite Songs
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    startIcon={<Search />}
                    onClick={() => setSearchDialogOpen(true)}
                    variant="outlined"
                  >
                    Add Song
                  </Button>
                </Stack>
              </Box>

              {/* Search and Filter */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search your favorite songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={['All Playlists', ...playlists]}
                    value={playlistFilter || 'All Playlists'}
                    onChange={(_, value) => setPlaylistFilter(value === 'All Playlists' ? null : value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Filter by playlist..."
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <FilterList sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Favorite Songs List */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : (
                <List>
                  {filteredFavoriteSongs.map((song) => (
                    <ListItem key={song.songId} sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                          <MusicNote />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {song.videoTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              by {song.artist}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                              <Chip 
                                size="small" 
                                label={`Sung ${song.timesPlayed || 0} times`}
                                color="primary"
                                variant="outlined"
                              />
                              <Chip 
                                size="small" 
                                label={`${song.othersWhoLove || 0} others love this`}
                                color="secondary"
                                variant="outlined"
                              />
                              {song.friendsWhoLove && song.friendsWhoLove.length > 0 && (
                                <Tooltip
                                  title={
                                    <Box>
                                      <Typography variant="subtitle2" gutterBottom>Friends who love this:</Typography>
                                      {song.friendsWhoLove.map((friend, index) => (
                                        <Typography key={index} variant="body2">• {friend}</Typography>
                                      ))}
                                    </Box>
                                  }
                                >
                                  <Chip 
                                    size="small" 
                                    label={`${song.friendsWhoLove.length} friends love this`}
                                    color="info"
                                    variant="outlined"
                                    sx={{ cursor: 'pointer' }}
                                  />
                                </Tooltip>
                              )}
                            </Stack>
                            {song.playlists && song.playlists.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Playlists: {song.playlists.join(', ')}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Add to playlist">
                            <IconButton size="small" color="primary">
                              <PlaylistAdd />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove from favorites">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRemoveFavorite(song.songId)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Back to Home */}
          <Box textAlign="center">
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Button variant="text" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
                ← Back to Home
              </Button>
            </Link>
          </Box>
        </Stack>
      </Container>

      {/* Add Song Dialog */}
      <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Song to Favorites</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search YouTube for karaoke songs"
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: <YouTube sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Search for songs and add them to your favorites list. You can also add them to playlists.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Add to Favorites</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 