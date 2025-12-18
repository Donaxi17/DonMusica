import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ItunesService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://itunes.apple.com/search';

    /**
     * Busca un artista en iTunes y devuelve su imagen de alta calidad
     * @param artistName Nombre del artista a buscar
     */
    getArtistImage(artistName: string): Observable<string | null> {
        if (!artistName) return of(null);

        const term = encodeURIComponent(artistName);
        const url = `${this.API_URL}?term=${term}&entity=musicArtist&limit=1`;

        return this.http.jsonp<any>(url, 'callback').pipe(
            map(response => {
                if (response.results && response.results.length > 0) {
                    // iTunes no suele devolver la imagen del artista directamente en 'musicArtist' siempre,
                    // a veces es mejor buscar un álbum (musicTrack o album) para asegurar artowrk.
                    // Pero intentaremos primero con el artista.
                    // Nota: La API de búsqueda de artistas de iTunes a veces no da 'artworkUrl100'.
                    // Estrategia alternativa: Buscar in 'album' del artista.
                    return null; // Pasamos al siguiente paso en la cadena si falla
                }
                return null;
            }),
            catchError(() => of(null))
        );
    }

    /**
     * Estrategia robusta: Busca el "Top Album" del artista para sacar su foto
     */
    getArtistImageBestEffort(artistName: string): Observable<string> {
        const term = encodeURIComponent(artistName);
        // Buscamos albumes del artista, ordenados por relevancia
        const url = `${this.API_URL}?term=${term}&media=music&entity=album&limit=1`;

        return this.http.jsonp<any>(url, 'callback').pipe(
            map(response => {
                if (response.results && response.results.length > 0) {
                    const artwork = response.results[0].artworkUrl100;
                    // Truco: Reemplazar '100x100' por '600x600' para HD
                    return artwork.replace('100x100bb', '600x600bb');
                }
                return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Fallback
            }),
            catchError(err => {
                console.warn(`Error fetching image for ${artistName}`, err);
                return of('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
            })
        );
    }
    /**
     * Busca la portada de una canción específica
     */
    getSongImage(artistName: string, songTitle: string): Observable<string | null> {
        const term = encodeURIComponent(`${artistName} ${songTitle}`);
        const url = `${this.API_URL}?term=${term}&media=music&entity=song&limit=1`;

        return this.http.jsonp<any>(url, 'callback').pipe(
            map(response => {
                if (response.results && response.results.length > 0) {
                    const artwork = response.results[0].artworkUrl100;
                    return artwork.replace('100x100bb', '600x600bb');
                }
                return null;
            }),
            catchError(() => of(null))
        );
    }
}
