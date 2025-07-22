import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { PhotoCamera, Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { db } from '@bellybearsings/firebase-config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface UserProfile {
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    firstName: '',
    lastName: '',
    photoURL: '',
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>({
    displayName: '',
    firstName: '',
    lastName: '',
    photoURL: '',
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profileData: UserProfile = {
          displayName: data.displayName || user.displayName || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          photoURL: data.photoURL || user.photoURL || '',
        };
        setProfile(profileData);
        setEditedProfile(profileData);
      } else {
        // Create initial profile from Firebase Auth data
        const initialProfile: UserProfile = {
          displayName: user.displayName || '',
          firstName: '',
          lastName: '',
          photoURL: user.photoURL || '',
        };
        setProfile(initialProfile);
        setEditedProfile(initialProfile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        email: user.email,
        displayName: editedProfile.displayName,
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        photoURL: editedProfile.photoURL,
        updatedAt: new Date(),
      }, { merge: true });

      setProfile(editedProfile);
      setIsEditing(false);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement photo upload functionality
    // For now, just allow URL input
    console.log('Photo upload not yet implemented');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navigation />
      <Box sx={{ pt: 10, pb: 4, bgcolor: 'background.default', minHeight: '100vh', background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7E6 100%)' }}>
        <Container maxWidth="md">
          <Stack spacing={4}>
            {/* Header */}
            <Box>
              <Typography variant="h3" component="h1" gutterBottom>
                Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your account information
              </Typography>
            </Box>

            {/* Alerts */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" onClose={() => setSuccess(false)}>
                Profile updated successfully!
              </Alert>
            )}

            {/* Profile Card */}
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  {/* Avatar Section */}
                  <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        src={isEditing ? editedProfile.photoURL : profile.photoURL}
                        sx={{ 
                          width: 150, 
                          height: 150, 
                          mb: 2,
                          fontSize: '3rem',
                        }}
                      >
                        {(isEditing ? editedProfile.displayName : profile.displayName)?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      {isEditing && (
                        <IconButton
                          color="primary"
                          aria-label="upload picture"
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 10,
                            right: -10,
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            '&:hover': {
                              bgcolor: 'background.paper',
                            },
                          }}
                        >
                          <input hidden accept="image/*" type="file" onChange={handlePhotoChange} />
                          <PhotoCamera />
                        </IconButton>
                      )}
                    </Box>
                    {isEditing && (
                      <TextField
                        fullWidth
                        label="Photo URL"
                        value={editedProfile.photoURL}
                        onChange={(e) => setEditedProfile({ ...editedProfile, photoURL: e.target.value })}
                        size="small"
                        helperText="Enter a URL for your profile photo"
                      />
                    )}
                  </Grid>

                  {/* Profile Fields */}
                  <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Display Name"
                        value={isEditing ? editedProfile.displayName : profile.displayName}
                        onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                        disabled={!isEditing}
                        required
                      />
                      
                      <TextField
                        fullWidth
                        label="First Name"
                        value={isEditing ? editedProfile.firstName : profile.firstName}
                        onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                        disabled={!isEditing}
                      />
                      
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={isEditing ? editedProfile.lastName : profile.lastName}
                        onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                        disabled={!isEditing}
                      />
                      
                      <TextField
                        fullWidth
                        label="Email"
                        value={user?.email || ''}
                        disabled
                        helperText="Email cannot be changed"
                      />
                    </Stack>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  {isEditing ? (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving || !editedProfile.displayName}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleEdit}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Actions
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
}; 