import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private readonly STORAGE_KEY = 'donmusic_settings';

    dataSaver = signal<boolean>(false);
    selectedRegion = signal<'CO' | 'US' | 'MX'>('CO');

    constructor() {
        // Load from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                try {
                    const settings = JSON.parse(saved);
                    // console.log('SettingsService: Loading settings', settings);
                    this.dataSaver.set(!!settings.dataSaver);

                    // User requested default to Colombia on reload, so we skip loading region from storage
                    // if (settings.selectedRegion) {
                    //     console.log('SettingsService: Setting region from storage', settings.selectedRegion);
                    //     this.selectedRegion.set(settings.selectedRegion);
                    // }
                } catch (e) {
                    console.warn('Error loading settings', e);
                }
            }

            // Save to localStorage when it changes
            effect(() => {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                    dataSaver: this.dataSaver(),
                    selectedRegion: this.selectedRegion()
                }));
            });
        }
    }

    toggleDataSaver() {
        this.dataSaver.update(v => !v);
    }
}
