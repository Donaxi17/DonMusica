import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, catchError, switchMap, forkJoin } from 'rxjs';
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
    private readonly JAMENDO_CLIENT_ID = 'c85b065b'; // Public demo ID
    private spotifyToken: string | null = null;

    constructor(private http: HttpClient) {
        this.getSpotifyToken();
    }

    private getSpotifyToken(): Observable<string> {
        if (this.spotifyToken) {
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
                return response.access_token;
            }),
            catchError(err => {
                console.error('Error getting Spotify token:', err);
                return of('');
            })
        );
    }

    // --- TRENDING (Hybrid) ---
    // --- TRENDING (Direct iTunes for reliability and speed) ---
    getTrending(region: string = 'US'): Observable<Song[]> {
        // Skip Spotify to avoid 404s on featured-playlists for some regions
        // and because we need iTunes previews anyway.
        return this.getTrendingFromITunes(region);
    }

    private getTrendingFromITunes(region: string = 'US'): Observable<Song[]> {
        // Estrategia: Buscar "Hits" o "Latino" (ordenado por popularidad por iTunes)
        // y filtrar estrictamente por una lista de artistas verificados para evitar spam.

        const searchTerm = region === 'CO' ? 'Latino' : 'Pop';

        // Lista amplia de artistas verificados para filtrar el spam
        const trustedArtists = region === 'CO'
            ? ['Feid', 'Karol G', 'Bad Bunny', 'J Balvin', 'Maluma', 'Ryan Castro', 'Blessd', 'Shakira', 'Myke Towers', 'Rauw Alejandro', 'Daddy Yankee', 'Arcangel', 'Eladio Carrion', 'Mora', 'Sech', 'Manuel Turizo', 'Sebastian Yatra', 'Camilo', 'Grupo Frontera', 'Peso Pluma', 'Young Miko', 'Cris Mj', 'Anuel AA', 'Ozuna', 'Nicky Jam', 'Wisin', 'Yandel', 'Don Omar', 'Tini', 'Maria Becerra']
            : ['Taylor Swift', 'The Weeknd', 'Drake', 'Bad Bunny', 'Dua Lipa', 'Harry Styles', 'Ariana Grande', 'Justin Bieber', 'Ed Sheeran', 'Beyonce', 'Rihanna', 'Bruno Mars', 'Adele', 'Coldplay', 'Maroon 5', 'Post Malone', 'Billie Eilish', 'Olivia Rodrigo', 'SZA', 'Miley Cyrus', 'Katy Perry', 'Lady Gaga', 'Kendrick Lamar', 'Eminem', 'Imagine Dragons'];

        // Pedimos 200 canciones para tener suficiente margen después de filtrar
        // Agregamos timestamp para evitar caché y asegurar resultados frescos siempre
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=200&country=${region}&_t=${Date.now()}`;

        return this.http.get<any>(url).pipe(
            map(res => {
                if (!res.results) return [];

                // 1. Convertir a nuestro formato
                const songs = res.results.map((t: any) => this.convertITunesToSong(t));

                // 2. Filtrar: Solo artistas verificados (búsqueda flexible)
                const filtered = songs.filter((song: Song) => {
                    const artistName = song.artist.toLowerCase();
                    return trustedArtists.some(trusted => artistName.includes(trusted.toLowerCase()));
                });

                // 3. Eliminar duplicados (por ID o Título+Artista)
                const unique = filtered.filter((s: Song, i: number, self: Song[]) =>
                    i === self.findIndex((t: Song) => t.id === s.id || (t.title === s.title && t.artist === s.artist))
                );

                // 4. Devolver el Top 20 (iTunes ya los entregó ordenados por popularidad)
                return unique.slice(0, 20);
            }),
            catchError(() => of([]))
        );
    }

    // --- NEW RELEASES (Hybrid) ---
    getNewReleases(country: string = 'US', limit: number = 30): Observable<Song[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) return this.getNewReleasesFromITunes(country, limit);

                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

                return this.http.get<any>(`${this.SPOTIFY_API_URL}/browse/new-releases?country=${country}&limit=50`, { headers }).pipe(
                    switchMap(response => {
                        if (response.albums?.items?.length > 0) {
                            const requests = response.albums.items.slice(0, limit).map((album: any) => {
                                const searchQuery = `${album.artists[0].name} ${album.name}`;
                                const iTunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&entity=song&limit=1&country=${country}`;

                                return this.http.get<any>(iTunesUrl).pipe(
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
                                            };
                                        }
                                        return null;
                                    }),
                                    catchError(() => of(null))
                                );
                            });

                            return forkJoin(requests as Observable<Song | null>[]).pipe(
                                map(songs => {
                                    const valid = songs.filter((s): s is Song => s !== null && s.url !== '');
                                    return valid.length >= 10 ? valid.slice(0, limit) : [];
                                })
                            );
                        }
                        return of([]);
                    }),
                    switchMap(songs => songs.length > 0 ? of(songs) : this.getNewReleasesFromITunes(country, limit))
                );
            })
        );
    }

    private getNewReleasesFromITunes(country: string, limit: number): Observable<Song[]> {
        // Search broader terms to get more candidates, then filter by date locally
        const term = country === 'CO' ? 'Latino' : 'Pop';

        // Request 200 items to ensure we have enough after date filtering
        // Agregamos timestamp para evitar caché
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=200&country=${country}&_t=${Date.now()}`;

        return this.http.get<any>(url).pipe(
            map(res => {
                if (!res.results) return [];
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 7);

                return res.results
                    .filter((t: any) => new Date(t.releaseDate) > sixMonthsAgo)
                    .map((t: any) => this.convertITunesToSong(t))
                    .slice(0, limit);
            }),
            catchError(() => of([]))
        );
    }

    // --- SEARCH (Hybrid) ---
    search(query: string): Observable<Song[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) return this.searchITunes(query);

                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.get<any>(`${this.SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=20`, { headers }).pipe(
                    switchMap(res => {
                        if (res.tracks?.items?.length > 0) {
                            const requests = res.tracks.items.map((track: any) => this.getITunesPreviewForTrack(track, 'US'));
                            return forkJoin(requests as Observable<Song | null>[]).pipe(
                                map(songs => songs.filter((s): s is Song => s !== null && s.url !== ''))
                            );
                        }
                        return of([]);
                    }),
                    switchMap(songs => songs.length > 0 ? of(songs) : this.searchITunes(query))
                );
            })
        );
    }

    private searchITunes(query: string): Observable<Song[]> {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`;
        return this.http.get<any>(url).pipe(
            map(res => res.results ? res.results.map((t: any) => this.convertITunesToSong(t)) : []),
            catchError(() => of([]))
        );
    }

    // --- FEATURED PLAYLISTS (Hybrid) ---
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

    // --- GENRES (Hybrid) ---
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
                if (!token) return this.searchITunes(genre); // Fallback to iTunes search for genre
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.get<any>(`${this.SPOTIFY_API_URL}/recommendations?seed_genres=${genre}&limit=${limit}`, { headers }).pipe(
                    switchMap(res => {
                        if (res.tracks?.length > 0) {
                            const requests = res.tracks.map((track: any) => this.getITunesPreviewForTrack(track, 'US'));
                            return forkJoin(requests as Observable<Song | null>[]).pipe(
                                map(songs => songs.filter((s): s is Song => s !== null && s.url !== ''))
                            );
                        }
                        return of([]);
                    }),
                    switchMap(songs => songs.length > 0 ? of(songs) : this.searchITunes(genre))
                );
            })
        );
    }

    // --- JAMENDO (Free Music) ---
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
        const query = `${spotifyTrack.artists[0].name} ${spotifyTrack.name}`;
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1&country=${country}`;
        return this.http.get<any>(url).pipe(
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
        const artwork = track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '600x600') : 'https://placehold.co/300x300/18181b/10b981?text=Music';
        return {
            id: track.trackId.toString(),
            artistId: 0,
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
            id: track.id,
            artistId: 0,
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
            artistId: 0,
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
        // Limpiar nombres para mejorar la búsqueda
        const cleanArtist = artist.split(',')[0].split('feat')[0].split('ft.')[0].trim();
        const cleanTitle = title.split('(')[0].split('[')[0].split('-')[0].trim();

        // Usar lrclib.net - API más rápida y completa
        const lrclibUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;

        return this.http.get<any>(lrclibUrl).pipe(
            map(res => {
                if (res.plainLyrics) {
                    return res.plainLyrics;
                } else if (res.syncedLyrics) {
                    return res.syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim();
                }
                return '';
            }),
            catchError(() => {
                // Fallback a lyrics.ovh
                const lyricsOvhUrl = `${this.LYRICS_API_URL}/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;
                return this.http.get<any>(lyricsOvhUrl).pipe(
                    map(res => res.lyrics || ''),
                    catchError(() => of(''))
                );
            })
        );
    }

    getStreamUrl(videoId: string): Observable<string | null> {
        // Usar Piped API para obtener el stream de audio directo (m4a)
        // Alternar entre instancias si una falla (simple fallback manual por ahora)
        const pipedInstances = [
            'https://api.piped.private.coffee',
            'https://pipedapi.kavin.rocks'
        ];

        // Intentar con la primera instancia (se podría mejorar con recursividad/retry)
        const baseUrl = pipedInstances[0];

        return this.http.get<any>(`${baseUrl}/streams/${videoId}`).pipe(
            map(res => {
                if (res.audioStreams && res.audioStreams.length > 0) {
                    // Preferir m4a (mejor compatibilidad)
                    const m4aStream = res.audioStreams.find((s: any) => s.format === 'M4A');
                    return m4aStream ? m4aStream.url : res.audioStreams[0].url;
                }
                return null;
            }),
            catchError(err => {
                console.error('Error fetching audio stream from Piped:', err);
                return of(null);
            })
        );
    }

    getBestAudioStream(title: string, artist: string): Observable<string | null> {
        const query = `${artist} - ${title} audio`;
        const pipedInstances = [
            'https://api.piped.private.coffee',
            'https://pipedapi.kavin.rocks'
        ];
        const baseUrl = pipedInstances[0];

        return this.http.get<any>(`${baseUrl}/search?q=${encodeURIComponent(query)}&filter=music_songs`).pipe(
            switchMap(res => {
                if (res.items && res.items.length > 0) {
                    // Tomar el primer resultado (el más relevante)
                    const videoId = res.items[0].url.split('/watch?v=')[1];
                    return this.getStreamUrl(videoId);
                }
                return of(null);
            }),
            catchError(err => {
                console.error('Error finding Piped video:', err);
                return of(null);
            })
        );
    }

    /**
     * Busca artistas en iTunes API
     * Devuelve canciones agrupadas por artista con imágenes
     */
    searchArtistInITunes(artistName: string): Observable<Array<{
        artistId: number;
        artistName: string;
        primaryGenreName: string;
        artworkUrl100: string;
        artworkUrl600?: string;
        trackCount?: number;
    }>> {
        if (!artistName || artistName.trim().length < 2) {
            return of([]);
        }

        // Buscar canciones del artista para obtener imágenes
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&media=music&entity=song&limit=50`;

        return this.http.get<any>(url).pipe(
            map(res => {
                if (!res.results || res.results.length === 0) {
                    return [];
                }

                // Agrupar por artista único
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

                // Convertir a array y ordenar
                return Array.from(artistsMap.values())
                    .sort((a, b) => {
                        const searchLower = artistName.toLowerCase();
                        const aExact = a.artistName.toLowerCase() === searchLower;
                        const bExact = b.artistName.toLowerCase() === searchLower;

                        if (aExact && !bExact) return -1;
                        if (!aExact && bExact) return 1;

                        return (b.trackCount || 0) - (a.trackCount || 0);
                    })
                    .slice(0, 10);
            }),
            catchError(error => {
                console.error('Error searching artist:', error);
                return of([]);
            })
        );
    }

    /**
     * Busca canciones en iTunes
     */
    searchTrack(trackName: string, artistName?: string): Observable<Song[]> {
        const searchTerm = artistName
            ? `${trackName} ${artistName}`
            : trackName;

        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=10`;

        return this.http.get<any>(url).pipe(
            map(res => {
                if (!res.results || res.results.length === 0) {
                    return [];
                }

                return res.results.map((track: any) => this.convertITunesToSong(track));
            }),
            catchError(error => {
                console.error('Error searching track:', error);
                return of([]);
            })
        );
    }

    /**
     * Busca canciones de un artista
     */
    searchTracksByArtist(artistName: string, limit: number = 20): Observable<Song[]> {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&media=music&entity=song&limit=${limit}`;

        return this.http.get<any>(url).pipe(
            map(res => {
                if (!res.results || res.results.length === 0) {
                    return [];
                }

                return res.results.map((track: any) => this.convertITunesToSong(track));
            }),
            catchError(error => {
                console.error('Error searching tracks:', error);
                return of([]);
            })
        );
    }
}
