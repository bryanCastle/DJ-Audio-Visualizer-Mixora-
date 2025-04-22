import { useState, useEffect, useRef } from 'react';
import { LyricData, LyricVisualizerSettings } from '../types';
import { LyricManager } from '../utils/lyricManager';
import { SpotifyService } from '../services/spotifyService';
import { GeniusService } from '../services/geniusService';

interface UseLyricVisualizerProps {
  spotifyClientId: string;
  spotifyRedirectUri: string;
  geniusAccessToken: string;
  settings: LyricVisualizerSettings;
}

export const useLyricVisualizer = ({
  spotifyClientId,
  spotifyRedirectUri,
  geniusAccessToken,
  settings
}: UseLyricVisualizerProps) => {
  const [currentTrack, setCurrentTrack] = useState<{ title: string; artist: string } | null>(null);
  const [currentLyrics, setCurrentLyrics] = useState<LyricData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lyricManagerRef = useRef<LyricManager>(new LyricManager());
  const spotifyServiceRef = useRef<SpotifyService>(new SpotifyService(spotifyClientId, spotifyRedirectUri));
  const geniusServiceRef = useRef<GeniusService>(new GeniusService(geniusAccessToken));

  // Initialize Spotify service
  useEffect(() => {
    const initialize = async () => {
      try {
        await spotifyServiceRef.current.initialize();
      } catch (err) {
        setError('Failed to initialize Spotify service');
        console.error(err);
      }
    };

    initialize();
  }, [spotifyClientId, spotifyRedirectUri]);

  // Fetch current track
  useEffect(() => {
    const fetchCurrentTrack = async () => {
      try {
        const track = await spotifyServiceRef.current.getCurrentTrack();
        if (track && (!currentTrack || 
            track.title !== currentTrack.title || 
            track.artist !== currentTrack.artist)) {
          setCurrentTrack({ title: track.title, artist: track.artist });
        }
      } catch (err) {
        setError('Failed to fetch current track');
        console.error(err);
      }
    };

    const interval = setInterval(fetchCurrentTrack, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [currentTrack]);

  // Fetch lyrics when track changes
  useEffect(() => {
    const fetchLyrics = async () => {
      if (!currentTrack) return;

      setIsLoading(true);
      setError(null);

      try {
        const lyrics = await geniusServiceRef.current.searchLyrics(
          currentTrack.title,
          currentTrack.artist
        );

        if (lyrics.length === 0) {
          setError('No lyrics found for this track');
        } else {
          lyricManagerRef.current.setLyrics(lyrics);
          setCurrentLyrics(lyrics);
        }
      } catch (err) {
        setError('Failed to fetch lyrics');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyrics();
  }, [currentTrack]);

  // Get current lyric based on playback position
  const getCurrentLyric = async () => {
    try {
      const state = await spotifyServiceRef.current.getPlaybackState();
      if (!state) return null;

      return lyricManagerRef.current.update(state.position);
    } catch (err) {
      console.error('Failed to get current lyric:', err);
      return null;
    }
  };

  // Get progress of current lyric
  const getLyricProgress = async () => {
    try {
      const state = await spotifyServiceRef.current.getPlaybackState();
      if (!state) return 0;

      return lyricManagerRef.current.getProgress(state.position);
    } catch (err) {
      console.error('Failed to get lyric progress:', err);
      return 0;
    }
  };

  return {
    currentTrack,
    currentLyrics,
    isLoading,
    error,
    getCurrentLyric,
    getLyricProgress
  };
}; 