import type { Lyrics, Metadata } from "../types";
import axios, { AxiosResponse } from "axios";
import { get, set } from "../util";
import { getOSLocale } from "../util";

export const name = "Musixmatch";
export const supportedPlatforms = ["linux", "win32"];

async function queryMusixmatch(method: string, params?: any, shouldUseToken = true): Promise<any | undefined> {
    let token: string | undefined;
    if (shouldUseToken) {
        token = get("mxmusertoken") || await getToken() || undefined;

        if (!token) {
            console.error("No Musixmatch user token found");
            return undefined;
        }

        if (!get("mxmusertoken") && token) {
            set("mxmusertoken", token);
        }
    }

    try {
        const queryParams = new URLSearchParams();
        queryParams.append("method", method);
        
        if (params) {
            queryParams.append("params", JSON.stringify({
                ...params,
                usertoken: token
            }));
        }

        console.log(`Making Musixmatch API request to ${method} with params:`, params);
        const response = await axios.get(`/api/musixmatch?${queryParams.toString()}`);
        console.log(`Musixmatch API response for ${method}:`, response.data);
        return response.data;
    } catch (e) {
        console.error(`Musixmatch API request for method ${method} failed:`, e);
        return undefined;
    }
}

async function getToken() {
    console.log("Attempting to get Musixmatch token...");
    const result = await queryMusixmatch("token.get", {}, false);
    if (result) {
        const token = result.message?.body?.user_token;
        if (token && token.length && token !== "UpgradeOnlyUpgradeOnlyUpgradeOnlyUpgradeOnly") {
            console.log("Successfully obtained Musixmatch token");
            return token;
        }
    }

    console.error("Failed to get Musixmatch token");
    return undefined;
}

interface LyricLine {
    text: string;
    time?: number;
    duration?: number;
    translation?: string;
}

export async function query(metadata: Metadata): Promise<Lyrics | undefined> {
    console.log("Querying Musixmatch for lyrics:", metadata);
    
    const reply: Lyrics = {
        provider: "Musixmatch",
        synchronized: true,
        copyright: undefined,
        lines: []
    };

    // First try to get the track ID
    const trackSearchParams = {
        format: "json",
        q_artist: metadata.artist,
        q_track: metadata.title,
        page_size: 1,
        page: 1,
        s_track_rating: "desc"
    };

    const trackResult = await queryMusixmatch("track.search", trackSearchParams);
    if (!trackResult?.message?.body?.track_list?.[0]?.track) {
        console.error("No track found in Musixmatch");
        return undefined;
    }

    const trackId = trackResult.message.body.track_list[0].track.track_id;
    console.log("Found track ID:", trackId);

    // Try to get synchronized lyrics first
    const syncParams = {
        format: "json",
        track_id: trackId,
        subtitle_format: "mxm"
    };

    const syncResult = await queryMusixmatch("track.subtitles.get", syncParams);
    
    if (syncResult?.message?.body?.subtitle_list?.[0]?.subtitle) {
        console.log("Found synchronized lyrics");
        const subtitle = syncResult.message.body.subtitle_list[0].subtitle;
        reply.lines = JSON.parse(subtitle.subtitle_body).map((v: any) => ({ 
            text: v.text, 
            time: v.time.total 
        }));
        reply.copyright = subtitle.lyrics_copyright?.trim().split("\n").join(" • ");
    } else {
        // If no synchronized lyrics, try basic lyrics
        console.log("No synchronized lyrics found, trying basic lyrics");
        const basicParams = {
            format: "json",
            track_id: trackId
        };

        const basicResult = await queryMusixmatch("track.lyrics.get", basicParams);
        
        if (basicResult?.message?.body?.lyrics?.lyrics_body) {
            console.log("Found basic lyrics");
            reply.synchronized = false;
            const lyrics = basicResult.message.body.lyrics;
            reply.lines = lyrics.lyrics_body.split("\n").map((x: string) => ({ text: x }));
            reply.copyright = lyrics.lyrics_copyright?.trim().split("\n").join(" • ");
        } else {
            console.error("No lyrics found in Musixmatch response");
            return undefined;
        }
    }

    // Try to get translations if we have lyrics
    if (trackId) {
        console.log("Attempting to fetch translations for track:", trackId);
        const translations = await queryTranslation(trackId);
        if (translations) {
            console.log("Found translations:", translations.length);
            for (const line of reply.lines) {
                for (const translationLine of translations) {
                    if (
                        line.text.toLowerCase().trim() === translationLine.translation.matched_line.toLowerCase().trim() ||
                        line.text.toLowerCase().trim() === translationLine.translation.subtitle_matched_line.toLowerCase().trim()
                    ) {
                        (line as LyricLine).translation = translationLine.translation.description.trim();
                    }
                }
            }
        }
    }

    console.log("Successfully processed lyrics:", reply.lines.length, "lines");
    return reply;
}

async function queryTranslation(trackId: string) {
    const queryParams = {
        format: "json",
        comment_format: "text",
        part: "user",
        track_id: trackId,
        translation_fields_set: "minimal",
        selected_language: get("mxmlanguage") || get("language") || getOSLocale()[0] || "en",
    };

    const result = await queryMusixmatch("crowd.track.translations.get", queryParams);
    return result?.message?.body?.translations_list;
} 