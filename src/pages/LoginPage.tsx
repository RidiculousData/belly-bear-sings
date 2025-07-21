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
  Chip,
  useTheme,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Login as LoginIcon, Google, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Sample users for development
const sampleUsers = [
  {
    id: 'host-alice',
    email: 'alice@example.com',
    password: 'password123',
    displayName: 'Alice Johnson',
    role: 'Host',
    description: 'Experienced karaoke host with 50+ parties',
  },
  {
    id: 'host-bob',
    email: 'bob@example.com',
    password: 'password123',
    displayName: 'Bob Smith',
    role: 'Host',
    description: 'New host, tech-savvy',
  },
  {
    id: 'participant-charlie',
    email: 'charlie@example.com',
    password: 'password123',
    displayName: 'Charlie Brown',
    role: 'Participant',
    description: 'Regular party-goer, loves classic rock',
  },
  {
    id: 'participant-diana',
    email: 'diana@example.com',
    password: 'password123',
    displayName: 'Diana Prince',
    role: 'Participant',
    description: 'Pop music enthusiast, frequent booster',
  },
  {
    id: 'participant-evan',
    email: 'evan@example.com',
    password: 'password123',
    displayName: 'Evan Miller',
    role: 'Participant',
    description: 'Shy singer, prefers duets',
  },
];

export const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signIn, signInWithProvider, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSampleUsers, setShowSampleUsers] = useState(
    import.meta.env.DEV
  );

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await signIn(email, password);
      // Redirect will be handled by useEffect above
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleSampleUserLogin = (user: typeof sampleUsers[0]) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('');
    setSuccessMessage('');

    try {
      await signInWithProvider(provider);
      // Redirect will be handled by useEffect above
    } catch (error: any) {
      setError(error.message || 'Social login failed. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setError('');
    setSuccessMessage('');

    try {
      // Import Firebase auth for password reset
      const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email.');
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
              Welcome Back!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Sign in to your account to host amazing karaoke parties
            </Typography>
          </Box>

          {/* Main Login Card */}
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

              {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {successMessage}
                </Alert>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={<LoginIcon />}
                    sx={{ 
                      py: 1.5,
                      bgcolor: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  {/* Forgot Password Link */}
                  <Box textAlign="center">
                    <Button
                      variant="text"
                      onClick={handleForgotPassword}
                      disabled={loading}
                      sx={{ 
                        color: theme.palette.primary.main,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>
                </Stack>
              </form>

              <Divider sx={{ my: 3 }}>OR</Divider>

              {/* Google Login */}
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
                Continue with Google
              </Button>
            </CardContent>
          </Card>

          {/* Sample Users (Development Only) */}
          {showSampleUsers && (
            <Card sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)', 
              backdropFilter: 'blur(10px)',
              border: '2px dashed rgba(255, 255, 255, 0.8)',
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🧪 Development Mode - Sample Users
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click any user below to auto-fill the login form, then click "Sign In":
                </Typography>
                <Stack spacing={2}>
                  {sampleUsers.map((user) => (
                    <Box
                      key={user.id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => handleSampleUserLogin(user)}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user.displayName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                          <Chip
                            label={user.role}
                            color={user.role === 'Host' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {user.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Sign Up Link */}
          <Box textAlign="center">
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'white', textDecoration: 'underline', fontWeight: 'bold' }}>
                Sign up for free
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}; 