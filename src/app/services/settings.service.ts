import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private readonly STORAGE_KEY = 'donmusic_settings';

    dataSaver = signal<boolean>(false);

    constructor() {
        // Load from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                try {
                    const settings = JSON.parse(saved);
                    this.dataSaver.set(!!settings.dataSaver);
                } catch (e) {
                    console.warn('Error loading settings', e);
                }
            }

            // Save to localStorage when it changes
            effect(() => {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                    dataSaver: this.dataSaver()
                }));
            });
        }
    }

    toggleDataSaver() {
        this.dataSaver.update(v => !v);
    }
}
