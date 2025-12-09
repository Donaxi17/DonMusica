import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdsContainerComponent } from '../../shared/ads-container/ads-container.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { MusicApiService } from '../../../services/music-api.service';
import { Song } from '../../../services/playlist.service';
import { PlayerService } from '../../../services/player.service';
import { SeoService } from '../../../services/seo.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-new-releases',
    standalone: true,
    imports: [CommonModule, SkeletonComponent, AdsContainerComponent],
    templateUrl: './new-releases.component.html'
})
export class NewReleasesComponent implements OnInit, OnDestroy {
    private seoService = inject(SeoService);
    private playerSubscription?: Subscription;

    releases = signal<Song[]>([]);
    private allReleases: Song[] = []; // Guardamos TODAS (29) aquí
    loading = signal(true);
    currentSongIndex = signal<number>(-1);
    isPlaying = signal(false);
    currentTime = signal(0);
    duration = signal(0);

    constructor(
        private musicApi: MusicApiService,
        private player: PlayerService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        // SEO optimization
        this.seoService.setSeoData(
            'Nuevos Lanzamientos Musicales 2025 | Últimos Estrenos | DonMusica',
            'Descubre los últimos lanzamientos musicales de 2025 en DonMusica. Escucha previews de los estrenos más recientes de reggaetón, trap, pop urbano y música latina. ¡Actualizado diariamente en donmusica.online!'
        );

        // ALWAYS fetch 29 (Max needed) and slice locally
        this.musicApi.getNewReleases('CO', 29).subscribe({
            next: (data) => {
                this.allReleases = data;
                console.log(`[API START] Loaded ${data.length} songs. Target PC: 29, Mobile: 28.`);
                this.updateVisibleItems(); // Calculate initial view immediately
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading new releases:', err);
                this.loading.set(false);
            }
        });

        // Subscribe to player state changes
        this.subscribeToPlayer();
    }

    // LISTENER: Detects resize LIVE
    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.updateVisibleItems();
    }

    private updateVisibleItems() {
        if (!isPlatformBrowser(this.platformId)) return;

        const width = window.innerWidth;

        // Logic requested by User:
        // PC (>= 1280px): Exactly 29 items (if available).
        // Mobile/Laptop (< 1280px): Max 28 items, BUT must remain EVEN to avoid orphans in 2-col grid.

        let limit = 29;

        if (width >= 1280) {
            limit = 29;
        } else {
            // Target is 28
            const target = 28;
            const available = this.allReleases.length;

            // If we have plenty, just crop to 28
            if (available >= target) {
                limit = target;
            } else {
                // If we have fewer (e.g. 25), look for the nearest even number (24)
                // This ensures the last row in mobile (2 cols) is always full
                limit = Math.floor(available / 2) * 2;
            }
        }

        console.log(`[Resize Live] Width: ${width}px. Available: ${this.allReleases.length}. Limit calculated: ${limit}.`);

        if (this.allReleases.length > 0) {
            this.releases.set(this.allReleases.slice(0, limit));
        }
    }


    ngOnDestroy() {
        this.playerSubscription?.unsubscribe();
    }

    private subscribeToPlayer() {
        // Listen for when current song changes (including auto-play)
        this.playerSubscription = this.player.currentSong$.subscribe(song => {
            if (song) {
                const index = this.releases().findIndex(r => r.id === song.id);
                if (index !== -1) {
                    this.currentSongIndex.set(index);
                }
            }
        });

        // Also subscribe to playing state to keep UI in sync
        this.player.isPlaying$.subscribe(playing => {
            this.isPlaying.set(playing);
        });
    }

    playSong(song: Song, index?: number) {
        const songIndex = index !== undefined ? index : this.releases().findIndex(r => r.id === song.id);
        this.currentSongIndex.set(songIndex);

        // Play the song and set up auto-play for next
        this.player.playSong(song);
        this.isPlaying.set(true);

        // Set up playlist for continuous playback
        this.player.setPlaylist(this.releases());
    }

    playAll() {
        if (this.releases().length > 0) {
            this.playSong(this.releases()[0], 0);
        }
    }

    playNext() {
        const nextIndex = this.currentSongIndex() + 1;
        if (nextIndex < this.releases().length) {
            this.playSong(this.releases()[nextIndex], nextIndex);
        }
    }

    playPrevious() {
        const prevIndex = this.currentSongIndex() - 1;
        if (prevIndex >= 0) {
            this.playSong(this.releases()[prevIndex], prevIndex);
        }
    }

    togglePlayPause() {
        if (this.isPlaying()) {
            this.player.pause();
            this.isPlaying.set(false);
        } else {
            this.player.resume();
            this.isPlaying.set(true);
        }
    }

    handleImageError(event: any, title: string) {
        event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=10b981&color=fff&size=300&font-size=0.33`;
    }

    isCurrentSong(song: Song): boolean {
        const index = this.releases().findIndex(r => r.id === song.id);
        return index === this.currentSongIndex();
    }
}
