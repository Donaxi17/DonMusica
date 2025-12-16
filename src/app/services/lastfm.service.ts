import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface LastFmArtistInfo {
    bio: {
        summary: string;
        content: string;
    };
    stats: {
        listeners: string;
        playcount: string;
    };
    tags: {
        tag: { name: string; url: string }[];
    };
    similar: {
        artist: { name: string; image: object[] }[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class LastFmService {
    private apiKey = 'd4091d3ee96fa8a6b0b75bb32f9a1069';
    private baseUrl = 'https://ws.audioscrobbler.com/2.0/';

    constructor(private http: HttpClient) { }

    setApiKey(key: string) {
        this.apiKey = key;
    }

    getArtistInfo(artistName: string): Observable<LastFmArtistInfo | null> {
        if (!this.apiKey) {
            console.warn('Last.fm API Key not set');
            return of(null);
        }

        const url = `${this.baseUrl}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${this.apiKey}&format=json&lang=es`;

        return this.http.get<any>(url).pipe(
            map(response => {
                if (response.error || !response.artist) {
                    return null;
                }
                return response.artist as LastFmArtistInfo;
            }),
            catchError(error => {
                console.error('Error fetching Last.fm artist info:', error);
                return of(null);
            })
        );
    }
}
