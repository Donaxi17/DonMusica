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
}
