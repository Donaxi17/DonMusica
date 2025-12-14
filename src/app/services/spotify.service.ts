import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface SpotifyToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface SpotifyTrack {
    name: string;
    artists: { name: string }[];
    album: {
        images: { url: string; height: number; width: number }[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class SpotifyService {
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() { }

    private async getAccessToken(): Promise<string> {
        // Check if we have a valid token
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            console.log('🔑 Using cached Spotify token');
            return this.accessToken;
        }

        console.log('🔑 Getting new Spotify access token...');

        // Get new token
        const credentials = btoa(`${environment.spotify.clientId}:${environment.spotify.clientSecret}`);

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            console.error('❌ Failed to get Spotify token:', response.status, response.statusText);
            throw new Error('Failed to get Spotify access token');
        }

        const data: SpotifyToken = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min before expiry

        console.log('✅ Spotify token obtained successfully');
        return this.accessToken;
    }

    async searchTrack(title: string, artist: string): Promise<string | null> {
        try {
            console.log(`🎵 Spotify search: "${title}" by "${artist}"`);

            // Check if title contains artist name (format: "Artist - Song")
            let searchArtist = artist;
            let searchTitle = title;

            if (title.includes(' - ')) {
                const parts = title.split(' - ');
                if (parts.length >= 2) {
                    searchArtist = parts[0].trim();
                    searchTitle = parts.slice(1).join(' - ').trim();
                    console.log(`📝 Extracted from title: "${searchTitle}" by "${searchArtist}"`);
                }
            }

            const token = await this.getAccessToken();

            // Clean and encode search query
            const query = encodeURIComponent(`track:${searchTitle} artist:${searchArtist}`);

            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                console.error('❌ Spotify API error:', response.status);
                return null;
            }

            const data = await response.json();

            if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
                // Find best match
                const cleanTitle = searchTitle.toLowerCase().trim();
                const cleanArtist = searchArtist.toLowerCase().trim();

                let bestMatch: SpotifyTrack | null = null;
                let bestScore = 0;

                for (const track of data.tracks.items) {
                    const trackTitle = track.name.toLowerCase();
                    const trackArtists = track.artists.map((a: any) => a.name.toLowerCase()).join(' ');

                    let score = 0;

                    // Title matching
                    if (trackTitle === cleanTitle) {
                        score += 10;
                    } else if (trackTitle.includes(cleanTitle) || cleanTitle.includes(trackTitle)) {
                        score += 5;
                    }

                    // Artist matching
                    if (trackArtists.includes(cleanArtist) || cleanArtist.includes(trackArtists)) {
                        score += 10;
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = track;
                    }
                }

                // Return highest quality image if we have a good match
                if (bestMatch && bestScore >= 10) {
                    const images = bestMatch.album.images;
                    if (images && images.length > 0) {
                        console.log(`✅ Found artwork for "${searchTitle}" by "${searchArtist}"`);
                        // Return the largest image (first one is usually the largest)
                        return images[0].url;
                    }
                }
            }

            console.log(`❌ No artwork found for "${searchTitle}" by "${searchArtist}"`);
            return null;
        } catch (error) {
            console.error('❌ Spotify search error:', error);
            return null;
        }
    }

    async getTrackArtwork(title: string, artist: string): Promise<string | null> {
        return this.searchTrack(title, artist);
    }
}
