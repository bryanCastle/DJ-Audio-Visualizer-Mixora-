import { useEffect, useState, useRef } from 'react';
import { LyricsDisplay } from '../lyric-visualizer/components/LyricsDisplay';
import { SpotifyService } from '../lyric-visualizer/services/spotifyService';
import { config } from '../lyric-visualizer/config';

export default function TestLyrics() {
    const [currentTrack, setCurrentTrack] = useState<{ artist: string; title: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const spotifyServiceRef = useRef<SpotifyService>(
        new SpotifyService(config.spotify.clientId, config.spotify.redirectUri)
    );

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
                    setCurrentTrack({ title: track.title, artist: track.artist });
                }
            } catch (error) {
                console.error('Error fetching current track:', error);
                setError('Failed to fetch current track');
            }
        };

        const interval = setInterval(updateTrack, 1000);
        return () => clearInterval(interval);
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
                <h1 className="text-2xl font-bold text-white mb-8">Now Playing</h1>
                
                {currentTrack ? (
                    <>
                        <div className="mb-4">
                            <h2 className="text-xl text-white">{currentTrack.title}</h2>
                            <p className="text-gray-300">{currentTrack.artist}</p>
                        </div>
                        <LyricsDisplay artist={currentTrack.artist} title={currentTrack.title} />
                    </>
                ) : (
                    <p className="text-gray-300">No track currently playing</p>
                )}
            </div>
        </div>
    );
} 