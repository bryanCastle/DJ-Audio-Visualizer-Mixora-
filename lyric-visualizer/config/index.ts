interface Config {
  spotify: {
    clientId: string;
    redirectUri: string;
  };
  genius: {
    accessToken: string;
  };
}

function validateConfig(): Config {
  const spotifyClientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const spotifyRedirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  const geniusAccessToken = process.env.NEXT_PUBLIC_GENIUS_ACCESS_TOKEN;

  if (!spotifyClientId) {
    throw new Error('NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not defined in environment variables');
  }

  if (!spotifyRedirectUri) {
    throw new Error('NEXT_PUBLIC_SPOTIFY_REDIRECT_URI is not defined in environment variables');
  }

  if (!geniusAccessToken) {
    throw new Error('NEXT_PUBLIC_GENIUS_ACCESS_TOKEN is not defined in environment variables');
  }

  return {
    spotify: {
      clientId: spotifyClientId,
      redirectUri: spotifyRedirectUri
    },
    genius: {
      accessToken: geniusAccessToken
    }
  };
}

export const config = validateConfig(); 