import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RadioService {
    private apiUrl = 'https://de1.api.radio-browser.info/json/stations';

    constructor(private http: HttpClient) { }

    getTopStations(limit: number = 20): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/topclick/${limit}`);
    }

    searchStations(tag: string, limit: number = 20): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/search?limit=${limit}&order=clickcount&reverse=true&tag=${tag}`);
    }

    // Favorites Logic
    private favoritesKey = 'donmusic_radio_favorites';

    getFavorites(): any[] {
        const stored = localStorage.getItem(this.favoritesKey);
        return stored ? JSON.parse(stored) : [];
    }

    isFavorite(station: any): boolean {
        const favorites = this.getFavorites();
        return favorites.some((fav: any) => fav.stationuuid === station.stationuuid);
    }

    toggleFavorite(station: any): void {
        const favorites = this.getFavorites();
        const index = favorites.findIndex((fav: any) => fav.stationuuid === station.stationuuid);

        if (index === -1) {
            favorites.push(station);
        } else {
            favorites.splice(index, 1);
        }

        localStorage.setItem(this.favoritesKey, JSON.stringify(favorites));
    }
}
