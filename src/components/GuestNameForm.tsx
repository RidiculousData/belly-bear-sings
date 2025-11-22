import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface GuestNameFormProps {
    onSubmit: (displayName: string) => void;
    loading?: boolean;
    error?: string;
}

export const GuestNameForm: React.FC<GuestNameFormProps> = ({
    onSubmit,
    loading = false,
    error,
}) => {
    const [displayName, setDisplayName] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!displayName.trim()) {
            setValidationError('Please enter your name');
            return;
        }

        if (displayName.trim().length < 2) {
            setValidationError('Name must be at least 2 characters');
            return;
        }

        if (displayName.trim().length > 50) {
            setValidationError('Name must be less than 50 characters');
            return;
        }

        setValidationError('');
        onSubmit(displayName.trim());
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                maxWidth: 400,
                mx: 'auto',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
            }}
        >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <PersonIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Join the Party
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Enter your name to get started
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Your Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    error={!!validationError}
                    helperText={validationError}
                    disabled={loading}
                    autoFocus
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'rgba(0, 0, 0, 0.6)',
                        },
                    }}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                        backgroundColor: 'white',
                        color: '#667eea',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                    }}
                >
                    {loading ? 'Joining...' : 'Join Party'}
                </Button>
            </form>
        </Paper>
    );
};
