import { useState, useRef, useEffect } from 'react';
import { Song, Participant } from '../types/party';

export const usePartyPlayer = (queue: Song[], _participants: Participant[]) => {
  const playerRef = useRef<any>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCopiedSnackbar, setShowCopiedSnackbar] = useState(false);
  
  // Generate unique party code and ID
  const [partyCode] = useState(() => {
    // Check if we have an existing party in localStorage
    const storedParty = localStorage.getItem('activeParty');
    if (storedParty) {
      const party = JSON.parse(storedParty);
      return party.code;
    }
    
    // Generate new party code - 8 characters in 2 segments of 4
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  });

  // Generate party ID (use party code as ID for now)
  const [partyId] = useState(() => {
    // Check if we have an existing party in localStorage
    const storedParty = localStorage.getItem('activeParty');
    if (storedParty) {
      const party = JSON.parse(storedParty);
      return party.id;
    }
    
    // Generate new party ID
    const id = `party-${partyCode.replace('-', '').toLowerCase()}`;
    
    // Store the party in localStorage
    const partyData = {
      id,
      code: partyCode,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('activeParty', JSON.stringify(partyData));
    
    // Also store it by ID for participant lookup
    localStorage.setItem(`party-${id}`, JSON.stringify(partyData));
    
    return id;
  });

  // Reset current song index when queue becomes empty
  useEffect(() => {
    if (queue.length === 0) {
      setCurrentSongIndex(0);
      setIsPlaying(false);
    } else if (currentSongIndex >= queue.length) {
      // If current index is beyond queue length, reset to 0
      setCurrentSongIndex(0);
    }
  }, [queue.length, currentSongIndex]);

  const currentSong = queue.length > 0 ? queue[currentSongIndex] : null;

  // Update video when song index changes
  useEffect(() => {
    if (playerRef.current && currentSong) {
      playerRef.current.loadVideoById(currentSong.videoId);
    }
  }, [currentSongIndex, currentSong]);

  const handlePlayerReady = (event: any) => {
    playerRef.current = event.target;
  };

  const handlePlayerStateChange = (event: any) => {
    setIsPlaying(event.data === 1); // 1 = playing
  };

  const handlePlayPause = () => {
    if (playerRef.current && currentSong) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleSkipNext = () => {
    if (currentSongIndex < queue.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    }
  };

  const handleSkipPrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
    }
  };

  const handleSeek = (seconds: number) => {
    if (playerRef.current && currentSong) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + seconds);
    }
  };

  const handleVideoEnd = () => {
    handleSkipNext();
  };

  const handleCopyPartyCode = () => {
    navigator.clipboard.writeText(partyCode);
    setShowCopiedSnackbar(true);
  };

  const canSkipNext = currentSongIndex < queue.length - 1;
  const canSkipPrevious = currentSongIndex > 0;

  return {
    currentSong,
    currentSongIndex,
    isPlaying,
    partyCode,
    partyId,
    showCopiedSnackbar,
    canSkipNext,
    canSkipPrevious,
    handlePlayerReady,
    handlePlayerStateChange,
    handlePlayPause,
    handleSkipNext,
    handleSkipPrevious,
    handleSeek,
    handleVideoEnd,
    handleCopyPartyCode,
    setShowCopiedSnackbar,
  };
}; 