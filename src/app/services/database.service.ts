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
}

export interface Song {
    id?: string;
    title: string;
    artist: string;
    url: string; // URL del archivo mp3 en Storage
    img: string; // URL de la imagen en Storage
    duration?: string;
    album?: string;
    genre?: string;
    year?: number;
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
        if (this.artistsCache$) return this.artistsCache$;

        const localData = this.getFromLocal(this.ARTISTS_KEY);
        const artistsRef = collection(this.firestore, 'artists');

        const firebaseObs = collectionData(artistsRef, { idField: 'id' }).pipe(
            map(data => data as Artist[]),
            tap(data => this.saveToLocal(this.ARTISTS_KEY, data))
        );

        this.artistsCache$ = (localData ? firebaseObs.pipe(startWith(localData)) : firebaseObs).pipe(
            shareReplay(1)
        );

        return this.artistsCache$;
    }

    getArtist(id: string): Observable<Artist> {
        // Optimización: Si ya tenemos la caché (local o memoria), lo buscamos ahí directamente
        return this.getArtists().pipe(
            map(artists => {
                const found = artists.find(a => a.id === id);
                if (!found) throw new Error('Artist not found');
                return found;
            }),
            catchError(() => {
                // Si no está en la caché por alguna razón, ir a Firebase directo
                const artistDocRef = doc(this.firestore, `artists/${id}`);
                return docData(artistDocRef, { idField: 'id' }) as Observable<Artist>;
            })
        );
    }

    // --- CANCIONES ---

    getSongs(): Observable<Song[]> {
        if (this.songsCache$) return this.songsCache$;

        const localData = this.getFromLocal(this.SONGS_KEY);
        const songsRef = collection(this.firestore, 'songs');
        const q = query(songsRef, orderBy('title'));

        const firebaseObs = collectionData(q, { idField: 'id' }).pipe(
            map(data => data as Song[]),
            tap(data => this.saveToLocal(this.SONGS_KEY, data))
        );

        this.songsCache$ = (localData ? firebaseObs.pipe(startWith(localData)) : firebaseObs).pipe(
            shareReplay(1)
        );

        return this.songsCache$;
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

    // --- SUBIDA DE ARCHIVOS ---

    async uploadFile(path: string, file: File): Promise<string> {
        const storageRef = ref(this.storage, path);
        const result = await uploadBytes(storageRef, file);
        return await getDownloadURL(result.ref);
    }

    // Crea una nueva canción en Firestore
    async addSong(song: Song): Promise<any> {
        const songsRef = collection(this.firestore, 'songs');
        return addDoc(songsRef, song);
    }

    // Crea un nuevo artista en Firestore
    async addArtist(artist: Artist): Promise<any> {
        const artistsRef = collection(this.firestore, 'artists');
        return addDoc(artistsRef, artist);
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
