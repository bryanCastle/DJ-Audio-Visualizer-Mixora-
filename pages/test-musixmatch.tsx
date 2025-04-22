import { useEffect, useState, useRef } from 'react';
import { SpotifyService } from '../lyric-visualizer/services/spotifyService';
import { config } from '../lyric-visualizer/config';
import * as Musixmatch from '../lyric-visualizer/providers/musixmatch';

export default function TestMusixmatch() {
    const [currentTrack, setCurrentTrack] = useState<{ artist: string; title: string; length?: number } | null>(null);
    const [lyrics, setLyrics] = useState<any>(null);
    const [lyricTimePairs, setLyricTimePairs] = useState<[number, string][]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
    const [currentLineText, setCurrentLineText] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
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
            console.log('Lyric-Time Pairs:', pairs);
        }
    }, [lyrics]);

    // Update current line based on elapsed time
    useEffect(() => {
        if (lyricTimePairs.length > 0) {
            // Find the first line where elapsed time is less than the line's time
            const newIndex = lyricTimePairs.findIndex(([time]) => elapsedTime < time);
            
            // If no line found (elapsed time is past all lines), use the last line
            const index = newIndex === -1 ? lyricTimePairs.length - 1 : newIndex - 1;
            
            // Only update if the index has changed
            if (index !== currentLineIndex) {
                setCurrentLineIndex(index);
            }
        }
    }, [elapsedTime, lyricTimePairs]);

    // Timer effect
    useEffect(() => {
        if (currentTrack) {
            // Reset timer when new track starts
            setElapsedTime(0);
            startTimeRef.current = Date.now();
            
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

            // Cleanup on unmount or track change
            return () => {
                if (timerRef.current) {
                    window.clearInterval(timerRef.current);
                }
            };
        }
    }, [currentTrack]);

    // Format time as 00.00ms
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const milliseconds = ms % 1000;
        return `${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}ms`;
    };

    useEffect(() => {
        const initSpotify = async () => {
            try {
                await spotifyServiceRef.current.initialize();
            } catch (error) {
                console.error('Error initializing Spotify:', error);
                setError('Failed to initialize Spotify');
            }
        };

        initSpotify();
    }, []);

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
                setError('Failed to fetch current track');
            }
        };

        const interval = setInterval(updateTrack, 1000);
        return () => clearInterval(interval);
    }, [currentTrack]);

    useEffect(() => {
        const fetchLyrics = async () => {
            if (!currentTrack) return;

            setLoading(true);
            setError(null);

            try {
                const result = await Musixmatch.query({
                    artist: currentTrack.artist,
                    title: currentTrack.title,
                    length: currentTrack.length
                });

                if (result) {
                    setLyrics(result);
                } else {
                    setError('No lyrics found');
                }
            } catch (err) {
                setError('Failed to fetch lyrics');
                console.error('Error fetching lyrics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLyrics();
    }, [currentTrack]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 p-8">
                <div className="max-w-md mx-auto text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-white mb-8">Now Playing (Musixmatch)</h1>
                
                {currentTrack ? (
                    <>
                        <div className="mb-4">
                            <h2 className="text-xl text-white">{currentTrack.title}</h2>
                            <p className="text-gray-300">{currentTrack.artist}</p>
                            <p className="text-green-400 font-mono text-lg mt-2">
                                {formatTime(elapsedTime)}
                            </p>
                            {currentLineIndex >= 0 && (
                                <div className="mt-4 p-4 bg-blue-900/50 rounded-lg">
                                    <p className="text-white text-lg">
                                        Current Line: {lyricTimePairs[currentLineIndex]?.[1]}
                                    </p>
                                    <p className="text-gray-300 text-sm">
                                        Time: {formatTime(lyricTimePairs[currentLineIndex]?.[0])}
                                    </p>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <p className="text-gray-300">Loading lyrics...</p>
                        ) : lyrics ? (
                            <>
                                <div className="bg-black/80 p-4 rounded-lg text-white max-h-96 overflow-y-auto">
                                    {lyrics.lines.map((line: any, index: number) => (
                                        <div 
                                            key={index} 
                                            className={`mb-2 ${index === currentLineIndex ? 'bg-blue-900/50 p-2 rounded' : ''}`}
                                        >
                                            <p className="text-sm">
                                                {line.text}
                                                {line.translation && (
                                                    <span className="text-gray-400 ml-2">
                                                        ({line.translation})
                                                    </span>
                                                )}
                                            </p>
                                            {line.time && (
                                                <p className="text-xs text-gray-500">
                                                    Time: {line.time}ms
                                                    {line.duration && ` (Duration: ${line.duration}ms)`}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-white mb-2">Time-Lyric Pairs:</h3>
                                    <pre className="bg-black/80 p-4 rounded-lg text-white text-xs overflow-x-auto">
                                        {JSON.stringify(lyricTimePairs, null, 2)}
                                    </pre>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-300">No lyrics available</p>
                        )}
                    </>
                ) : (
                    <p className="text-gray-300">No track currently playing</p>
                )}
            </div>
        </div>
    );
} 