import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdsContainerComponent } from '../../shared/ads-container/ads-container.component';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { Song } from '../../../services/playlist.service';
import { SeoService } from '../../../services/seo.service';
import { LanguageService } from '../../../services/language.service';

@Component({
    selector: 'app-charts',
    standalone: true,
    imports: [CommonModule, AdsContainerComponent],
    templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit {
    private seoService = inject(SeoService);
    public languageService = inject(LanguageService);

    countries = [
        { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
        { code: 'MX', name: 'México', flag: '🇲🇽' },
        { code: 'US', name: 'Todo el Mundo', flag: '🌍' }
    ];
    selectedCountry = 'CO';

    get translatedCountries() {
        return this.countries.map(c => ({
            ...c,
            name: c.code === 'US' ? this.languageService.get('charts.world') : c.name
        }));
    }

    get selectedCountryName(): string {
        return this.translatedCountries.find(c => c.code === this.selectedCountry)?.name || '';
    }

    chartSongs = signal<Song[]>([]);
    loading = signal(true);
    currentPlayingSong = signal<Song | null>(null);

    constructor(
        private musicApi: MusicApiService,
        private playerService: PlayerService
    ) { }

    ngOnInit() {
        this.seoService.setSeoData(
            this.languageService.get('charts.seo.title'),
            this.languageService.get('charts.seo.desc')
        );
        this.loadCharts(this.selectedCountry);

        // Sync local signal with Player Service
        this.playerService.currentSong$.subscribe(song => {
            this.currentPlayingSong.set(song);
        });
    }

    selectCountry(code: string) {
        this.selectedCountry = code;
        this.loadCharts(code);
    }

    loadCharts(countryCode: string) {
        this.loading.set(true);
        this.musicApi.getTrending(countryCode, true).subscribe({
            next: (songs) => {
                this.chartSongs.set(songs);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading charts:', err);
                this.loading.set(false);
            }
        });
    }

    playSong(song: Song) {
        // Set the full context so Next/Prev buttons and Auto-Play work
        this.playerService.setPlaylist(this.chartSongs(), false, 'charts');
        this.playerService.playSong(song);
    }

    isCurrentSong(song: Song): boolean {
        return this.currentPlayingSong()?.id === song.id;
    }

    playAll() {
        if (this.chartSongs().length > 0) {
            this.playerService.setPlaylist(this.chartSongs(), false, 'charts');
            this.playerService.playSong(this.chartSongs()[0]);
        }
    }

    // Manejar error de imagen con fallback
    handleImageError(event: Event, songTitle: string) {
        const img = event.target as HTMLImageElement;
        if (img) {
            img.src = `https://placehold.co/300x300/1f2937/3b82f6?text=${songTitle.charAt(0)}`;
        }
    }
}
