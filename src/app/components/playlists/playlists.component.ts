import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistService, Playlist, Song } from '../../services/playlist.service';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.css'
})
export class PlaylistsComponent implements OnInit {
  userPlaylists: Playlist[] = [];
  favorites: Song[] = [];
  selectedPlaylist: Playlist | null = null;

  showCreateModal: boolean = false;
  newPlaylistName: string = '';
  newPlaylistDescription: string = '';

  constructor(private playlistService: PlaylistService) { }

  ngOnInit(): void {
    this.loadData();
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
      alert('Por favor ingresa un nombre para la playlist');
      return;
    }

    this.playlistService.createPlaylist(this.newPlaylistName, this.newPlaylistDescription);
    this.loadData();
    this.closeCreateModal();
  }

  deletePlaylist(playlistId: string): void {
    if (confirm('¿Estás seguro de eliminar esta playlist?')) {
      this.playlistService.deletePlaylist(playlistId);
      this.loadData();
      if (this.selectedPlaylist?.id === playlistId) {
        this.selectedPlaylist = null;
      }
    }
  }

  selectPlaylist(playlist: Playlist): void {
    this.selectedPlaylist = playlist;
  }

  removeSongFromPlaylist(playlistId: string, songId: number): void {
    if (confirm('¿Quitar esta canción de la playlist?')) {
      this.playlistService.removeSongFromPlaylist(playlistId, songId);
      this.loadData();
      // Refresh selected playlist
      if (this.selectedPlaylist?.id === playlistId) {
        this.selectedPlaylist = this.userPlaylists.find(p => p.id === playlistId) || null;
      }
    }
  }

  removeFromFavorites(songId: number): void {
    if (confirm('¿Quitar de favoritos?')) {
      this.playlistService.removeFromFavorites(songId);
      this.loadData();
    }
  }

  sharePlaylist(playlist: Playlist): void {
    this.playlistService.sharePlaylist(playlist);
  }

  backToList(): void {
    this.selectedPlaylist = null;
  }
}
