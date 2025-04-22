import { useEffect, useState } from 'react';
import type { Lyrics } from '../types';

interface LyricsDisplayProps {
    artist: string;
    title: string;
}

const cleanLyrics = (lyrics: string): string => {
    // Remove any text before [Intro]
    const introIndex = lyrics.indexOf('[Intro]');
    if (introIndex !== -1) {
        lyrics = lyrics.substring(introIndex);
    }

    // Remove common unwanted patterns
    const patternsToRemove = [
        /^.*?\[.*?\]/g, // Remove any text before the first section marker
        /\[.*?\]/g,     // Remove all section markers
        /\(.*?\)/g,     // Remove all parentheses content
        /^[0-9]+\.\s/gm, // Remove numbered lines
        /^\s*$/gm,      // Remove empty lines
    ];

    patternsToRemove.forEach(pattern => {
        lyrics = lyrics.replace(pattern, '');
    });

    // Clean up multiple newlines
    lyrics = lyrics.replace(/\n\s*\n/g, '\n').trim();

    return lyrics;
};

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ artist, title }) => {
    const [lyrics, setLyrics] = useState<Lyrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLyrics = async () => {
            if (!artist || !title) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch lyrics');
                }
                
                const result = await response.json();
                if (result && result.lines) {
                    // Clean the lyrics
                    const cleanedLines = result.lines.map((line: { text: string }) => ({
                        text: cleanLyrics(line.text)
                    })).filter((line: { text: string }) => line.text.trim() !== '');
                    
                    setLyrics({
                        ...result,
                        lines: cleanedLines
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch lyrics');
                console.error('Error fetching lyrics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLyrics();
    }, [artist, title]);

    if (loading) {
        return (
            <div className="fixed bottom-4 right-4 bg-black/80 p-4 rounded-lg text-white max-w-md max-h-96 overflow-y-auto">
                <p>Loading lyrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed bottom-4 right-4 bg-black/80 p-4 rounded-lg text-white max-w-md max-h-96 overflow-y-auto">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!lyrics) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 p-4 rounded-lg text-white max-w-md max-h-96 overflow-y-auto">
            <div className="mb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-300">{artist}</p>
            </div>
            <div className="space-y-2">
                {lyrics.lines.map((line, index) => (
                    <p key={index} className="text-sm">
                        {line.text}
                    </p>
                ))}
            </div>
        </div>
    );
}; 