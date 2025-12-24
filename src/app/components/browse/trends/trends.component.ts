import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import { AdsContainerComponent } from '../../shared/ads-container/ads-container.component';
import { InfiniteScrollDirective } from '../../../directives/infinite-scroll.directive';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { Song } from '../../../services/playlist.service';
import { SeoService } from '../../../services/seo.service';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { LanguageService } from '../../../services/language.service';
import { SettingsService } from '../../../services/settings.service';
import { ImgFallbackDirective } from '../../../directives/img-fallback.directive';
import { ToastService } from '../../../services/toast.service';

import { NativeAdsComponent } from '../../shared/native-ads/native-ads.component';

@Component({
    selector: 'app-trends',
    standalone: true,
    imports: [CommonModule, InfiniteScrollDirective, AdsContainerComponent, SkeletonComponent, ImgFallbackDirective, NativeAdsComponent],
    templateUrl: './trends.component.html'
})
export class TrendsComponent implements OnInit {
    private seoService = inject(SeoService);
    public languageService = inject(LanguageService);
    public settingsService = inject(SettingsService);

    trendingSongs = signal<Song[]>([]);
    loading = signal(true);
    loadingMore = signal(false);
    currentPage = 0;
    itemsPerPage = 10;
    hasMore = true;
    allSongs: Song[] = [];

    // Filter options linked to global settings
    selectedRegion = this.settingsService.selectedRegion;

    // Computed signal to provide stable references and avoid re-renders
    translatedRegions = computed(() => {
        // Dependency on language change if languageService has a signal, 
        // otherwise this will just run once unless we manually trigger it.
        // Assuming languageService.currentLanguage is a signal or we want simple static list for now.
        // Ideally languageService should provide a signal for reactivity.
        // For now, let's keep it simple. Even a static list is better than a thrashing getter.
        return this.settingsService.regions.map(r => ({
            ...r,
            name: r.code === 'US' ? this.languageService.get('trends.world') : r.name
        }));
    });

    constructor(
        private musicApi: MusicApiService,
        private playerService: PlayerService,
        private toastService: ToastService
    ) {
        // Sync with region changes automatically cleaning up subscription
        toObservable(this.selectedRegion)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe(region => {
                this.loadInitialData(region);
            });
    }

    ngOnInit() {
        this.seoService.setSeoData(
            this.languageService.get('trends.seo.title'),
            'Descubre las canciones más populares del momento en DonMusica. Escucha y descarga gratis los éxitos virales de TikTok, Spotify y más.'
        );

        // Initial Load
        this.loadInitialData(this.selectedRegion());
    }

    // No ngOnDestroy needed for the subscription thanks to takeUntilDestroyed

    loadInitialData(region: string) {
        this.loading.set(true);
        this.currentPage = 0;

        this.musicApi.getTrending(region).subscribe({
            next: (songs) => {
                if (songs && songs.length > 0) {
                    this.allSongs = songs.slice(0, 20);
                    this.trendingSongs.set(this.allSongs.slice(0, this.itemsPerPage));
                    this.hasMore = this.allSongs.length > this.itemsPerPage;
                    this.loading.set(false);
                } else {
                    this.loading.set(false);
                    this.hasMore = false;
                    this.trendingSongs.set([]);
                }
            },
            error: (err) => {
                console.error('Error loading trends:', err);
                this.toastService.error(this.languageService.get('errors.loading_trends') || 'Error cargando tendencias');
                this.loading.set(false);
                this.trendingSongs.set([]);
            }
        });
    }

    changeRegion(region: 'CO' | 'US' | 'MX') {
        if (this.selectedRegion() === region) return;
        this.selectedRegion.set(region);
    }

    trackByRegionCode(index: number, region: { code: string }): string {
        return region.code;
    }

    loadMore() {
        if (this.loadingMore() || !this.hasMore || this.loading()) return;

        this.loadingMore.set(true);
        this.currentPage++;

        setTimeout(() => {
            const start = this.currentPage * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            const nextBatch = this.allSongs.slice(start, end);

            if (nextBatch.length === 0) {
                this.hasMore = false;
            } else {
                this.trendingSongs.update(songs => [...songs, ...nextBatch]);
                this.hasMore = this.allSongs.length > end;
            }
            this.loadingMore.set(false);
        }, 300);
    }

    onSongClick(song: Song, event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.playerService.setPlaylist(this.trendingSongs(), false, 'trends');
        this.playerService.playSong(song);
    }
}
