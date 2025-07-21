import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Divider,
  useTheme,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { PersonAdd, Google, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const SignupPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signUp, signInWithProvider, loading, user } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.displayName);
      // Redirect will be handled by useEffect above
    } catch (error: any) {
      setError(error.message || 'Signup failed. Please try again.');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('');

    try {
      await signInWithProvider(provider);
      // Redirect will be handled by useEffect above
    } catch (error: any) {
      setError(error.message || 'Social signup failed. Please try again.');
    }
  };

  // Show loading if user is already authenticated
  if (user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3}>
          {/* Back Button */}
          <Box>
            <IconButton
              component={Link}
              to="/"
              sx={{ 
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ArrowBack />
            </IconButton>
          </Box>

          {/* Header */}
          <Box textAlign="center">
            <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white' }}>
              Create Your Account
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Join thousands of hosts creating amazing karaoke experiences
            </Typography>
          </Box>

          {/* Main Signup Card */}
          <Card sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}>
            <CardContent sx={{ p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSignup}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.displayName}
                    onChange={handleInputChange('displayName')}
                    required
                    autoComplete="name"
                  />

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    required
                    autoComplete="email"
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    required
                    autoComplete="new-password"
                    helperText="Must be at least 6 characters"
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    required
                    autoComplete="new-password"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={<PersonAdd />}
                    sx={{ 
                      py: 1.5,
                      bgcolor: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 3 }}>OR</Divider>

              {/* Google Signup */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Google />}
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                data-custom-bg="true"
                sx={{ 
                  mb: 2, 
                  py: 1.5,
                  bgcolor: '#000000',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#333333',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#666666',
                    color: 'white',
                  },
                }}
              >
                Sign Up with Google
              </Button>

              {/* Terms */}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </CardContent>
          </Card>

          {/* Login Link */}
          <Box textAlign="center">
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'white', textDecoration: 'underline', fontWeight: 'bold' }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}; 