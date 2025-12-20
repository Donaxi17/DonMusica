import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlaylistService, Playlist, Song } from '../../services/playlist.service';
import { PlayerService } from '../../services/player.service';

import { PlaylistDetailComponent } from '../playlist-detail/playlist-detail.component';
import { ToastService } from '../../services/toast.service';
import { OfflineService } from '../../services/offline.service';
import { MusicApiService } from '../../services/music-api.service';

import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, FormsModule, PlaylistDetailComponent, AdsContainerComponent],
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.css'
})
export class PlaylistsComponent implements OnInit {
  private playlistService = inject(PlaylistService);
  private playerService = inject(PlayerService);
  private offlineService = inject(OfflineService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private musicApi = inject(MusicApiService);

  userPlaylists: Playlist[] = [];
  favorites: Song[] = [];
  selectedPlaylist: Playlist | null = null;
  currentSongId: number | string | null = null;
  isPlaying = false;

  offlineSongIds = computed(() => new Set(this.offlineService.offlineSongs().map(s => String(s.id))));

  showCreateModal: boolean = false;
  newPlaylistName: string = '';
  newPlaylistDescription: string = '';

  constructor() { }

  ngOnInit(): void {
    this.loadData();

    // Subscribe to player state
    this.playerService.currentSong$.subscribe(song => {
      this.currentSongId = song?.id || null;
    });

    this.playerService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
    });
  }

  loadData(): void {
    this.userPlaylists = this.playlistService.getPlaylists();
    this.favorites = this.playlistService.getFavorites();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newPlaylistName = '';
    this.newPlaylistDescription = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createPlaylist(): void {
    if (!this.newPlaylistName.trim()) {
      this.toastService.warning('Por favor ingresa un nombre para la playlist');
      return;
    }

    this.playlistService.createPlaylist(this.newPlaylistName, this.newPlaylistDescription);
    this.loadData();
    this.closeCreateModal();
    this.toastService.success('Playlist creada correctamente');
  }

  deletePlaylist(playlistId: string): void {
    // Eliminación directa sin confirmación (según solitud de usuario)
    this.playlistService.deletePlaylist(playlistId);
    this.loadData();
    if (this.selectedPlaylist?.id === playlistId) {
      this.selectedPlaylist = null;
    }
    this.toastService.success('Playlist eliminada');
  }

  selectPlaylist(playlist: Playlist): void {
    this.selectedPlaylist = playlist;
    window.scrollTo(0, 0);
  }

  removeSongFromPlaylist(playlistId: string, songId: number | string): void {
    this.playlistService.removeSongFromPlaylist(playlistId, songId);
    this.loadData();
    // Refresh selected playlist
    if (this.selectedPlaylist?.id === playlistId) {
      this.selectedPlaylist = this.userPlaylists.find(p => p.id === playlistId) || null;
    }
    this.toastService.success('Canción eliminada de la playlist');
  }

  removeFromFavorites(songId: number | string): void {
    this.playlistService.removeFromFavorites(songId);
    this.loadData();
    this.toastService.success('Eliminada de favoritos');
  }

  sharePlaylist(playlist: Playlist): void {
    this.playlistService.sharePlaylist(playlist);
    this.toastService.success('Enlace de playlist copiado');
  }

  playFavorites(): void {
    if (this.favorites.length === 0) {
      this.toastService.info('No tienes canciones en favoritos');
      return;
    }
    // Set playlist and play first song
    this.playerService.setPlaylist(this.favorites, true, 'playlists');
    this.playerService.playSong(this.favorites[0]);
    // Navigate to player
    this.router.navigate(['/player']);
  }

  playPlaylistSongs(playlist: Playlist): void {
    if (playlist.songs.length === 0) {
      this.toastService.info('Esta playlist está vacía');
      return;
    }
    // Set playlist and play first song
    this.playerService.setPlaylist(playlist.songs, false, 'playlists');
    this.playerService.playSong(playlist.songs[0]);
    // Navigate to player
    this.router.navigate(['/player']);
  }

  playSong(song: Song): void {
    // Play single song
    this.playerService.setPlaylist([song], false, 'playlists');
    this.playerService.playSong(song);
    // Navigate to player
    this.router.navigate(['/player']);
  }

  downloadSong(song: Song): void {
    // Default to normal download for the cloud icon if not specified, 
    // but the user might want both. Let's provide separate methods.
    this.downloadNormal(song);
  }

  downloadNormal(song: Song): void {
    if (!song.url) {
      this.toastService.info('Buscando enlace de descarga...');
      this.musicApi.getBestAudioStream(song.title, song.artist).subscribe((url: string | null) => {
        if (url) {
          this.navigateToDownload(song, url, 'default');
        } else {
          this.toastService.error('No se pudo encontrar un enlace válido para esta canción');
        }
      });
      return;
    }

    this.navigateToDownload(song, song.url, 'default');
  }

  downloadOffline(song: Song): void {
    if (!song.url) {
      this.toastService.info('Buscando fuente offline...');
      this.musicApi.getBestAudioStream(song.title, song.artist).subscribe((url: string | null) => {
        if (url) {
          this.navigateToDownload(song, url, 'offline');
        } else {
          this.toastService.error('No se pudo encontrar una fuente para guardar offline');
        }
      });
      return;
    }
    this.navigateToDownload(song, song.url, 'offline');
  }

  private navigateToDownload(song: Song, url: string | null, mode: 'default' | 'offline'): void {
    // Aseguramos que el objeto song tenga la URL descubierta
    const songWithUrl = { ...song, url: url || song.url };

    this.router.navigate(['/download'], {
      state: {
        songTitle: song.title,
        artistName: song.artist,
        downloadUrl: url,
        mode: mode,
        songData: songWithUrl
      }
    });
  }

  backToList(): void {
    this.selectedPlaylist = null;
    window.scrollTo(0, 0);
  }
}
