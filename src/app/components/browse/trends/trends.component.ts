import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdsContainerComponent } from '../../shared/ads-container/ads-container.component'; // Import new component
import { InfiniteScrollDirective } from '../../../directives/infinite-scroll.directive';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { Song } from '../../../services/playlist.service';
import { SeoService } from '../../../services/seo.service';

import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { LanguageService } from '../../../services/language.service';

@Component({
    selector: 'app-trends',
    standalone: true,
    imports: [CommonModule, InfiniteScrollDirective, AdsContainerComponent, SkeletonComponent], // Add to imports
    templateUrl: './trends.component.html'
})
export class TrendsComponent implements OnInit {
    private seoService = inject(SeoService);
    public languageService = inject(LanguageService);

    trendingSongs = signal<Song[]>([]);
    loading = signal(true);
    loadingMore = signal(false);
    currentPage = 0;
    itemsPerPage = 10;
    hasMore = true;
    allSongs: Song[] = [];

    // Filter options
    selectedRegion = signal<'CO' | 'US' | 'MX'>('CO');
    regions = [
        { code: 'CO' as const, name: 'Colombia 🇨🇴', flag: '🇨🇴' },
        { code: 'MX' as const, name: 'México 🇲🇽', flag: '🇲🇽' },
        { code: 'US' as const, name: 'Mundial 🌎', flag: '🌎' }
    ];

    get translatedRegions() {
        return this.regions.map(r => ({
            ...r,
            name: r.code === 'US' ? this.languageService.get('trends.world') : r.name
        }));
    }

    constructor(
        private musicApi: MusicApiService,
        private playerService: PlayerService
    ) { }

    ngOnInit() {
        // SEO optimization
        this.seoService.setSeoData(
            this.languageService.get('trends.seo.title'),
            this.languageService.get('trends.seo.desc')
        );

        this.loadInitialData();
    }
    // Adsterra scripts removed - now handled by AdsContainerComponent


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
    changeRegion(region: 'CO' | 'US' | 'MX') {
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

    // Play song on click
    onSongClick(song: Song, event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.playerService.setPlaylist(this.trendingSongs(), false, 'trends');
        this.playerService.playSong(song);
    }

    // Image error handler - fallback to placeholder
    onImageError(event: Event) {
        const img = event.target as HTMLImageElement;
        img.src = 'https://placehold.co/300x300/18181b/10b981?text=🎵';
    }
}
