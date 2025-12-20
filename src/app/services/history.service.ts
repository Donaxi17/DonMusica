import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface HistoryItem {
    id: string;
    title: string;
    artist: string;
    img: string;
    url?: string;
    timestamp: number;
    type: 'video' | 'audio';
    playbackContext?: string; // Track where it was played from
    artistId?: string | number;
}

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private readonly STORAGE_KEY = 'donmusic_history';
    private historySubject = new BehaviorSubject<HistoryItem[]>([]);
    public history$ = this.historySubject.asObservable();

    constructor() {
        this.loadHistory();
    }

    private loadHistory() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                try {
                    this.historySubject.next(JSON.parse(saved));
                } catch (e) {
                    console.error('Error loading history', e);
                }
            }
        }
    }

    addToHistory(song: any, context?: string) {
        if (!song || !song.title) return;

        const newItem: HistoryItem = {
            id: String(song.id || song.videoId || Date.now()),
            title: song.title,
            artist: song.artist || 'Desconocido',
            img: song.img || song.thumbnail || 'assets/icons/icon-512x512.png',
            url: song.url || '',
            timestamp: Date.now(),
            type: song.videoId ? 'video' : 'audio',
            playbackContext: context || 'unknown',
            artistId: song.artistId || song.artistID
        };

        let current = this.historySubject.value;
        current = current.filter(item =>
            item.id !== newItem.id &&
            !(item.title === newItem.title && item.artist === newItem.artist)
        );
        current.unshift(newItem);
        if (current.length > 30) current = current.slice(0, 30);

        this.historySubject.next(current);
        this.saveHistory(current);
    }

    removeFromHistory(id: string) {
        const current = this.historySubject.value.filter(item => item.id !== id);
        this.historySubject.next(current);
        this.saveHistory(current);
    }

    private saveHistory(history: HistoryItem[]) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
        }
    }

    clearHistory() {
        this.historySubject.next([]);
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
