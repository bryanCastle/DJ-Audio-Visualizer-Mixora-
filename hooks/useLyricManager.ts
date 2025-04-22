import { useState, useEffect, useRef } from 'react';
import { SpotifyService } from '../lyric-visualizer/services/spotifyService';
import { config } from '../lyric-visualizer/config';
import * as Musixmatch from '../lyric-visualizer/providers/musixmatch';

export const useLyricManager = (activeEffects: string[] = []) => {
    const [currentTrack, setCurrentTrack] = useState<{ artist: string; title: string; length?: number } | null>(null);
    const [lyrics, setLyrics] = useState<any>(null);
    const [lyricTimePairs, setLyricTimePairs] = useState<[number, string][]>([]);
    const [currentLineText, setCurrentLineText] = useState<string>("");
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const spotifyServiceRef = useRef<SpotifyService>(
        new SpotifyService(config.spotify.clientId, config.spotify.redirectUri)
    );

    // Transform lyrics into time-lyric pairs
    useEffect(() => {
        if (lyrics?.lines) {
            const pairs: [number, string][] = lyrics.lines
                .filter((line: any) => line.time !== undefined)
                .map((line: any) => [
                    Math.round(line.time * 1000), // Convert to milliseconds
                    line.text
                ]);
            setLyricTimePairs(pairs);
        }
    }, [lyrics]);

    // Update current line based on elapsed time
    useEffect(() => {
        if (lyricTimePairs.length > 0) {
            // Find the first line where elapsed time is less than the line's time
            const newIndex = lyricTimePairs.findIndex(([time]) => elapsedTime < time);
            
            // If no line found (elapsed time is past all lines), use the last line
            const index = newIndex === -1 ? lyricTimePairs.length - 1 : newIndex - 1;
            
            if (index >= 0) {
                const newLineText = lyricTimePairs[index][1];
                if (newLineText !== currentLineText) {
                    setCurrentLineText(newLineText);
                }
            }
        }
    }, [elapsedTime, lyricTimePairs, currentLineText]);

    // Timer effect
    useEffect(() => {
        if (currentTrack) {
            const initializeTimer = async () => {
                try {
                    const track = await spotifyServiceRef.current.getCurrentTrack();
                    if (track && track.currentPosition) {
                        // Set elapsed time to current Spotify position
                        setElapsedTime(track.currentPosition);
                        // Set start time to maintain the correct offset
                        startTimeRef.current = Date.now() - track.currentPosition;
                    } else {
                        // Fallback to normal timer if no Spotify position
                        setElapsedTime(0);
                        startTimeRef.current = Date.now();
                    }
                } catch (error) {
                    console.error('Error getting Spotify position:', error);
                    // Fallback to normal timer on error
                    setElapsedTime(0);
                    startTimeRef.current = Date.now();
                }

                // Clear any existing timer
                if (timerRef.current) {
                    window.clearInterval(timerRef.current);
                }

                // Start new timer
                timerRef.current = window.setInterval(() => {
                    if (startTimeRef.current) {
                        const elapsed = Date.now() - startTimeRef.current;
                        setElapsedTime(elapsed);
                    }
                }, 10); // Update every 10ms for smooth display
            };

            initializeTimer();

            // Cleanup on unmount or track change
            return () => {
                if (timerRef.current) {
                    window.clearInterval(timerRef.current);
                }
            };
        }
    }, [currentTrack]);

    // Sync with Spotify position when effect is toggled on
    useEffect(() => {
        const syncWithSpotify = async () => {
            try {
                const track = await spotifyServiceRef.current.getCurrentTrack();
                if (track && track.currentPosition) {
                    // Set elapsed time to current Spotify position
                    setElapsedTime(track.currentPosition);
                    // Update start time to maintain the correct offset
                    startTimeRef.current = Date.now() - track.currentPosition;
                }
            } catch (error) {
                console.error('Error syncing with Spotify position:', error);
            }
        };

        // Only sync when the effect is toggled on
        if (activeEffects.includes('currentLyric')) {
            syncWithSpotify();
        }
    }, [activeEffects]);

    // Initialize Spotify
    useEffect(() => {
        const initSpotify = async () => {
            try {
                await spotifyServiceRef.current.initialize();
            } catch (error) {
                console.error('Error initializing Spotify:', error);
            }
        };

        initSpotify();
    }, []);

    // Update current track
    useEffect(() => {
        const updateTrack = async () => {
            try {
                const track = await spotifyServiceRef.current.getCurrentTrack();
                if (track && (!currentTrack || 
                    track.title !== currentTrack.title || 
                    track.artist !== currentTrack.artist)) {
                    setCurrentTrack({ 
                        title: track.title, 
                        artist: track.artist,
                        length: track.duration
                    });
                }
            } catch (error) {
                console.error('Error fetching current track:', error);
            }
        };

        const interval = setInterval(updateTrack, 1000);
        return () => clearInterval(interval);
    }, [currentTrack]);

    // Fetch lyrics when track changes
    useEffect(() => {
        const fetchLyrics = async () => {
            if (!currentTrack) return;

            try {
                const result = await Musixmatch.query({
                    artist: currentTrack.artist,
                    title: currentTrack.title,
                    length: currentTrack.length
                });

                if (result) {
                    setLyrics(result);
                }
            } catch (err) {
                console.error('Error fetching lyrics:', err);
            }
        };

        fetchLyrics();
    }, [currentTrack]);

    return {
        currentLineText,
        lyricTimePairs,
        elapsedTime
    };
}; 