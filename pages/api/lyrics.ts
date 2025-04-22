import type { NextApiRequest, NextApiResponse } from 'next';
import { queryLyricsAutomatically } from '../../lyric-visualizer/utils/lyricsManager';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { artist, title } = req.query;

    if (!artist || !title) {
        return res.status(400).json({ error: 'Artist and title are required' });
    }

    try {
        const lyrics = await queryLyricsAutomatically({
            artist: artist as string,
            title: title as string
        });

        if (!lyrics || lyrics.unavailable) {
            return res.status(404).json({ error: 'Lyrics not found' });
        }

        return res.status(200).json(lyrics);
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        return res.status(500).json({ error: 'Failed to fetch lyrics' });
    }
} 