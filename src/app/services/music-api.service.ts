import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, catchError, switchMap, forkJoin, from, mergeMap, toArray, delay, concatMap } from 'rxjs';
import { Song } from './playlist.service';
import { environment } from '../../environments/environment';

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string; id: string }>;
    album: {
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
    };
    duration_ms: number;
    preview_url: string | null;
}

export interface iTunesTrack {
    trackId: number;
    artistId?: number;
    trackName: string;
    artistName: string;
    collectionName: string;
    artworkUrl100: string;
    previewUrl: string;
    trackTimeMillis: number;
    primaryGenreName: string;
    releaseDate: string;
}

@Injectable({
    providedIn: 'root'
})
export class MusicApiService {
    private readonly SPOTIFY_API_URL = 'https://api.spotify.com/v1';
    private readonly SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
    private readonly LYRICS_API_URL = 'https://api.lyrics.ovh/v1';
    private readonly GENIUS_API_URL = 'https://api.genius.com';
    private readonly JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
    private readonly JAMENDO_CLIENT_ID = environment.jamendo?.clientId || 'c85b065b';
    private spotifyToken: string | null = null;
    private tokenExpiresAt: number = 0;
    private readonly CACHE_PREFIX = 'donmusica_api_cache_';
    private readonly DEFAULT_TTL = 1000 * 60 * 60; // 1 hora por defecto

    constructor(private http: HttpClient) {
        this.getSpotifyToken();
    }

    private getFromCache<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;
        try {
            const cached = localStorage.getItem(this.CACHE_PREFIX + key);
            if (!cached) return null;

            const { data, expiry } = JSON.parse(cached);

            if (Date.now() > expiry || (Array.isArray(data) && data.length === 0)) {
                localStorage.removeItem(this.CACHE_PREFIX + key);
                return null;
            }
            return data;
        } catch (e) {
            return null;
        }
    }

    private saveToCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
        if (typeof window === 'undefined') return;
        try {
            const cacheData = {
                data,
                expiry: Date.now() + ttl
            };
            localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Could not save to cache:', key);
        }
    }

    private getSpotifyToken(): Observable<string> {
        const now = Date.now();
        if (this.spotifyToken && now < this.tokenExpiresAt) {
            return of(this.spotifyToken);
        }

        const body = 'grant_type=client_credentials';
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${environment.spotify.clientId}:${environment.spotify.clientSecret}`)
        });

        return this.http.post<any>(this.SPOTIFY_TOKEN_URL, body, { headers }).pipe(
            map(response => {
                this.spotifyToken = response.access_token;
                this.tokenExpiresAt = Date.now() + (response.expires_in * 1000) - 100000;
                return response.access_token;
            }),
            catchError(err => {
                console.error('Error getting Spotify token:', err);
                return of('');
            })
        );
    }

    // --- TRENDING ---
    getTrending(region: string = 'US', isChart: boolean = false): Observable<Song[]> {
        const cacheKey = `trending_${region}_${isChart}`;
        const cachedData = this.getFromCache<Song[]>(cacheKey);

        if (cachedData && cachedData.length > 0) {
            return of(cachedData);
        }

        return this.getTrendingFromITunes(region, isChart).pipe(
            map(songs => {
                if (songs && songs.length > 0) {
                    this.saveToCache(cacheKey, songs);
                }
                return songs;
            })
        );
    }

    private getTrendingFromITunes(region: string = 'US', isChart: boolean = false): Observable<Song[]> {
        const countryCode = region.toUpperCase();
        const itunesCountry = (countryCode === 'US') ? 'us' : countryCode.toLowerCase();

        // Use HTTP GET for RSS feeds (they support CORS, JSONP breaks them with 400 error)
        const rssUrl = `https://itunes.apple.com/${itunesCountry}/rss/topsongs/limit=50/json`;
        return this.http.get<any>(rssUrl).pipe(
            map(res => {
                const entries = res.feed?.entry;
                if (!entries || entries.length === 0) return [];
                return entries.map((e: any) => this.convertITunesRSSToSong(e));
            }),
            switchMap(songs => {
                // If we got results, return them
                if (songs.length > 0) {
                    return of(songs);
                }
                // If no results for this country, try US as fallback
                if (itunesCountry !== 'us') {
                    return this.getTrendingFromITunes('US', isChart);
                }
                // Last resort: search fallback
                return this.getTrendingSearchFallback(countryCode, isChart);
            }),
            catchError(() => this.getTrendingSearchFallback(countryCode, isChart))
        );
    }

    private getTrendingSearchFallback(countryCode: string, isChart: boolean): Observable<Song[]> {
        let searchTerms: string[] = [];
        if (isChart) {
            if (countryCode === 'CO') searchTerms = ['Reggaeton', 'Exitos Colombia'];
            else if (countryCode === 'MX') searchTerms = ['Regional Mexicano', 'Exitos Mexico'];
            else searchTerms = ['Top Hits', 'Global Charts'];
        } else {
            if (countryCode === 'CO') searchTerms = ['Reggaeton 2025', 'Popular Colombia'];
            else if (countryCode === 'MX') searchTerms = ['Musica Mexicana', 'Tendencias'];
            else searchTerms = ['Trending', 'Hot Tracks'];
        }

        const currentHour = new Date().getHours();
        const term = searchTerms[currentHour % searchTerms.length];
        const itunesCountry = (countryCode === 'US') ? 'US' : countryCode;
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=50&country=${itunesCountry}`;

        return this.http.jsonp<any>(url, 'callback').pipe(
            map(res => {
                if (!res.results || res.results.length === 0) return [];
                const songs = res.results.filter((t: any) => t && (t.trackId || t.collectionId)).map((t: any) => this.convertITunesToSong(t));
                const unique = songs.filter((s: Song, i: number, self: Song[]) =>
                    s && i === self.findIndex((t: Song) => t && (t.id === s.id || (t.title === s.title && t.artist === s.artist)))
                );
                return unique.slice(0, 30);
            }),
            switchMap(songs => {
                if (songs.length === 0 && itunesCountry !== 'US') {
                    return this.getTrendingSearchFallback('US', isChart);
                }
                return of(songs);
            }),
            catchError(() => of([]))
        );
    }

    // --- NEW RELEASES ---
    getNewReleases(country: string = 'US', limit: number = 30): Observable<Song[]> {
        const cacheKey = `new_releases_${country}_${limit}`;
        const cachedData = this.getFromCache<Song[]>(cacheKey);

        if (cachedData && cachedData.length > 0) {
            return of(cachedData);
        }

        // Prioritize iTunes RSS feeds for regional content (more reliable than Spotify for regions)
        return this.getNewReleasesFromITunes(country, limit).pipe(
            switchMap(songs => {
                if (songs.length >= 5) {
                    this.saveToCache(cacheKey, songs);
                    return of(songs);
                }
                // Fallback to Spotify if iTunes doesn't have enough content
                return this.getNewReleasesFromSpotify(country, limit);
            }),
            map((songs: Song[]) => {
                if (songs && songs.length > 0) {
                    this.saveToCache(cacheKey, songs);
                }
                return songs;
            })
        );
    }

    private getNewReleasesFromSpotify(country: string, limit: number): Observable<Song[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) return of([]);

                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

                return this.http.get<any>(`${this.SPOTIFY_API_URL}/browse/new-releases?country=${country}&limit=50`, { headers }).pipe(
                    switchMap(response => {
                        if (response.albums?.items?.length > 0) {
                            const scanLimit = Math.min(limit, 18);
                            const albumItems = response.albums.items.slice(0, scanLimit);

                            return from(albumItems).pipe(
                                concatMap((album: any) => {
                                    const artistName = album.artists[0]?.name || '';
                                    const albumName = album.name || '';
                                    const searchQuery = `${artistName} ${albumName}`.trim()
                                        .replace(/\s+/g, ' ')
                                        .replace(/[&]/g, 'and');

                                    const iTunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&entity=song&limit=1&country=${country}`;

                                    return of(null).pipe(
                                        delay(Math.floor(Math.random() * 500) + 300),
                                        switchMap(() => this.http.jsonp<any>(iTunesUrl, 'callback')),
                                        map(res => {
                                            if (res.results?.length > 0) {
                                                const t = res.results[0];
                                                return {
                                                    id: album.id,
                                                    artistId: 0,
                                                    title: album.name,
                                                    artist: album.artists.map((a: any) => a.name).join(', '),
                                                    album: album.name,
                                                    img: album.images[0]?.url || 'https://placehold.co/300x300/18181b/10b981?text=Music',
                                                    url: t.previewUrl || '',
                                                    duration: this.formatDuration(t.trackTimeMillis / 1000),
                                                    genre: t.primaryGenreName || 'Pop',
                                                    isStreamUrlFetched: true
                                                } as Song;
                                            }
                                            return null;
                                        }),
                                        catchError(() => of(null))
                                    );
                                }),
                                toArray(),
                                map((songs: Array<Song | null>) => {
                                    const valid = songs.filter((s: Song | null): s is Song => s !== null && s.url !== '');
                                    return valid.length >= 1 ? valid.slice(0, limit) : [];
                                }),
                                catchError(() => of([]))
                            ) as Observable<Song[]>;
                        }
                        return of([]);
                    }),
                    catchError(() => of([]))
                );
            })
        );
    }

    private getNewReleasesFromITunes(country: string, limit: number): Observable<Song[]> {
        const countryCode = country.toLowerCase();
        // Use iTunes RSS feed for top albums which contains recent releases by region
        const rssUrl = `https://itunes.apple.com/${countryCode}/rss/topalbums/limit=50/json`;

        return this.http.get<any>(rssUrl).pipe(
            switchMap(res => {
                const entries = res.feed?.entry;
                if (!entries || entries.length === 0) {
                    return this.getNewReleasesSearchFallback(country, limit);
                }

                // Process albums sequentially to get song previews
                return from(entries.slice(0, Math.min(limit, 20))).pipe(
                    concatMap((album: any) => {
                        const artistName = album['im:artist']?.label || '';
                        const albumName = album['im:name']?.label || '';
                        const artworkUrl = album['im:image']?.[2]?.label || album['im:image']?.[0]?.label || '';

                        // Search for a track from this album to get preview URL
                        const searchQuery = `${artistName} ${albumName}`.trim().replace(/\s+/g, ' ');
                        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&entity=song&limit=1&country=${countryCode.toUpperCase()}`;

                        return of(null).pipe(
                            delay(250 + Math.random() * 250),
                            switchMap(() => this.http.jsonp<any>(searchUrl, 'callback')),
                            map(searchRes => {
                                if (searchRes.results?.length > 0) {
                                    const track = searchRes.results[0];
                                    return {
                                        id: album.id?.attributes?.['im:id'] || track.trackId?.toString() || Math.random().toString(),
                                        artistId: track.artistId || 0,
                                        title: albumName,
                                        artist: artistName,
                                        album: albumName,
                                        img: artworkUrl.replace(/\/\d+x\d+bb/g, '/600x600bb') || track.artworkUrl100?.replace('100x100', '600x600'),
                                        url: track.previewUrl || '',
                                        duration: this.formatDuration((track.trackTimeMillis || 30000) / 1000),
                                        genre: track.primaryGenreName || 'Pop',
                                        isStreamUrlFetched: true
                                    } as Song;
                                }
                                return null;
                            }),
                            catchError(() => of(null))
                        );
                    }),
                    toArray(),
                    map((songs: Array<Song | null>) => {
                        const valid = songs.filter((s): s is Song => s !== null && s.url !== '');
                        return valid.slice(0, limit);
                    })
                );
            }),
            switchMap(songs => songs.length >= 5 ? of(songs) : this.getNewReleasesSearchFallback(country, limit)),
            catchError(() => this.getNewReleasesSearchFallback(country, limit))
        );
    }

    private getNewReleasesSearchFallback(country: string, limit: number): Observable<Song[]> {
        const countryCode = country.toUpperCase();
        // Regional search terms for fallback
        const regionalTerms: Record<string, string[]> = {
            'CO': ['Reggaeton 2024', 'Feid', 'Karol G', 'Ryan Castro'],
            'MX': ['Regional Mexicano', 'Peso Pluma', 'Junior H', 'Natanael Cano'],
            'US': ['New Music Friday', 'Taylor Swift', 'Drake', 'The Weeknd']
        };

        const terms = regionalTerms[countryCode] || regionalTerms['US'];
        const term = terms[Math.floor(Math.random() * terms.length)];
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}&country=${countryCode}`;

        return this.http.jsonp<any>(url, 'callback').pipe(
            map(res => {
                if (!res.results || res.results.length === 0) return [];
                return res.results
                    .filter((t: any) => t.previewUrl)
                    .map((t: any) => this.convertITunesToSong(t))
                    .slice(0, limit);
            }),
            catchError(() => of([]))
        );
    }

    private convertITunesRSSToSong(e: any): Song {
        const links = Array.isArray(e.link) ? e.link : [e.link];
        const previewLink = links.find((l: any) => l.attributes?.['im:assetType'] === 'preview') || links[1] || links[0];
        const previewUrl = previewLink?.attributes?.href || '';
        const images = e['im:image'] || [];
        const largeImage = images[images.length - 1]?.label || '';

        return {
            id: e.id?.attributes?.['im:id'] || Math.random().toString(),
            artistId: 0,
            title: e['im:name']?.label || e.title?.label || 'Unknown',
            artist: e['im:artist']?.label || 'Unknown Artist',
            album: e['im:collection']?.['im:name']?.label || '',
            img: largeImage.replace(/\/\d+x\d+bb/g, '/600x600bb'),
            url: previewUrl,
            duration: '0:30',
            genre: e.category?.attributes?.label || 'Music',
            isStreamUrlFetched: true
        } as Song;
    }

    // --- SEARCH ---
    search(query: string): Observable<Song[]> {
        const cacheKey = `search_${query.trim().toLowerCase()}`;
        const cachedData = this.getFromCache<Song[]>(cacheKey);

        if (cachedData && cachedData.length > 0) {
            return of(cachedData);
        }

        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) return this.searchITunes(query);

                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.get<any>(`${this.SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=20`, { headers }).pipe(
                    switchMap(res => {
                        if (res.tracks?.items?.length > 0) {
                            return from(res.tracks.items).pipe(
                                concatMap((track: any) => of(null).pipe(
                                    delay(200 + Math.random() * 300),
                                    switchMap(() => this.getITunesPreviewForTrack(track, 'US'))
                                )),
                                toArray(),
                                map((songs: Array<Song | null>) => songs.filter((s: Song | null): s is Song => s !== null && s.url !== ''))
                            ) as Observable<Song[]>;
                        }
                        return of([]);
                    }),
                    switchMap(songs => songs.length > 0 ? of(songs) : this.searchITunes(query)),
                    map(songs => {
                        if (songs.length > 0) {
                            this.saveToCache(cacheKey, songs, 1000 * 60 * 30);
                        }
                        return songs;
                    })
                );
            })
        );
    }

    private searchITunes(query: string): Observable<Song[]> {
        const cleanQuery = query.trim().replace(/\s+/g, ' ');
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&entity=song&limit=25`;
        return this.http.jsonp<any>(url, 'callback').pipe(
            map(res => res.results ? res.results.map((t: any) => this.convertITunesToSong(t)) : []),
            catchError(() => of([]))
        );
    }

    // --- FEATURED PLAYLISTS ---
    getFeaturedPlaylists(country: string = 'US', limit: number = 20): Observable<any[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) return of([]);
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.get<any>(`${this.SPOTIFY_API_URL}/browse/featured-playlists?country=${country}&limit=${limit}`, { headers }).pipe(
                    map(res => res.playlists?.items ? res.playlists.items.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        img: p.images[0]?.url || 'https://placehold.co/300x300/18181b/10b981?text=Playlist',
                        tracks: p.tracks.total
                    })) : []),
                    catchError(() => of([]))
                );
            })
        );
    }

    // --- GENRES ---
    getGenres(): Observable<string[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) return of(this.getFallbackGenres());
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.get<any>(`${this.SPOTIFY_API_URL}/recommendations/available-genre-seeds`, { headers }).pipe(
                    map(res => res.genres || this.getFallbackGenres()),
                    catchError(() => of(this.getFallbackGenres()))
                );
            })
        );
    }

    getTracksByGenre(genre: string, limit: number = 20): Observable<Song[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) return this.searchITunes(genre);
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.get<any>(`${this.SPOTIFY_API_URL}/recommendations?seed_genres=${genre}&limit=${limit}`, { headers }).pipe(
                    switchMap(res => {
                        if (res.tracks?.length > 0) {
                            return from(res.tracks).pipe(
                                concatMap((track: any) => of(null).pipe(
                                    delay(200 + Math.random() * 300),
                                    switchMap(() => this.getITunesPreviewForTrack(track, 'US'))
                                )),
                                toArray(),
                                map((songs: Array<Song | null>) => songs.filter((s: Song | null): s is Song => s !== null && s.url !== ''))
                            ) as Observable<Song[]>;
                        }
                        return of([]);
                    }),
                    switchMap(songs => songs.length > 0 ? of(songs) : this.searchITunes(genre))
                );
            })
        );
    }

    // --- JAMENDO ---
    searchJamendo(query: string, limit: number = 20): Observable<Song[]> {
        const url = `${this.JAMENDO_API_URL}/tracks/?client_id=${this.JAMENDO_CLIENT_ID}&format=json&limit=${limit}&namesearch=${encodeURIComponent(query)}&include=musicinfo`;
        return this.http.get<any>(url).pipe(
            map(res => res.results ? res.results.map((t: any) => this.convertJamendoToSong(t)) : []),
            catchError(() => of([]))
        );
    }

    getJamendoByGenre(genre: string, limit: number = 20): Observable<Song[]> {
        const url = `${this.JAMENDO_API_URL}/tracks/?client_id=${this.JAMENDO_CLIENT_ID}&format=json&limit=${limit}&tags=${encodeURIComponent(genre)}&include=musicinfo`;
        return this.http.get<any>(url).pipe(
            map(res => res.results ? res.results.map((t: any) => this.convertJamendoToSong(t)) : []),
            catchError(() => of([]))
        );
    }

    getJamendoPopular(limit: number = 20): Observable<Song[]> {
        const url = `${this.JAMENDO_API_URL}/tracks/?client_id=${this.JAMENDO_CLIENT_ID}&format=json&limit=${limit}&order=popularity_week&include=musicinfo`;
        return this.http.get<any>(url).pipe(
            map(res => res.results ? res.results.map((t: any) => this.convertJamendoToSong(t)) : []),
            catchError(() => of([]))
        );
    }

    // --- HELPERS ---
    private getITunesPreviewForTrack(spotifyTrack: any, country: string): Observable<Song | null> {
        const query = `${spotifyTrack.artists[0].name} ${spotifyTrack.name}`.trim();
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1&country=${country}`;

        return this.http.jsonp<any>(url, 'callback').pipe(
            map(res => {
                if (res.results?.length > 0) {
                    const t = res.results[0];
                    return {
                        id: spotifyTrack.id,
                        artistId: 0,
                        title: spotifyTrack.name,
                        artist: spotifyTrack.artists.map((a: any) => a.name).join(', '),
                        album: spotifyTrack.album.name,
                        img: spotifyTrack.album.images[0]?.url || 'https://placehold.co/300x300/18181b/10b981?text=Music',
                        url: t.previewUrl || '',
                        duration: this.formatDuration(t.trackTimeMillis / 1000),
                        genre: t.primaryGenreName || 'Pop',
                        isStreamUrlFetched: true
                    };
                }
                return null;
            }),
            catchError(() => of(null))
        );
    }

    private convertITunesToSong(track: iTunesTrack): Song {
        let artwork = track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '600x600') : 'https://placehold.co/300x300/18181b/10b981?text=Music';
        if (artwork.includes('staticld.com') || artwork.includes('storageimagedisplay.com')) {
            artwork = 'https://placehold.co/600x600/18181b/10b981?text=DonMusica';
        }

        return {
            id: track.trackId.toString(),
            artistId: track.artistId ? track.artistId.toString() : 0,
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName || 'Single',
            img: artwork,
            url: track.previewUrl || '',
            duration: this.formatDuration(track.trackTimeMillis / 1000),
            genre: track.primaryGenreName || 'Pop',
            isStreamUrlFetched: true
        };
    }

    private convertJamendoToSong(track: any): Song {
        return {
            id: String(track.id),
            artistId: track.artist_id ? String(track.artist_id) : 0,
            title: track.name,
            artist: track.artist_name,
            album: track.album_name,
            img: track.album_image,
            url: track.audio,
            duration: this.formatDuration(track.duration),
            genre: track.musicinfo?.tags?.[0] || 'Pop',
            isStreamUrlFetched: true
        };
    }

    private convertSpotifyToSong(track: SpotifyTrack): Song {
        return {
            id: track.id,
            artistId: track.artists && track.artists.length > 0 ? track.artists[0].id : 0,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            img: track.album.images[0]?.url || 'https://placehold.co/300x300/18181b/10b981?text=Music',
            url: track.preview_url || '',
            duration: this.formatDuration(track.duration_ms / 1000),
            genre: 'Pop',
            isStreamUrlFetched: !!track.preview_url
        };
    }

    private formatDuration(seconds: number): string {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    private getFallbackGenres(): string[] {
        return ['pop', 'rock', 'hip-hop', 'electronic', 'latin', 'reggaeton', 'indie', 'r-n-b', 'jazz', 'classical', 'metal', 'country', 'salsa', 'vallenato'];
    }

    getLyrics(artist: string, title: string): Observable<string> {
        const cleanArtist = artist.split(',')[0].split('feat')[0].split('ft.')[0].trim();
        const cleanTitle = title.split('(')[0].split('[')[0].split('-')[0].trim();
        const lrclibUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;

        return this.http.get<any>(lrclibUrl).pipe(
            map(res => {
                if (res.plainLyrics) return res.plainLyrics;
                if (res.syncedLyrics) return res.syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim();
                return '';
            }),
            catchError(() => {
                const lyricsOvhUrl = `${this.LYRICS_API_URL}/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;
                return this.http.get<any>(lyricsOvhUrl).pipe(
                    map(res => res.lyrics || ''),
                    catchError(() => of(''))
                );
            })
        );
    }

    getStreamUrl(videoId: string): Observable<string | null> {
        const pipedInstances = ['https://api.piped.private.coffee', 'https://pipedapi.kavin.rocks'];
        const baseUrl = pipedInstances[0];

        return this.http.get<any>(`${baseUrl}/streams/${videoId}`).pipe(
            map(res => {
                if (res.audioStreams && res.audioStreams.length > 0) {
                    const m4aStream = res.audioStreams.find((s: any) => s.format === 'M4A');
                    return m4aStream ? m4aStream.url : res.audioStreams[0].url;
                }
                return null;
            }),
            catchError(() => of(null))
        );
    }

    getBestAudioStream(title: string, artist: string): Observable<string | null> {
        const query = `${artist} - ${title} audio`;
        const pipedInstances = ['https://api.piped.private.coffee', 'https://pipedapi.kavin.rocks'];
        const baseUrl = pipedInstances[0];

        return this.http.get<any>(`${baseUrl}/search?q=${encodeURIComponent(query)}&filter=music_songs`).pipe(
            switchMap(res => {
                if (res.items && res.items.length > 0) {
                    const videoId = res.items[0].url.split('/watch?v=')[1];
                    return this.getStreamUrl(videoId);
                }
                return of(null);
            }),
            catchError(() => of(null))
        );
    }

    searchArtistInITunes(artistName: string): Observable<Array<{
        artistId: number;
        artistName: string;
        primaryGenreName: string;
        artworkUrl100: string;
        artworkUrl600?: string;
        trackCount?: number;
    }>> {
        if (!artistName || artistName.trim().length < 2) return of([]);
        const cleanArtist = artistName.trim().replace(/\s+/g, ' ');
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanArtist)}&media=music&entity=song&limit=50`;

        return this.http.jsonp<any>(url, 'callback').pipe(
            map(res => {
                if (!res.results || res.results.length === 0) return [];
                const artistsMap = new Map<string, any>();
                res.results.forEach((track: any) => {
                    const artistKey = track.artistName.toLowerCase();
                    if (!artistsMap.has(artistKey)) {
                        artistsMap.set(artistKey, {
                            artistId: track.artistId,
                            artistName: track.artistName,
                            primaryGenreName: track.primaryGenreName || 'Music',
                            artworkUrl100: track.artworkUrl100 || '',
                            artworkUrl600: track.artworkUrl100?.replace('100x100bb', '600x600bb') || '',
                            trackCount: 1
                        });
                    } else {
                        artistsMap.get(artistKey)!.trackCount++;
                    }
                });
                return Array.from(artistsMap.values())
                    .sort((a, b) => {
                        const searchLower = artistName.toLowerCase();
                        if (a.artistName.toLowerCase() === searchLower && b.artistName.toLowerCase() !== searchLower) return -1;
                        if (a.artistName.toLowerCase() !== searchLower && b.artistName.toLowerCase() === searchLower) return 1;
                        return (b.trackCount || 0) - (a.trackCount || 0);
                    })
                    .slice(0, 10);
            }),
            catchError(() => of([]))
        );
    }

    searchTrack(trackName: string, artistName?: string): Observable<Song[]> {
        const searchTerm = (artistName ? `${trackName} ${artistName}` : trackName).trim().replace(/\s+/g, ' ');
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=20`;

        return this.http.jsonp<any>(url, 'callback').pipe(
            map(res => res.results ? res.results.map((track: any) => this.convertITunesToSong(track)) : []),
            catchError(() => of([]))
        );
    }

    searchTracksByArtist(artistName: string, limit: number = 20): Observable<Song[]> {
        const cleanArtist = artistName.trim().replace(/\s+/g, ' ');
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanArtist)}&media=music&entity=song&limit=${limit}`;

        return this.http.jsonp<any>(url, 'callback').pipe(
            map(res => res.results ? res.results.map((track: any) => this.convertITunesToSong(track)) : []),
            catchError(() => of([]))
        );
    }

}
