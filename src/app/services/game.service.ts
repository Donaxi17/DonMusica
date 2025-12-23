import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, forkJoin } from 'rxjs';

export type GameCategory = 'singers' | 'soccer' | 'food' | 'cities' | 'tv' | 'random';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private http = inject(HttpClient);

    private readonly WIKIPEDIA_API = 'https://es.wikipedia.org/w/api.php';
    private readonly ITUNES_RSS = 'https://itunes.apple.com/co/rss/topsongs/limit=100/json';

    /**
     * Obtiene una lista de elementos para el juego de forma 100% dinámica.
     * Filtrado estrictamente para que sea SOLO UNA PALABRA.
     */
    getFamousPool(category: GameCategory): Observable<string[]> {
        switch (category) {
            case 'singers':
                return this.getColombianArtists();
            case 'soccer':
                return this.getFamousFromWikipedia('Lista de futbolistas de Colombia');
            case 'food':
                // Query más específico para evitar departamentos/regiones
                return this.getFamousFromWikipedia('Platos típicos de Colombia comida');
            case 'cities':
                return this.getFamousFromWikipedia('Principales municipios de Colombia');
            case 'tv':
                return this.getFamousFromWikipedia('Telenovelas famosas');
            case 'random':
                return forkJoin([
                    this.getColombianArtists(),
                    this.getFamousFromWikipedia('Animales de Colombia'),
                    this.getFamousFromWikipedia('Objetos comunes')
                ]).pipe(
                    map(([a, b, c]) => [...a, ...b, ...c].sort(() => Math.random() - 0.5)),
                    catchError(() => of([]))
                );
            default:
                return of([]);
        }
    }

    /**
     * Obtiene una palabra común 100% dinámica de una sola palabra.
     */
    getGameWord(): Observable<string> {
        const topics = [
            'Animales',
            'Frutas',
            'Objetos',
            'Colores'
        ];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];

        return this.getFamousFromWikipedia(randomTopic).pipe(
            map(list => {
                const filtered = list?.filter(w => w.length > 3) || [];
                return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : 'Musica';
            }),
            catchError(() => of('Cantar'))
        );
    }

    private getColombianArtists(): Observable<string[]> {
        return this.http.get<any>(this.ITUNES_RSS).pipe(
            map(res => {
                const entries = res.feed?.entry || [];
                const artists = entries.map((e: any) => {
                    const name = e['im:artist']?.label || '';
                    // Si el artista tiene varias palabras (ej. "Karol G"), intentamos quedarnos con la principal si el usuario quiere solo una palabra
                    // Pero en artistas es mejor filtrar por los que tienen un solo nombre artístico para no romper la identidad
                    return name.trim();
                }).filter((a: string) => a.length > 2 && a.split(' ').length === 1); // Solo artistas de una palabra (ej: Feid, Shakira, Maluma)

                return [...new Set(artists)] as string[];
            }),
            catchError(() => of(['Shakira', 'Feid', 'Maluma']))
        );
    }

    private getFamousFromWikipedia(query: string): Observable<string[]> {
        const url = `${this.WIKIPEDIA_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=50`;

        return this.http.get<any>(url).pipe(
            map(res => {
                const searchResults = res.query?.search || [];
                return searchResults.map((s: any) => {
                    let title = s.title;
                    // Limpieza total: quitar paréntesis, anexos y dejar solo la palabra base
                    title = title.replace(/Anexo:/i, '').split('(')[0].trim();
                    return title;
                }).filter((t: string) =>
                    t.length > 2 &&
                    t.split(' ').length === 1 && // REGLA DE ORO: SOLO UNA PALABRA
                    !t.toLowerCase().includes('lista') &&
                    !t.toLowerCase().includes('anexo') &&
                    !t.toLowerCase().includes('categoría') &&
                    !t.toLowerCase().includes('portal')
                );
            }),
            catchError(() => of([]))
        );
    }
}
