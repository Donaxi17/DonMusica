import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { SettingsService } from './settings.service';
import { CacheService } from './cache.service';

interface SpotifyToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

@Injectable({
    providedIn: 'root'
})
export class SpotifyService {
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;
    private settingsService = inject(SettingsService);
    private cacheService = inject(CacheService);
    private baseUrl = 'https://api.spotify.com/v1';
    private readonly ARTWORK_CACHE_KEY = 'spotify_artwork_v1';
    private readonly ARTIST_STATS_CACHE_KEY = 'spotify_artist_stats_v1';

    constructor() { }

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

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
        this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
        return this.accessToken;
    }

    async getTrackArtwork(title: string, artist: string): Promise<string | null> {
        const cacheKey = `${this.ARTWORK_CACHE_KEY}_${title.toLowerCase().trim()}_${artist.toLowerCase().trim()}`;
        const cached = this.cacheService.get<string>(cacheKey);
        if (cached) return cached;

        try {
            const token = await this.getAccessToken();
            const cleanT = (s: string) => s.replace(/\(feat\..*?\)/gi, '').replace(/\[.*?\]/g, '').replace(/ official video/gi, '').trim();
            const sTitle = cleanT(title);
            const sArtist = cleanT(artist);

            let queryStr = encodeURIComponent(`track:${sTitle} artist:${sArtist}`);
            let response = await fetch(`${this.baseUrl}/search?q=${queryStr}&type=track&limit=1`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data = await response.json();

            if (!data.tracks?.items?.length) {
                queryStr = encodeURIComponent(`${sTitle} ${sArtist}`);
                response = await fetch(`${this.baseUrl}/search?q=${queryStr}&type=track&limit=1`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                data = await response.json();
            }

            if (data.tracks?.items?.length > 0) {
                const images = data.tracks.items[0].album.images;
                if (images && images.length > 0) {
                    let url = images[0].url;
                    if (this.settingsService.dataSaver()) {
                        url = images[1]?.url || images[0].url;
                    }
                    this.cacheService.set(cacheKey, url, 60 * 24 * 30); // 30 days
                    return url;
                }
            }
            return null;
        } catch (error) {
            console.error('❌ Spotify search error:', error);
            return null;
        }
    }

    async getTrackMetadata(title: string, artist: string): Promise<{ image: string, duration_ms: number } | null> {
        try {
            const token = await this.getAccessToken();
            let queryStr = encodeURIComponent(`track:${title} artist:${artist}`);
            let response = await fetch(`${this.baseUrl}/search?q=${queryStr}&type=track&limit=1`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data = await response.json();

            if (!data.tracks?.items?.length) {
                queryStr = encodeURIComponent(`${title} ${artist}`);
                response = await fetch(`${this.baseUrl}/search?q=${queryStr}&type=track&limit=1`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                data = await response.json();
            }

            if (data.tracks?.items?.length > 0) {
                const track = data.tracks.items[0];
                const images = track.album.images;
                let image = images[0]?.url || '';
                if (this.settingsService.dataSaver() && images && images.length > 1) {
                    image = images[1]?.url || images[0]?.url || '';
                }
                return { image, duration_ms: track.duration_ms };
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    async getArtistStats(artistName: string): Promise<{ followers: number; popularity: number; image?: string } | null> {
        const cached = this.getArtistStatsFromCache(artistName);
        if (cached) return cached;

        try {
            const token = await this.getAccessToken();
            const queryStr = encodeURIComponent(artistName);

            // Get top 5 results to find the best match
            const response = await fetch(
                `${this.baseUrl}/search?q=${queryStr}&type=artist&limit=5`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (!response.ok) return null;

            const data = await response.json();

            if (data.artists && data.artists.items && data.artists.items.length > 0) {
                // Normalize function to compare names
                const normalize = (name: string) => name.toLowerCase().trim()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Remove accents
                    .replace(/[^a-z0-9\s]/g, ''); // Remove special chars

                const searchName = normalize(artistName);

                // Find exact match first
                let artist = data.artists.items.find((a: any) =>
                    normalize(a.name) === searchName
                );

                // If no exact match, find the closest match (starts with search name)
                if (!artist) {
                    artist = data.artists.items.find((a: any) =>
                        normalize(a.name).startsWith(searchName)
                    );
                }

                // If still no match, use the most popular one (first result)
                if (!artist) {
                    artist = data.artists.items[0];
                }

                const images = artist.images;
                let image = images[0]?.url;

                if (this.settingsService.dataSaver() && images && images.length > 1) {
                    image = images[1]?.url || images[0]?.url;
                }

                const result = {
                    followers: artist.followers.total,
                    popularity: artist.popularity,
                    image
                };
                this.cacheService.set(this.ARTIST_STATS_CACHE_KEY + '_' + artistName.toLowerCase().trim(), result, 60 * 24 * 7); // 7 days
                return result;
            }
            return null;
        } catch (error) {
            console.error('Error fetching artist stats:', error);
            return null;
        }
    }

    getArtistStatsFromCache(artistName: string) {
        const cacheKey = `${this.ARTIST_STATS_CACHE_KEY}_${artistName.toLowerCase().trim()}`;
        return this.cacheService.get<any>(cacheKey);
    }

    clearArtistCache(artistName: string) {
        const cacheKey = `${this.ARTIST_STATS_CACHE_KEY}_${artistName.toLowerCase().trim()}`;
        this.cacheService.remove(cacheKey);
    }
}
