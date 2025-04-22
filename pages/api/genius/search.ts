import { NextApiRequest, NextApiResponse } from 'next';
import { config } from '../../../lyric-visualizer/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const response = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(q as string)}`, {
      headers: {
        'Authorization': `Bearer ${config.genius.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Genius API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Genius API:', error);
    return res.status(500).json({ error: 'Failed to fetch from Genius API' });
  }
} 