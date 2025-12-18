import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Artist, Song } from '../../services/database.service';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-smart-shuffle-experience',
    standalone: true,
    imports: [CommonModule, SvgIconComponent, RouterModule],
    templateUrl: './smart-shuffle-experience.component.html',
    styleUrl: './smart-shuffle-experience.component.css'
})
export class SmartShuffleExperienceComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    public playerService = inject(PlayerService);

    selectedArtists = signal<Artist[]>([]);
    genreName = signal<string>('Todos');
    currentlyPlayingSong = signal<Song | null>(null);

    sortedArtists = computed(() => {
        const artists = this.selectedArtists();
        const currentSong = this.currentlyPlayingSong();
        if (!currentSong) return artists;

        const songArtist = (currentSong.artist || '').toLowerCase();

        // Return sorted list with the current artist first
        return [...artists].sort((a, b) => {
            const aName = (a.name || '').toLowerCase();
            const bName = (b.name || '').toLowerCase();

            const aIsCurrent = aName === songArtist || songArtist.includes(aName) || aName.includes(songArtist);
            const bIsCurrent = bName === songArtist || songArtist.includes(bName) || bName.includes(songArtist);

            if (aIsCurrent && !bIsCurrent) return -1;
            if (!aIsCurrent && bIsCurrent) return 1;
            return 0;
        });
    });

    effectiveImage = computed(() => {
        const song = this.currentlyPlayingSong();
        if (!song) return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

        // PlayerService already enriches song.img from Spotify or artist if needed
        if (song.img && song.img.trim() !== '' && !song.img.includes('default-music')) {
            return song.img;
        }

        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    });

    private subs: Subscription[] = [];

    constructor() {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
            this.selectedArtists.set(navigation.extras.state['artists'] || []);
            this.genreName.set(navigation.extras.state['genre'] || 'Todos');
        } else if (this.playerService.smartShuffleArtists.length > 0) {
            this.selectedArtists.set(this.playerService.smartShuffleArtists);
            // Recover genre from context string if possible
            const context = this.playerService.playbackContext;
            if (context.startsWith('smart-shuffle-')) {
                this.genreName.set(context.replace('smart-shuffle-', ''));
            }
        }
    }

    ngOnInit() {
        this.subs.push(
            this.playerService.currentSong$.subscribe(song => {
                this.currentlyPlayingSong.set(song as any);
            })
        );

        // If no artists, go back (avoid empty experience)
        if (this.selectedArtists().length === 0 && !this.playerService.currentSong) {
            this.router.navigate(['/artists']);
        }
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }

    goBack() {
        this.router.navigate(['/artists']);
    }

    togglePlay() {
        if (this.playerService.isPlaying) {
            this.playerService.pause();
        } else {
            this.playerService.play();
        }
    }

    nextTrack() {
        this.playerService.nextTrack();
    }

    prevTrack() {
        this.playerService.previousTrack();
    }

    handleImageError(event: any) {
        // Prevent infinite loop
        if (event.target.src.includes('data:image')) return;

        const song = this.currentlyPlayingSong();
        if (song) {
            const songArtist = (song.artist || '').toLowerCase();
            const artist = this.selectedArtists().find(a => {
                const aName = (a.name || '').toLowerCase();
                return aName === songArtist || songArtist.includes(aName) || aName.includes(songArtist);
            });

            if (artist?.image) {
                event.target.src = artist.image;
                return;
            }
        }

        // Final safety fallback to stop 404 loops
        event.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
}
