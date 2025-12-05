import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdBannerComponent } from '../../shared/ad-banner/ad-banner.component';
import { InfiniteScrollDirective } from '../../../directives/infinite-scroll.directive';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { Song } from '../../../services/playlist.service';
import { SeoService } from '../../../services/seo.service';

@Component({
    selector: 'app-trends',
    standalone: true,
    imports: [CommonModule, InfiniteScrollDirective],
    templateUrl: './trends.component.html'
})
export class TrendsComponent implements OnInit {
    private seoService = inject(SeoService);

    trendingSongs = signal<Song[]>([]);
    loading = signal(true);
    loadingMore = signal(false);
    currentPage = 0;
    itemsPerPage = 10;
    hasMore = true;
    allSongs: Song[] = [];

    // Filter options
    selectedRegion = signal<'CO' | 'US'>('CO');
    regions = [
        { code: 'CO' as const, name: 'Colombia 🇨🇴', flag: '🇨🇴' },
        { code: 'US' as const, name: 'Mundial 🌎', flag: '🌎' }
    ];

    constructor(
        private musicApi: MusicApiService,
        private playerService: PlayerService
    ) { }

    ngOnInit() {
        // SEO optimization with keywords and description
        this.seoService.setSeoData(
            'Tendencias Musicales Globales 2025 | Top Canciones del Momento | DonMusic',
            'Descubre las tendencias musicales más populares del 2025. Escucha las canciones más escuchadas en todo el mundo, desde reggaetón hasta pop internacional. ¡Música sin límites!'
        );

        this.loadInitialData();
    }

    loadInitialData() {
        this.loading.set(true);
        const region = this.selectedRegion();

        // Use the optimized hybrid strategy from service
        this.musicApi.getTrending(region).subscribe({
            next: (songs) => {
                console.log('Trending songs received:', songs.length);
                if (songs && songs.length > 0) {
                    this.allSongs = songs;
                    // Load first page
                    this.trendingSongs.set(songs.slice(0, this.itemsPerPage));
                    this.hasMore = songs.length > this.itemsPerPage;
                    this.loading.set(false);
                } else {
                    this.loading.set(false);
                    this.hasMore = false;
                }
            },
            error: (err) => {
                console.error('Error loading trends:', err);
                this.loading.set(false);
            }
        });
    }

    // Change region filter
    changeRegion(region: 'CO' | 'US') {
        if (this.selectedRegion() === region) return;

        this.selectedRegion.set(region);
        this.currentPage = 0;
        this.loadInitialData();
    }

    loadMore() {
        if (this.loadingMore() || !this.hasMore || this.loading()) return;

        this.loadingMore.set(true);
        this.currentPage++;

        // Simulate loading delay for better UX
        setTimeout(() => {
            const start = (this.currentPage + 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            const nextBatch = this.allSongs.slice(start, end);

            if (nextBatch.length === 0) {
                this.hasMore = false;
            } else {
                this.trendingSongs.update(songs => [...songs, ...nextBatch]);
            }
            this.loadingMore.set(false);
        }, 300);
    }

    // Method intentionally does nothing - visual only as requested
    onSongClick(song: Song, event: Event) {
        // Visual only - no action on click as requested by user
        event.preventDefault();
        event.stopPropagation();
    }

    // Image error handler - fallback to placeholder
    onImageError(event: Event) {
        const img = event.target as HTMLImageElement;
        img.src = 'https://placehold.co/300x300/18181b/10b981?text=🎵';
    }
}
