import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { config } from '../../lyric-visualizer/config';
import { SpotifyService } from '../../lyric-visualizer/services/spotifyService';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Initialize SpotifyService with the current URL
        const spotifyService = new SpotifyService(
          config.spotify.clientId,
          config.spotify.redirectUri
        );
        
        // This will handle the code exchange automatically
        await spotifyService.initialize();
        
        // Redirect back to the main page
        router.replace('/');
      } catch (error) {
        console.error('Error handling callback:', error);
        router.replace('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Completing authentication...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
} 