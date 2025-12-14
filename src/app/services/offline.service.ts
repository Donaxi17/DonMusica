import { Injectable, signal, inject } from '@angular/core';
import { Song } from './playlist.service';
import { DonMusicaProService } from './don-musica-pro.service';

export interface OfflineSong extends Song {
    downloadedAt: number;
    audioBlob?: Blob;
    imageBlob?: Blob;
    audioUrl?: string;
    imageUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class OfflineService {
    private readonly DB_NAME = 'DonMusicaOfflineDB';
    private readonly DB_VERSION = 1;
    private readonly STORE_NAME = 'offlineSongs';
    private db: IDBDatabase | null = null;
    private proService = inject(DonMusicaProService);

    offlineSongs = signal<OfflineSong[]>([]);
    downloadProgress = signal<{ [songId: string]: number }>({});
    isDownloading = signal<{ [songId: string]: boolean }>({});

    constructor() {
        this.initDB();
        this.loadOfflineSongs();
    }

    private async initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const objectStore = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                    objectStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
                }
            };
        });
    }

    async downloadSong(song: Song): Promise<boolean> {
        // Check Pro Limits
        if (!this.proService.canDownloadSong(this.offlineSongs().length)) {
            alert('¡Límite de descargas alcanzado! Actualiza a DonMusica PRO para descargas ilimitadas.');
            return false;
        }

        if (!this.db) {
            await this.initDB();
        }

        if (this.isDownloading()[song.id]) {
            return false;
        }

        this.isDownloading.update(state => ({ ...state, [song.id]: true }));
        this.downloadProgress.update(state => ({ ...state, [song.id]: 0 }));

        try {
            // Descargar audio
            const audioBlob = await this.downloadFile(song.url, (progress) => {
                this.downloadProgress.update(state => ({ ...state, [song.id]: progress * 0.7 }));
            });

            // Descargar imagen
            const imageBlob = await this.downloadFile(song.img, (progress) => {
                this.downloadProgress.update(state => ({ ...state, [song.id]: 70 + (progress * 0.3) }));
            });

            // Guardar en IndexedDB
            const offlineSong: OfflineSong = {
                ...song,
                downloadedAt: Date.now(),
                audioBlob,
                imageBlob
            };

            await this.saveToDB(offlineSong);
            await this.loadOfflineSongs();

            this.downloadProgress.update(state => ({ ...state, [song.id]: 100 }));

            // Limpiar después de 2 segundos
            setTimeout(() => {
                this.downloadProgress.update(state => {
                    const newState = { ...state };
                    delete newState[song.id];
                    return newState;
                });
            }, 2000);

            return true;
        } catch (error) {
            console.error('Error downloading song:', error);
            return false;
        } finally {
            this.isDownloading.update(state => ({ ...state, [song.id]: false }));
        }
    }

    async getItunesArtwork(title: string, artist: string): Promise<string | null> {
        try {
            // Clean up search terms
            const cleanTitle = title.toLowerCase().trim();
            const cleanArtist = artist.toLowerCase().trim();

            const searchTerm = encodeURIComponent(`${title} ${artist}`);
            const response = await fetch(`https://itunes.apple.com/search?term=${searchTerm}&media=music&entity=song&limit=5`);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                // Find the best match by comparing title and artist
                let bestMatch = null;
                let bestScore = 0;

                for (const track of data.results) {
                    const trackTitle = (track.trackName || '').toLowerCase();
                    const trackArtist = (track.artistName || '').toLowerCase();

                    // Calculate similarity score
                    let score = 0;

                    // Exact title match
                    if (trackTitle === cleanTitle) {
                        score += 10;
                    } else if (trackTitle.includes(cleanTitle) || cleanTitle.includes(trackTitle)) {
                        score += 5;
                    }

                    // Exact artist match
                    if (trackArtist === cleanArtist) {
                        score += 10;
                    } else if (trackArtist.includes(cleanArtist) || cleanArtist.includes(trackArtist)) {
                        score += 5;
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = track;
                    }
                }

                // Only return if we have a reasonable match (score >= 10)
                if (bestMatch && bestScore >= 10) {
                    // Get high quality artwork (600x600)
                    return bestMatch.artworkUrl100?.replace('100x100', '600x600') || bestMatch.artworkUrl100 || null;
                }
            }

            return null;
        } catch (error) {
            console.error('iTunes artwork search error:', error);
            return null;
        }
    }

    private async downloadFile(url: string, onProgress?: (progress: number) => void): Promise<Blob> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to download: ${response.statusText}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;

        const reader = response.body?.getReader();
        const chunks: Uint8Array[] = [];

        if (!reader) {
            throw new Error('No reader available');
        }

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            chunks.push(value);
            loaded += value.length;

            if (onProgress && total > 0) {
                onProgress((loaded / total) * 100);
            }
        }

        const blob = new Blob(chunks as BlobPart[]);
        return blob;
    }

    private async saveToDB(song: OfflineSong): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(song);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async loadOfflineSongs(): Promise<void> {
        if (!this.db) {
            await this.initDB();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const songs = request.result as OfflineSong[];

                // Crear URLs de objeto para los blobs
                songs.forEach(song => {
                    if (song.audioBlob) {
                        song.audioUrl = URL.createObjectURL(song.audioBlob);
                    }
                    if (song.imageBlob) {
                        song.imageUrl = URL.createObjectURL(song.imageBlob);
                    }
                });

                this.offlineSongs.set(songs);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteSong(songId: string): Promise<boolean> {
        if (!this.db) {
            await this.initDB();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(songId);

            request.onsuccess = async () => {
                await this.loadOfflineSongs();
                resolve(true);
            };
            request.onerror = () => reject(request.error);
        });
    }

    isOffline(songId: string): boolean {
        return this.offlineSongs().some(s => s.id === songId);
    }

    getOfflineSong(songId: string): OfflineSong | undefined {
        return this.offlineSongs().find(s => s.id === songId);
    }

    async clearAll(): Promise<void> {
        if (!this.db) {
            await this.initDB();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.clear();

            request.onsuccess = async () => {
                await this.loadOfflineSongs();
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    getTotalSize(): number {
        let total = 0;
        this.offlineSongs().forEach(song => {
            if (song.audioBlob) total += song.audioBlob.size;
            if (song.imageBlob) total += song.imageBlob.size;
        });
        return total;
    }

    formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
}
