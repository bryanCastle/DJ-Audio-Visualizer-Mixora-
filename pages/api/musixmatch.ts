import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { method, params } = req.query;

    if (!method || typeof method !== 'string') {
        return res.status(400).json({ error: 'Method parameter is required' });
    }

    try {
        const url = "https://apic-desktop.musixmatch.com/ws/1.1/";
        const searchParams = new URLSearchParams();
        
        // Add required parameters
        searchParams.append("app_id", "web-desktop-app-v1.0");
        searchParams.append("t", Math.random().toString(36).replace(/[^a-z]+/g, "").slice(2, 10));

        // Add any additional parameters
        if (params) {
            const parsedParams = JSON.parse(params as string);
            Object.entries(parsedParams).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, String(value));
                }
            });
        }

        const response = await axios.get(url + method + "?" + searchParams.toString(), {
            headers: {
                "Cookie": "x-mxm-user-id=",
                "Authority": "apic-desktop.musixmatch.com",
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Musixmatch API error:', error);
        res.status(500).json({ error: 'Failed to fetch from Musixmatch API' });
    }
} 