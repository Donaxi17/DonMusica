import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from '@angular/fire/storage';
import { Observable, from, map, switchMap, of, shareReplay, tap, catchError, startWith } from 'rxjs';

export interface Artist {
    id?: string;
    name: string;
    image: string;
    bio?: string;
    genre?: string; // Agregado para compatibilidad
    songs?: Song[];
    createdAt?: any;
}

export interface Song {
    id?: string;
    artistId?: string | number;
    title: string;
    artist: string;
    url: string; // URL del archivo mp3 en Storage
    img?: string; // URL de la imagen en Storage
    duration?: string;
    album?: string;
    genre?: string;
    year?: number;
    createdAt?: any;
}

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    private firestore: Firestore = inject(Firestore);
    private storage: Storage = inject(Storage);
    private platformId = inject(PLATFORM_ID);

    // --- KEYS PARA PERSISTENCIA ---
    private readonly ARTISTS_KEY = 'donmusic_cache_artists';
    private readonly SONGS_KEY = 'donmusic_cache_songs';

    // --- CACHE EN MEMORIA ---
    private artistsCache$: Observable<Artist[]> | null = null;
    private songsCache$: Observable<Song[]> | null = null;

    constructor() { }

    private isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    private saveToLocal(key: string, data: any) {
        if (this.isBrowser()) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.warn('Error saving to LocalStorage', e);
            }
        }
    }

    private getFromLocal(key: string): any | null {
        if (this.isBrowser()) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // --- ARTISTAS ---

    getArtists(): Observable<Artist[]> {
        const artistsRef = collection(this.firestore, 'artists');
        return collectionData(artistsRef, { idField: 'id' }).pipe(
            map(data => data as Artist[]),
            tap(data => this.saveToLocal(this.ARTISTS_KEY, data)),
            shareReplay(1)
        );
    }

    getArtist(id: string): Observable<Artist> {
        return this.getArtists().pipe(
            map(artists => {
                const found = artists.find(a => a.id === id);
                if (!found) throw new Error('Artist not found');
                return found;
            })
        );
    }

    // --- CANCIONES ---

    getSongs(): Observable<Song[]> {
        const songsRef = collection(this.firestore, 'songs');
        return collectionData(songsRef, { idField: 'id' }).pipe(
            map(data => data as Song[]),
            tap(data => this.saveToLocal(this.SONGS_KEY, data)),
            shareReplay(1)
        );
    }

    getSongsByArtist(artistName: string): Observable<Song[]> {
        const normalize = (s: string) => s.toLowerCase().trim();
        const search = normalize(artistName);

        return this.getSongs().pipe(
            map(songs => songs.filter(s =>
                s.artist && (normalize(s.artist) === search || normalize(s.artist).includes(search))
            ))
        );
    }

    getLatestSongs(limitCount: number = 6): Observable<Song[]> {
        const songsRef = collection(this.firestore, 'songs');
        const latestQuery = query(
            songsRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        return collectionData(latestQuery, { idField: 'id' }).pipe(
            map(data => data as Song[])
        );
    }

    // --- SUBIDA DE ARCHIVOS ---

    async uploadFile(path: string, file: File): Promise<string> {
        const storageRef = ref(this.storage, path);
        const result = await uploadBytes(storageRef, file);
        return await getDownloadURL(result.ref);
    }

    // Crea una nueva canción en Firestore
    async addSong(song: Song): Promise<any> {
        this.refreshData(); // Limpiar caché para forzar recarga
        const songsRef = collection(this.firestore, 'songs');
        const songWithDate = { ...song, createdAt: Date.now() };
        return addDoc(songsRef, songWithDate);
    }

    // Crea un nuevo artista en Firestore
    async addArtist(artist: Artist): Promise<any> {
        this.refreshData(); // Limpiar caché para forzar recarga
        const artistsRef = collection(this.firestore, 'artists');
        const artistWithDate = { ...artist, createdAt: Date.now() };
        return addDoc(artistsRef, artistWithDate);
    }

    async updateArtist(id: string, data: Partial<Artist>): Promise<void> {
        const artistRef = doc(this.firestore, `artists/${id}`);
        return updateDoc(artistRef, data);
    }

    async updateSong(id: string, data: Partial<Song>): Promise<void> {
        const songRef = doc(this.firestore, `songs/${id}`);
        return updateDoc(songRef, data);
    }

    // Limpiar caché manualmente si es necesario
    refreshData() {
        this.artistsCache$ = null;
        this.songsCache$ = null;
        if (this.isBrowser()) {
            localStorage.removeItem(this.ARTISTS_KEY);
            localStorage.removeItem(this.SONGS_KEY);
        }
    }
}
