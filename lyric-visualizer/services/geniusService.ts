import { config } from '../config';

export class GeniusService {
  private accessToken: string;

  constructor() {
    this.accessToken = config.genius.accessToken;
  }

  async searchLyrics(query: string): Promise<any> {
    try {
      const response = await fetch(`/api/genius/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Genius API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      throw error;
    }
  }
} 