import React, { useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  loading?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search for karaoke songs...',
  onSearch,
  onClear,
  loading = false,
  defaultValue = '',
  autoFocus = false,
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    setValue('');
    onClear?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: 2,
        boxShadow: 2,
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 4,
        },
        '&:focus-within': {
          boxShadow: 6,
        },
      }}
    >
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        {loading ? <CircularProgress size={20} /> : <Search />}
      </IconButton>
      
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        autoFocus={autoFocus}
        inputProps={{ 'aria-label': 'search karaoke songs' }}
      />
      
      {value && (
        <IconButton
          type="button"
          sx={{ p: '10px' }}
          aria-label="clear"
          onClick={handleClear}
        >
          <Clear />
        </IconButton>
      )}
    </Paper>
  );
}; 