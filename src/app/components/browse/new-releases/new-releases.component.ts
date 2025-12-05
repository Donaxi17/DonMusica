import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdBannerComponent } from '../../shared/ad-banner/ad-banner.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { MusicApiService } from '../../../services/music-api.service';
import { Song } from '../../../services/playlist.service';
import { PlayerService } from '../../../services/player.service';
import { SeoService } from '../../../services/seo.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-new-releases',
    standalone: true,
    imports: [CommonModule, SkeletonComponent],
    templateUrl: './new-releases.component.html'
})
export class NewReleasesComponent implements OnInit, OnDestroy {
    private seoService = inject(SeoService);
    private playerSubscription?: Subscription;

    releases = signal<Song[]>([]);
    loading = signal(true);
    currentSongIndex = signal<number>(-1);
    isPlaying = signal(false);
    currentTime = signal(0);
    duration = signal(0);

    constructor(
        private musicApi: MusicApiService,
        private player: PlayerService
    ) { }

    ngOnInit() {
        // SEO optimization
        this.seoService.setSeoData(
            'Nuevos Lanzamientos Musicales 2025 | Últimos Estrenos | DonMusic',
            'Descubre los últimos lanzamientos musicales de 2025. Escucha previews de los estrenos más recientes de reggaetón, trap, pop urbano y música latina. ¡Actualizado diariamente!'
        );

        // Load new releases
        // Load new releases
        this.musicApi.getNewReleases('CO', 30).subscribe({
            next: (data) => {
                this.releases.set(data);
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
