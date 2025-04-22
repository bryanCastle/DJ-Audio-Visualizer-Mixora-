import { TrackData } from '../types';

export class SpotifyService {
  private accessToken: string | null = null;
  private clientId: string;
  private redirectUri: string;

  constructor(clientId: string, redirectUri: string) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const base64Digest = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))));
    return base64Digest
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  async initialize(): Promise<void> {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
      this.accessToken = storedToken;
      return;
    }

    // Handle OAuth flow
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    
    if (error) {
      throw new Error(`Spotify authentication error: ${error}`);
    }
    
    if (code) {
      try {
        // Exchange code for token
        const codeVerifier = localStorage.getItem('code_verifier');
        if (!codeVerifier) {
          throw new Error('No code verifier found');
        }

        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          code_verifier: codeVerifier
        });

        console.log('Exchanging code for token...');
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Token exchange failed:', errorData);
          throw new Error(`Failed to get access token: ${errorData.error_description || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('Token exchange successful');
        this.accessToken = data.access_token;
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.removeItem('code_verifier');
      } catch (error) {
        console.error('Error during token exchange:', error);
        throw error;
      }
    } else {
      // Redirect to Spotify login
      const codeVerifier = this.generateRandomString(128);
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      localStorage.setItem('code_verifier', codeVerifier);

      const scope = 'user-read-playback-state user-read-currently-playing';
      const encodedRedirectUri = encodeURIComponent(this.redirectUri);
      const authUrl = `https://accounts.spotify.com/authorize?client_id=${this.clientId}&redirect_uri=${encodedRedirectUri}&scope=${scope}&response_type=code&code_challenge_method=S256&code_challenge=${codeChallenge}&show_dialog=true`;
      window.location.href = authUrl;
    }
  }

  async getCurrentTrack(): Promise<TrackData | null> {
    if (!this.accessToken) {
      await this.initialize();
      if (!this.accessToken) return null;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear and reinitialize
          localStorage.removeItem('spotify_access_token');
          this.accessToken = null;
          await this.initialize();
          return this.getCurrentTrack();
        }
        throw new Error('Failed to fetch current track');
      }

      const data = await response.json();
      
      return {
        title: data.item.name,
        artist: data.item.artists[0].name,
        duration: data.item.duration_ms,
        currentPosition: data.progress_ms,
        isPlaying: data.is_playing
      };
    } catch (error) {
      console.error('Error fetching current track:', error);
      return null;
    }
  }

  async getPlaybackState(): Promise<{ position: number; isPlaying: boolean } | null> {
    if (!this.accessToken) {
      await this.initialize();
      if (!this.accessToken) return null;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('spotify_access_token');
          this.accessToken = null;
          await this.initialize();
          return this.getPlaybackState();
        }
        throw new Error('Failed to fetch playback state');
      }

      const data = await response.json();
      return {
        position: data.progress_ms,
        isPlaying: data.is_playing
      };
    } catch (error) {
      console.error('Error fetching playback state:', error);
      return null;
    }
  }
} 