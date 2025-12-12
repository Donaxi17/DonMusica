import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlaylistService, Playlist, Song } from '../../services/playlist.service';
import { PlayerService } from '../../services/player.service';
import { FavoritesComponent } from '../favorites/favorites.component';
import { PlaylistDetailComponent } from '../playlist-detail/playlist-detail.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, FormsModule, FavoritesComponent, PlaylistDetailComponent],
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.css'
})
export class PlaylistsComponent implements OnInit {
  userPlaylists: Playlist[] = [];
  favorites: Song[] = [];
  selectedPlaylist: Playlist | null = null;
  currentSongId: number | string | null = null;
  isPlaying = false;

  showCreateModal: boolean = false;
  newPlaylistName: string = '';
  newPlaylistDescription: string = '';

  constructor(
    private playlistService: PlaylistService,
    private playerService: PlayerService,
    private router: Router,
    private toastService: ToastService
  ) { }

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
    this.playerService.setPlaylist(this.favorites, true);
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
    this.playerService.setPlaylist(playlist.songs, false);
    this.playerService.playSong(playlist.songs[0]);
    // Navigate to player
    this.router.navigate(['/player']);
  }

  playSong(song: Song): void {
    // Play single song
    this.playerService.setPlaylist([song], false);
    this.playerService.playSong(song);
    // Navigate to player
    this.router.navigate(['/player']);
  }

  backToList(): void {
    this.selectedPlaylist = null;
    window.scrollTo(0, 0);
  }
}
