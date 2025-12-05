import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdBannerComponent } from '../../shared/ad-banner/ad-banner.component';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { Song } from '../../../services/playlist.service';
import { SeoService } from '../../../services/seo.service';

@Component({
    selector: 'app-charts',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit {
    private seoService = inject(SeoService);

    countries = [
        { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
        { code: 'MX', name: 'México', flag: '🇲🇽' },
        { code: 'US', name: 'Todo el Mundo', flag: '🌍' }
    ];
    selectedCountry = 'CO';

    get selectedCountryName(): string {
        return this.countries.find(c => c.code === this.selectedCountry)?.name || '';
    }

    chartSongs = signal<Song[]>([]);
    loading = signal(true);

    constructor(
        private musicApi: MusicApiService,
        private playerService: PlayerService
    ) { }

    ngOnInit() {
        this.seoService.setSeoData(
            'Top Charts Musicales 2025 | Rankings Globales y Latinos | DonMusic',
            'Explora los rankings musicales más importantes del 2025. Top 50 de Colombia, México y el mundo. Las canciones más virales y escuchadas del momento.'
        );
        this.loadCharts(this.selectedCountry);
    }

    selectCountry(code: string) {
        this.selectedCountry = code;
        this.loadCharts(code);
    }

    loadCharts(countryCode: string) {
        this.loading.set(true);
        this.musicApi.getTrending(countryCode).subscribe({
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
        this.playerService.playSong(song);
    }

    playAll() {
        if (this.chartSongs().length > 0) {
            this.playerService.setPlaylist(this.chartSongs());
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
