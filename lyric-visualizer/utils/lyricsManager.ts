import { debug } from "../debug";
import type { Lyrics, Metadata } from "../types";
import * as Genius from "../providers/genius";

const providerList = [Genius];

// Filter providers based on platform
for(let i = 0; i < providerList.length; i++){
    if(!providerList[i].supportedPlatforms.includes(process.platform))
        providerList.splice(i, 1);
}

export async function getAllLyrics(metadata: Metadata): Promise<Lyrics[]> {
    if (!metadata.artist || !metadata.title) // there can't be lyrics without at least those two fields
        return [];

    const providerPromises = providerList.map(provider => provider.query(metadata));
    return (await Promise.all(providerPromises)).filter((x): x is Lyrics => x !== undefined && x.lines.length > 0);
}

export async function queryLyricsAutomatically(metadata: Metadata): Promise<Lyrics | undefined> {
    let lyrics: Lyrics | undefined;

    if (!metadata.artist || !metadata.title) {
        debug("No artist or title provided for lyrics search");
        return undefined;
    }

    debug(`Searching for lyrics: ${metadata.artist} - ${metadata.title}`);
    lyrics = (await getAllLyrics(metadata))[0];

    if (lyrics) {
        debug("Found lyrics from " + lyrics.provider);
    } else {
        debug("Unable to fetch lyrics");
        return {
            provider: "None",
            synchronized: false,
            lines: [],
            unavailable: true
        };
    }

    return lyrics;
}

function computeLyricsID(metadata: Metadata) {
    return `${metadata.artist}:${metadata.album}:${metadata.title}`;
} 