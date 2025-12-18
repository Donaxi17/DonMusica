import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Artist, Song, DatabaseService } from '../../../services/database.service';
import { PlayerService } from '../../../services/player.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { ToastService } from '../../../services/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-smart-shuffle',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './smart-shuffle.component.html',
    styleUrl: './smart-shuffle.component.css'
})
export class SmartShuffleComponent {
    @Input() artists: Artist[] = [];
    @Input() genreName: string = 'Todos';
    @Output() close = new EventEmitter<void>();

    private dbService = inject(DatabaseService);
    private playerService = inject(PlayerService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    selectedArtistIds = new Set<string>();
    isShuffling = false;

    get allSelected(): boolean {
        return this.selectedArtistIds.size === this.artists.length;
    }

    toggleArtist(id: string | undefined) {
        if (!id) return;
        if (this.selectedArtistIds.has(id)) {
            this.selectedArtistIds.delete(id);
        } else {
            this.selectedArtistIds.add(id);
        }
    }

    toggleAll() {
        if (this.allSelected) {
            this.selectedArtistIds.clear();
        } else {
            this.artists.forEach(a => {
                if (a.id) this.selectedArtistIds.add(a.id);
            });
        }
    }

    async startShuffle() {
        if (this.selectedArtistIds.size === 0) {
            this.toastService.info('Selecciona al menos un artista');
            return;
        }

        this.isShuffling = true;
        const selectedNames = this.artists
            .filter(a => a.id && this.selectedArtistIds.has(a.id))
            .map(a => a.name.toLowerCase());

        try {
            // we use firstValueFrom to "freeze" the data at this moment
            // this way, new uploads to Firebase won't trigger a re-shuffle
            const allSongs = await firstValueFrom(this.dbService.getSongs());

            const filteredSongs = allSongs.filter(song =>
                selectedNames.includes(song.artist.toLowerCase())
            );

            if (filteredSongs.length === 0) {
                this.toastService.error('No se encontraron canciones para los artistas seleccionados');
                this.isShuffling = false;
                return;
            }

            // Shuffle the songs
            const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);

            // Update playlist and play
            this.playerService.setPlaylist(shuffled as any, false, `smart-shuffle-${this.genreName}`);
            this.playerService.playSong(shuffled[0] as any);

            // Ensure shuffle is OFF so it follows the mixture's pre-shuffled order
            if (this.playerService.isShuffle) {
                this.playerService.toggleShuffle();
            }

            this.toastService.success(`Iniciando mezcla de ${this.selectedArtistIds.size} artistas`);
            this.isShuffling = false;

            // Navigate to experience component with state
            const selectedArtistsObjs = this.artists.filter(a => a.id && this.selectedArtistIds.has(a.id));

            // Save in service for persistence
            this.playerService.setSmartShuffleArtists(selectedArtistsObjs);

            this.router.navigate(['/smart-shuffle'], {
                state: {
                    artists: selectedArtistsObjs,
                    genre: this.genreName
                }
            });

            this.close.emit();
        } catch (err) {
            console.error('Error starting shuffle:', err);
            this.toastService.error('Error al obtener las canciones');
            this.isShuffling = false;
        }
    }
}
