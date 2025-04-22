import { LyricData } from '../types';

export class LyricManager {
  private lyrics: LyricData[];
  private currentIndex: number;
  private lastUpdateTime: number;

  constructor(lyrics: LyricData[] = []) {
    this.lyrics = lyrics;
    this.currentIndex = 0;
    this.lastUpdateTime = 0;
  }

  setLyrics(lyrics: LyricData[]): void {
    this.lyrics = lyrics;
    this.currentIndex = 0;
    this.lastUpdateTime = 0;
  }

  update(currentTime: number): LyricData | null {
    if (this.lyrics.length === 0) return null;

    // Find the current lyric based on timestamp
    let foundIndex = -1;
    for (let i = 0; i < this.lyrics.length; i++) {
      const lyric = this.lyrics[i];
      if (currentTime >= lyric.timestamp && currentTime < lyric.timestamp + lyric.duration) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      // If we're past the last lyric, return null
      if (currentTime > this.lyrics[this.lyrics.length - 1].timestamp + this.lyrics[this.lyrics.length - 1].duration) {
        return null;
      }
      // If we're before the first lyric, return null
      if (currentTime < this.lyrics[0].timestamp) {
        return null;
      }
      // Find the next upcoming lyric
      for (let i = 0; i < this.lyrics.length; i++) {
        if (currentTime < this.lyrics[i].timestamp) {
          foundIndex = i;
          break;
        }
      }
    }

    if (foundIndex !== -1 && foundIndex !== this.currentIndex) {
      this.currentIndex = foundIndex;
      this.lastUpdateTime = currentTime;
      return this.lyrics[foundIndex];
    }

    return null;
  }

  getNextLyrics(count: number = 3): LyricData[] {
    if (this.lyrics.length === 0) return [];
    
    const nextLyrics: LyricData[] = [];
    for (let i = 0; i < count; i++) {
      const index = this.currentIndex + i;
      if (index < this.lyrics.length) {
        nextLyrics.push(this.lyrics[index]);
      }
    }
    return nextLyrics;
  }

  getCurrentLyric(): LyricData | null {
    if (this.lyrics.length === 0 || this.currentIndex >= this.lyrics.length) {
      return null;
    }
    return this.lyrics[this.currentIndex];
  }

  getProgress(currentTime: number): number {
    const currentLyric = this.getCurrentLyric();
    if (!currentLyric) return 0;

    const start = currentLyric.timestamp;
    const end = start + currentLyric.duration;
    
    if (currentTime < start) return 0;
    if (currentTime > end) return 1;
    
    return (currentTime - start) / (end - start);
  }
} 