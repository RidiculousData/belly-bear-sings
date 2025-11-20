import { useState, useRef, useEffect } from 'react';
import { Song } from '../types/party';
import type { YouTubePlayer } from 'youtube-player/dist/types';

interface UsePlayerControlsReturn {
    currentSongIndex: number;
    isPlaying: boolean;
    handlePlayerReady: (event: { target: YouTubePlayer }) => void;
    handlePlayerStateChange: (event: { data: number }) => void;
    handlePlayPause: () => void;
    handleSkipNext: () => void;
    handleSkipPrevious: () => void;
    handleSeek: (seconds: number) => void;
    handleVideoEnd: () => void;
    canSkipNext: boolean;
    canSkipPrevious: boolean;
}

export const usePlayerControls = (queue: Song[]): UsePlayerControlsReturn => {
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef<YouTubePlayer | null>(null);

    const currentSong = queue.length > 0 ? queue[currentSongIndex] : null;

    // Player control functions
    const handlePlayerReady = (event: { target: YouTubePlayer }) => {
        playerRef.current = event.target;
    };

    const handlePlayerStateChange = (event: { data: number }) => {
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
            // getCurrentTime returns a Promise in some versions, but usually number in the iframe API
            // We'll cast to any to be safe or check the type definition
            const currentTime = playerRef.current.getCurrentTime();
            if (typeof currentTime === 'number') {
                playerRef.current.seekTo(currentTime + seconds, true);
            } else {
                // Handle promise case if needed, though usually synchronous in this context
                Promise.resolve(currentTime).then((time) => {
                    playerRef.current?.seekTo(time + seconds, true);
                });
            }
        }
    };

    const handleVideoEnd = () => {
        handleSkipNext();
    };

    // Update video when song index changes
    useEffect(() => {
        if (playerRef.current && currentSong) {
            playerRef.current.loadVideoById(currentSong.videoId);
        }
    }, [currentSongIndex, currentSong]);

    // Reset current song index when queue becomes empty
    useEffect(() => {
        if (queue.length === 0) {
            setCurrentSongIndex(0);
            setIsPlaying(false);
        } else if (currentSongIndex >= queue.length) {
            setCurrentSongIndex(0);
        }
    }, [queue.length, currentSongIndex]);

    const canSkipNext = currentSongIndex < queue.length - 1;
    const canSkipPrevious = currentSongIndex > 0;

    return {
        currentSongIndex,
        isPlaying,
        handlePlayerReady,
        handlePlayerStateChange,
        handlePlayPause,
        handleSkipNext,
        handleSkipPrevious,
        handleSeek,
        handleVideoEnd,
        canSkipNext,
        canSkipPrevious,
    };
};
