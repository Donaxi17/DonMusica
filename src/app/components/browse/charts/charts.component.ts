import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import { AdsContainerComponent } from '../../shared/ads-container/ads-container.component';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { Song } from '../../../services/playlist.service';
import { SeoService } from '../../../services/seo.service';
import { LanguageService } from '../../../services/language.service';
import { SettingsService } from '../../../services/settings.service';
import { ImgFallbackDirective } from '../../../directives/img-fallback.directive';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-charts',
    standalone: true,
    imports: [CommonModule, AdsContainerComponent, ImgFallbackDirective],
    templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit {
    private seoService = inject(SeoService);
    public languageService = inject(LanguageService);
    public settingsService = inject(SettingsService);

    selectedRegion = this.settingsService.selectedRegion;
    // private regionSub: any; // No longer needed

    get selectedCountry() {
        return this.selectedRegion();
    }

    translatedCountries = computed(() => {
        return this.settingsService.regions.map(c => ({
            ...c,
            name: c.code === 'US' ? this.languageService.get('trends.world') : c.name
        }));
    });

    chartSongs = signal<Song[]>([]);
    loading = signal(true);
    currentPlayingSong = signal<Song | null>(null);

    get selectedCountryName(): string {
        const country = this.settingsService.regions.find(c => c.code === this.selectedRegion());
        if (this.selectedRegion() === 'US') return this.languageService.get('trends.world');
        return country ? country.name : 'Colombia';
    }

    constructor(
        private musicApi: MusicApiService,
        private playerService: PlayerService,
        private toastService: ToastService
    ) {
        // Sync with global region changes using RxJS (safer than effects for writing to signals)
        toObservable(this.selectedRegion)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe(region => {
                this.loadCharts(region);
            });
    }

    ngOnInit() {
        this.seoService.setSeoData(
            this.languageService.get('charts.seo.title'),
            this.languageService.get('charts.seo.desc')
        );

        // Initial Load
        this.loadCharts(this.selectedRegion());

        // Sync local signal with Player Service
        this.playerService.currentSong$.subscribe(song => {
            this.currentPlayingSong.set(song);
        });
    }

    // No ngOnDestroy needed

    selectCountry(code: 'CO' | 'US' | 'MX') {
        if (this.selectedRegion() === code) return;
        this.selectedRegion.set(code);
    }

    trackByCountryCode(index: number, country: { code: string }): string {
        return country.code;
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
                this.toastService.error(this.languageService.get('errors.loading_charts') || 'Error cargando éxitos');
                this.loading.set(false);
                this.chartSongs.set([]);
            }
        });
    }

    playSong(song: Song) {
        this.playerService.setPlaylist(this.chartSongs(), false, 'charts');
        this.playerService.playSong(song);
    }

    playAll() {
        if (this.chartSongs().length > 0) {
            this.playSong(this.chartSongs()[0]);
        }
    }

    get player() {
        return this.playerService;
    }

    isCurrentSong(song: Song): boolean {
        const currentId = this.player.currentSong?.id;
        return song.id === currentId;
    }
}
