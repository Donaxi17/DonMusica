import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from '@angular/fire/storage';
import { Observable, from, map, switchMap } from 'rxjs';

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

    constructor() { }

    // --- ARTISTAS ---

    getArtists(): Observable<Artist[]> {
        const artistsRef = collection(this.firestore, 'artists');
        return collectionData(artistsRef, { idField: 'id' }) as Observable<Artist[]>;
    }

    getArtist(id: string): Observable<Artist> {
        const artistDocRef = doc(this.firestore, `artists/${id}`);
        return docData(artistDocRef, { idField: 'id' }) as Observable<Artist>;
    }

    // --- CANCIONES ---

    getSongs(): Observable<Song[]> {
        const songsRef = collection(this.firestore, 'songs');
        // Ordenar por fecha de creación si tuvieras ese campo, o por título
        const q = query(songsRef, orderBy('title'));
        return collectionData(q, { idField: 'id' }) as Observable<Song[]>;
    }

    getSongsByArtist(artistName: string): Observable<Song[]> {
        const songsRef = collection(this.firestore, 'songs');
        const q = query(songsRef, where('artist', '==', artistName));
        return collectionData(q, { idField: 'id' }) as Observable<Song[]>;
    }

    // --- SUBIDA DE ARCHIVOS (Para uso futuro en un panel de admin) ---

    // Sube un archivo a Storage y devuelve la URL de descarga
    async uploadFile(path: string, file: File): Promise<string> {
        const storageRef = ref(this.storage, path);
        const result = await uploadBytes(storageRef, file);
        return await getDownloadURL(result.ref);
    }

    // Crea una nueva canción en Firestore
    addSong(song: Song): Promise<any> {
        const songsRef = collection(this.firestore, 'songs');
        return addDoc(songsRef, song);
    }

    // Crea un nuevo artista en Firestore
    addArtist(artist: Artist): Promise<any> {
        const artistsRef = collection(this.firestore, 'artists');
        return addDoc(artistsRef, artist);
    }
}
