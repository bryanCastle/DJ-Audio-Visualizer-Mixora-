export interface LyricData {
  text: string;
  timestamp: number; // in milliseconds
  duration: number; // in milliseconds
}

export interface TrackData {
  title: string;
  artist: string;
  duration: number;
  currentPosition: number;
  isPlaying: boolean;
}

export interface LyricVisualizerSettings {
  fontSize: number;
  depth: number;
  spacing: number;
  animationSpeed: number;
  color: string;
}

export interface AudioAnalysis {
  frequency: number[];
  amplitude: number[];
}

export interface LyricMesh extends THREE.Mesh {
  userData: {
    lyric: LyricData;
    isActive: boolean;
  };
}

export interface Lyrics {
    provider: string;
    synchronized: boolean;
    copyright?: string;
    lines: { text: string }[];
    unavailable?: boolean;
}

export interface Metadata {
    artist: string;
    title: string;
    album?: string;
    albumArtist?: string;
    albumArtists?: string[];
    artUrl?: string;
    artData?: {
        data: Buffer;
        type: string[];
        palette?: {
            DarkMuted?: string;
            DarkVibrant?: string;
            LightMuted?: string;
            LightVibrant?: string;
            Muted?: string;
            Vibrant?: string;
        };
    };
    length?: number;
    count?: number;
    lyrics?: string;
    id?: string;
    location?: string;
} 