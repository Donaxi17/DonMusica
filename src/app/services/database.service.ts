import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs, getCountFromServer, setDoc, increment } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from '@angular/fire/storage';
import { Observable, from, map, switchMap, of, shareReplay, tap, catchError, startWith, firstValueFrom } from 'rxjs';

export interface SyncMetadata {
    artistsCount: number;
    songsCount: number;
    lastUpdated: number;
}

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

    private readonly COUNTS_KEY = 'donmusic_cache_counts';
    private readonly SYNC_METADATA_KEY = 'donmusic_sync_metadata';
    private readonly COUNTS_TIMEOUT = 1000 * 60 * 60; // 1 hora de caché para contadores

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

    // Helper to fix dropbox URLs for images
    private fixDropboxUrl(url: string | undefined): string {
        if (!url) return '';
        if (url.includes('dropbox.com')) {
            return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=0', 'dl=1');
        }
        return url;
    }

    // --- ARTISTAS ---

    getArtists(): Observable<Artist[]> {
        const cached = this.getFromLocal(this.ARTISTS_KEY);
        const lastSync = Number(this.getFromLocal('last_sync_artists_ts') || 0);

        return this.getSyncMetadata().pipe(
            switchMap(metadata => {
                const now = Date.now();
                // Si tenemos caché y la metadata dice que no hay cambios desde nuestro lastSync, usamos caché
                // Añadimos un pequeño margen de 5 segundos para evitar bucles de sincronización
                if (cached && cached.length > 0 && metadata.lastUpdated <= lastSync) {
                    return of(cached as Artist[]);
                }

                // Si no hay caché o hay cambios, leemos de Firestore
                const artistsRef = collection(this.firestore, 'artists');
                // Usamos getDocs para una lectura única y ahorrar cuota, 
                // ya que la reactividad la dará el cambio en metadata si alguien más añade datos
                return from(getDocs(artistsRef)).pipe(
                    map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artist))),
                    tap(data => {
                        this.saveToLocal(this.ARTISTS_KEY, data);
                        this.saveToLocal('last_sync_artists_ts', Date.now());
                    }),
                    catchError(err => {
                        console.error('Error fetching artists, falling back to cache:', err);
                        return of(cached ? (cached as Artist[]) : []);
                    })
                );
            }),
            startWith(cached ? (cached as Artist[]) : []),
            // APLICAR FIX GLOBALMENTE (incluso al caché)
            map(artists => artists.map(a => ({
                ...a,
                image: this.fixDropboxUrl(a.image)
            }))),
            shareReplay(1)
        );
    }

    getCollectionCount(collectionName: string): Observable<number> {
        // 1. Intentar obtener de caché local con tiempo de expiración corto para comprobación rápida
        const cachedCounts = this.getFromLocal(this.COUNTS_KEY) || {};
        const now = Date.now();

        // Si tenemos caché y no ha expirado (usamos 10 min para reducir lecturas drásticamente)
        if (cachedCounts[collectionName] && (now - cachedCounts[collectionName].timestamp < 600000)) {
            return of(cachedCounts[collectionName].count);
        }

        // 2. Si no hay caché o expiró, usamos el sistema de sincronización metadata
        // Este observable ya está compartido (shareReplay 1), por lo que múltiples llamadas 
        // a getCollectionCount solo activarán UNA lectura de Firestore para ambos contadores.
        return this.getSyncMetadata().pipe(
            map(metadata => {
                let count = collectionName === 'artists' ? metadata.artistsCount : metadata.songsCount;

                // --- PROTECCIÓN ANTI-CERO ---
                // Si el servidor nos dice que hay 0, pero en el caché anterior teníamos un número alto,
                // ignoramos el 0 (probablemente un error de sync) y mantenemos el valor previo.
                const previousCount = cachedCounts[collectionName]?.count || 0;
                if (count === 0 && previousCount > 0) {
                    console.warn(`Counter for ${collectionName} was reported as 0, but previous was ${previousCount}. Ignoring reset.`);
                    count = previousCount;
                }

                // Actualizar caché de contadores para este nombre de colección
                cachedCounts[collectionName] = { count, timestamp: now };
                this.saveToLocal(this.COUNTS_KEY, cachedCounts);

                return count || 0;
            }),
            catchError(err => {
                console.warn(`Quota or Network error with sync metadata for ${collectionName}, using cache:`, err);
                // Si la metadata falla (ej. Quota 429), JAMÁS llamamos a getCountFromServer (que también fallará)
                // En su lugar, devolvemos lo que tengamos en caché o 0 como último recurso
                const lastKnown = cachedCounts[collectionName]?.count;
                if (lastKnown !== undefined) return of(lastKnown);

                // Fallback a contar lo que hay en el cache local de la colección
                const cacheKey = collectionName === 'artists' ? this.ARTISTS_KEY : this.SONGS_KEY;
                const cachedData = this.getFromLocal(cacheKey);
                return of(cachedData ? cachedData.length : 0);
            })
        );
    }

    /**
     * Obtiene los metadatos de sincronización globales.
     * Si no existen, intenta crearlos (primer uso).
     */
    getSyncMetadata(): Observable<SyncMetadata> {
        const syncRef = doc(this.firestore, 'metadata', 'sync');
        return docData(syncRef).pipe(
            switchMap(data => {
                if (!data) {
                    // Si no existe el documento de sync, lo inicializamos calculando los contadores reales
                    return from(this.refreshAndGetMetadata());
                }
                return of(data as SyncMetadata);
            }),
            tap(metadata => this.saveToLocal(this.SYNC_METADATA_KEY, metadata)),
            startWith(this.getFromLocal(this.SYNC_METADATA_KEY) as SyncMetadata),
            shareReplay(1)
        );
    }

    /**
     * Recalcula los contadores y actualiza el documento de sincronización.
     * Útil para cuando se añaden datos o para el primer inicio.
     */
    async refreshAndGetMetadata(): Promise<SyncMetadata> {
        try {
            const artistsRef = collection(this.firestore, 'artists');
            const songsRef = collection(this.firestore, 'songs');

            const [artistsSnap, songsSnap] = await Promise.all([
                getCountFromServer(artistsRef),
                getCountFromServer(songsRef)
            ]);

            const newArtistsCount = artistsSnap.data().count;
            const newSongsCount = songsSnap.data().count;

            // --- SANITY CHECK ---
            // Si el conteo del servidor da 0 pero en local sabemos que tenemos más,
            // probablemente sea un error temporal de Firestore. No sobreescribimos con 0.
            const currentMetadata = this.getFromLocal(this.SYNC_METADATA_KEY) as SyncMetadata;

            const metadata: SyncMetadata = {
                artistsCount: (newArtistsCount === 0 && currentMetadata?.artistsCount > 0) ? currentMetadata.artistsCount : newArtistsCount,
                songsCount: (newSongsCount === 0 && currentMetadata?.songsCount > 0) ? currentMetadata.songsCount : newSongsCount,
                lastUpdated: Date.now()
            };

            // Intentar persistir en Firestore solo si los datos son plausibles
            const syncRef = doc(this.firestore, 'metadata', 'sync');
            try {
                // Usamos set con merge para evitar borrar campos si existen otros
                await setDoc(syncRef, { ...metadata }, { merge: true });
            } catch (e) {
                console.warn('Metadata sync document set failed:', e);
            }

            this.saveToLocal(this.SYNC_METADATA_KEY, metadata);
            return metadata;
        } catch (error) {
            console.error('Error refreshing metadata, keeping last known:', error);
            return this.getFromLocal(this.SYNC_METADATA_KEY) as SyncMetadata || {
                artistsCount: 0,
                songsCount: 0,
                lastUpdated: Date.now()
            };
        }
    }

    async updateSyncMetadata(changes: Partial<SyncMetadata>): Promise<void> {
        const syncRef = doc(this.firestore, 'metadata', 'sync');
        const current = this.getFromLocal(this.SYNC_METADATA_KEY) || await firstValueFrom(this.getSyncMetadata());

        const updated = {
            ...current,
            ...changes,
            lastUpdated: Date.now()
        };

        try {
            await updateDoc(syncRef, updated);
            this.saveToLocal(this.SYNC_METADATA_KEY, updated);
        } catch (e) {
            console.error('Error updating sync metadata:', e);
        }
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
        const cached = this.getFromLocal(this.SONGS_KEY);
        const lastSync = Number(this.getFromLocal('last_sync_songs_ts') || 0);

        return this.getSyncMetadata().pipe(
            switchMap(metadata => {
                // Similar a artistas: solo leer si hay cambios reales según metadata
                if (cached && cached.length > 0 && metadata.lastUpdated <= lastSync) {
                    return of(cached as Song[]);
                }

                const songsRef = collection(this.firestore, 'songs');
                return from(getDocs(songsRef)).pipe(
                    map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song))),
                    tap(data => {
                        this.saveToLocal(this.SONGS_KEY, data);
                        this.saveToLocal('last_sync_songs_ts', Date.now());
                    }),
                    catchError(err => {
                        console.error('Error fetching songs, falling back to cache:', err);
                        return of(cached ? (cached as Song[]) : []);
                    })
                );
            }),
            startWith(cached ? (cached as Song[]) : []),
            // APLICAR FIX GLOBALMENTE (incluso al caché)
            map(songs => songs.map(s => ({
                ...s,
                img: this.fixDropboxUrl(s.img)
            }))),
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
            map(data => {
                return (data as Song[]).map(song => ({
                    ...song,
                    img: this.fixDropboxUrl(song.img) // Fix Dropbox URL
                }));
            }),
            catchError(err => {
                console.error('Error fetching latest songs:', err);
                const cached = this.getFromLocal(this.SONGS_KEY);
                // También aplicar fix al caché aquí
                const safeCached = (cached || []).map((s: Song) => ({ ...s, img: this.fixDropboxUrl(s.img) }));
                return of(safeCached.slice(0, limitCount) as Song[]);
            })
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

        // Invalidar caché de contadores local
        const cachedCounts = this.getFromLocal(this.COUNTS_KEY) || {};
        delete cachedCounts['songs'];
        this.saveToLocal(this.COUNTS_KEY, cachedCounts);

        // Actualizar metadata global de forma atómica
        const syncRef = doc(this.firestore, 'metadata', 'sync');
        updateDoc(syncRef, {
            songsCount: increment(1),
            lastUpdated: Date.now()
        }).catch(err => {
            console.warn('Error incrementing songsCount, document might not exist. Initializing...');
            // Si el documento no existe, lo creamos con 1 en lugar de forzar refresh (que puede dar 0)
            setDoc(syncRef, {
                songsCount: 1,
                artistsCount: this.getFromLocal(this.ARTISTS_KEY)?.length || 0,
                lastUpdated: Date.now()
            }, { merge: true });
        });

        return addDoc(songsRef, songWithDate);
    }

    // Crea un nuevo artista en Firestore
    async addArtist(artist: Artist): Promise<any> {
        this.refreshData(); // Limpiar caché para forzar recarga
        const artistsRef = collection(this.firestore, 'artists');
        const artistWithDate = { ...artist, createdAt: Date.now() };

        // Invalidar caché de contadores local
        const cachedCounts = this.getFromLocal(this.COUNTS_KEY) || {};
        delete cachedCounts['artists'];
        this.saveToLocal(this.COUNTS_KEY, cachedCounts);

        // Actualizar metadata global de forma atómica
        const syncRef = doc(this.firestore, 'metadata', 'sync');
        updateDoc(syncRef, {
            artistsCount: increment(1),
            lastUpdated: Date.now()
        }).catch(err => {
            console.warn('Error incrementing artistsCount, document might not exist. Initializing...');
            setDoc(syncRef, {
                artistsCount: 1,
                songsCount: this.getFromLocal(this.SONGS_KEY)?.length || 0,
                lastUpdated: Date.now()
            }, { merge: true });
        });

        return addDoc(artistsRef, artistWithDate);
    }

    async updateArtist(id: string, data: Partial<Artist>): Promise<void> {
        const artistRef = doc(this.firestore, `artists/${id}`);
        await updateDoc(artistRef, data);
        // Notificar cambio en los metadatos globales
        this.updateSyncMetadata({}).catch(() => { });
    }

    async updateSong(id: string, data: Partial<Song>): Promise<void> {
        const songRef = doc(this.firestore, `songs/${id}`);
        await updateDoc(songRef, data);
        // Notificar cambio en los metadatos globales
        this.updateSyncMetadata({}).catch(() => { });
    }

    // Limpiar caché manualmente si es necesario
    refreshData() {
        this.artistsCache$ = null;
        this.songsCache$ = null;
        if (this.isBrowser()) {
            localStorage.removeItem(this.ARTISTS_KEY);
            localStorage.removeItem(this.SONGS_KEY);
            localStorage.removeItem(this.COUNTS_KEY);
        }
    }
}
