import { Injectable } from '@angular/core';
import { DonMusicaProService } from './don-musica-pro.service';

export interface SavedLyric {
    id: string;
    title: string;
    artist: string;
    content: string;
    savedAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class LyricsService {
    private readonly STORAGE_KEY = 'donmusic_saved_lyrics';

    constructor(private proService: DonMusicaProService) { }

    getSavedLyrics(): SavedLyric[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const lyrics = data ? JSON.parse(data) : [];
            return lyrics;
        } catch (error) {
            console.error('Error al cargar letras:', error);
            return [];
        }
    }

    getLimitInfo() {
        const current = this.getSavedLyrics().length;
        const limit = this.proService.LIMITS.LYRICS.FREE;
        const isPro = this.proService.isPro();

        return {
            current: current,
            max: limit,
            isPro: isPro,
            remaining: isPro ? -1 : Math.max(0, limit - current),
            percentUsed: isPro ? 0 : Math.min(100, (current / limit) * 100)
        };
    }

    saveLyric(title: string, artist: string, content: string): boolean {
        try {
            const lyrics = this.getSavedLyrics();

            // Check Limits via ProService
            if (!this.proService.canSaveLyric(lyrics.length)) {
                return false;
            }

            // Check if already saved
            const exists = lyrics.some(l => l.title === title && l.artist === artist);
            if (exists) {
                // console.log('Letra ya existe:', title, artist);
                return true;
            }

            const newLyric: SavedLyric = {
                id: Date.now().toString(),
                title,
                artist,
                content,
                savedAt: new Date()
            };

            lyrics.unshift(newLyric);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lyrics));
            // console.log('Letra guardada exitosamente:', title, artist);
            return true;
        } catch (error) {
            console.error('Error al guardar letra:', error);
            return false;
        }
    }

    deleteLyric(id: string): void {
        let lyrics = this.getSavedLyrics();
        lyrics = lyrics.filter(l => l.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lyrics));
    }

    isSaved(title: string, artist: string): boolean {
        const lyrics = this.getSavedLyrics();
        return lyrics.some(l => l.title === title && l.artist === artist);
    }
}
