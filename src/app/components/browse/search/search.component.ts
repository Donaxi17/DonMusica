import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { LyricsService } from '../../../services/lyrics.service';
import { ToastService } from '../../../services/toast.service';
import { SeoService } from '../../../services/seo.service';
import { OfflineService } from '../../../services/offline.service';
import { ShareService } from '../../../services/share.service';
import { Song } from '../../../services/playlist.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search.component.html',
    styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private musicApi = inject(MusicApiService);
    private playerService = inject(PlayerService);
    private lyricsService = inject(LyricsService);
    private toastService = inject(ToastService);
    private seoService = inject(SeoService);
    private offlineService = inject(OfflineService);
    private shareService = inject(ShareService);

    searchQuery = signal('');
    isSearching = signal(false);
    showLyrics = signal(false);
    selectedSongLyrics = signal('');
    selectedSongTitle = signal('');
    selectedSongArtist = signal('');
    searchResults = signal<Song[]>([]);

    ngOnInit() {
        this.seoService.setSeoData(
            'Buscador de Letras y Música | DonMusica',
            'Encuentra y guarda las letras de tus canciones favoritas en DonMusica. Buscador musical global for lyrics, canciones, artistas y álbumes. ¡Crea tu colección de letras hoy en donmusica.online!'
        );

        // Detectar búsqueda desde URL (ej. enlaces compartidos)
        this.route.queryParams.subscribe(params => {
            if (params['q']) {
                this.searchQuery.set(params['q']);
                this.onSearch();
            }
        });
    }

    onSearch() {
        if (!this.searchQuery()) return;
        this.isSearching.set(true);
        this.searchResults.set([]);

        // Búsqueda unificada: Mainstream + Jamendo (Sin Copyright)
        forkJoin({
            mainstream: this.musicApi.search(this.searchQuery()),
            free: this.musicApi.searchJamendo(this.searchQuery())
        }).subscribe({
            next: (results) => {
                // Combinar priorizando mainstream, pero mostrando ambos
                const combined = [...results.mainstream, ...results.free];

                // Eliminar duplicados si los hubiera
                const unique = combined.filter((s, i, self) =>
                    i === self.findIndex(t => t.id === s.id || (t.title === s.title && t.artist === s.artist))
                );

                this.searchResults.set(unique);
                this.isSearching.set(false);
            },
            error: () => {
                this.isSearching.set(false);
                this.toastService.error('Error al buscar canciones');
            }
        });
    }

    playSong(song: Song) {
        this.playerService.playSong(song);
    }

    viewLyrics(song: Song) {
        this.selectedSongTitle.set(song.title);
        this.selectedSongArtist.set(song.artist);
        this.selectedSongLyrics.set('Cargando letra...');
        this.showLyrics.set(true);

        this.musicApi.getLyrics(song.artist, song.title).subscribe({
            next: (lyrics) => {
                if (lyrics && lyrics.length > 50) {
                    this.selectedSongLyrics.set(lyrics);
                } else {
                    this.selectedSongLyrics.set('No se encontró la letra de esta canción.\\n\\nIntenta buscar otra canción o verifica el nombre del artista.');
                }
            },
            error: () => {
                this.selectedSongLyrics.set('Error al cargar la letra. Por favor intenta de nuevo.');
            }
        });
    }

    closeLyrics() {
        this.showLyrics.set(false);
    }

    saveLyrics() {
        const title = this.selectedSongTitle();
        const artist = this.selectedSongArtist();
        const content = this.selectedSongLyrics();

        if (this.lyricsService.isSaved(title, artist)) {
            this.toastService.info('Esta letra ya está guardada');
            return;
        }

        this.lyricsService.saveLyric(title, artist, content);
        this.toastService.success('Letra guardada en tu colección');
    }

    isLyricsSaved(): boolean {
        return this.lyricsService.isSaved(this.selectedSongTitle(), this.selectedSongArtist());
    }

    isSongLyricsSaved(song: Song): boolean {
        return this.lyricsService.isSaved(song.title, song.artist);
    }

    toggleSaveLyrics(song: Song, event: Event) {
        event.stopPropagation();

        if (this.isSongLyricsSaved(song)) {
            this.toastService.info('Esta letra ya está guardada');
            return;
        }

        // Necesitamos obtener las letras primero
        this.musicApi.getLyrics(song.artist, song.title).subscribe(lyrics => {
            if (lyrics && lyrics.length > 50) {
                this.lyricsService.saveLyric(song.title, song.artist, lyrics);
                this.toastService.success('Letra guardada en tu colección');
            } else {
                this.toastService.error('No se pudo obtener la letra para guardar');
            }
        });
    }

    // Métodos para descarga offline
    downloadProgress = this.offlineService.downloadProgress;
    isDownloadingOffline = this.offlineService.isDownloading;

    async downloadForOffline(song: Song, event: Event) {
        event.stopPropagation();

        if (this.isOffline(song.id)) {
            this.toastService.info('Esta canción ya está descargada');
            return;
        }

        const success = await this.offlineService.downloadSong(song);
        if (success) {
            this.toastService.success('Canción descargada para uso offline');
        } else {
            this.toastService.error('Error al descargar la canción');
        }
    }

    isOffline(songId: string | number): boolean {
        return this.offlineService.isOffline(String(songId));
    }

    // Métodos para compartir
    async shareSong(song: Song, event: Event) {
        event.stopPropagation();

        const success = await this.shareService.shareSong(song);
        if (success) {
            this.toastService.success('Enlace copiado al portapapeles');
        } else {
            this.toastService.info('Compartir cancelado');
        }
    }

    async shareLyrics() {
        const title = this.selectedSongTitle();
        const artist = this.selectedSongArtist();
        const lyrics = this.selectedSongLyrics();

        const success = await this.shareService.shareLyrics(title, artist, lyrics);
        if (success) {
            this.toastService.success('Letra compartida');
        } else {
            this.toastService.info('Compartir cancelado');
        }
    }
}
