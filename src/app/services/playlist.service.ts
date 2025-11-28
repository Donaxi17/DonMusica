import { Injectable } from '@angular/core';

export interface Song {
  id: number;
  artistId: number;
  img: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private readonly PLAYLISTS_KEY = 'donmusic_playlists';
  private readonly FAVORITES_KEY = 'donmusic_favorites';

  constructor() { }

  // ========== PLAYLISTS ==========

  getPlaylists(): Playlist[] {
    const data = localStorage.getItem(this.PLAYLISTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  createPlaylist(name: string, description: string = ''): Playlist {
    const playlists = this.getPlaylists();
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      songs: [],
      createdAt: new Date()
    };
    playlists.push(newPlaylist);
    localStorage.setItem(this.PLAYLISTS_KEY, JSON.stringify(playlists));
    return newPlaylist;
  }

  deletePlaylist(playlistId: string): void {
    let playlists = this.getPlaylists();
    playlists = playlists.filter(p => p.id !== playlistId);
    localStorage.setItem(this.PLAYLISTS_KEY, JSON.stringify(playlists));
  }

  addSongToPlaylist(playlistId: string, song: Song): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);

    if (!playlist) return false;

    // Check if song already exists
    if (playlist.songs.some(s => s.id === song.id)) {
      return false;
    }

    playlist.songs.push(song);
    localStorage.setItem(this.PLAYLISTS_KEY, JSON.stringify(playlists));
    return true;
  }

  removeSongFromPlaylist(playlistId: string, songId: number): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);

    if (!playlist) return;

    playlist.songs = playlist.songs.filter(s => s.id !== songId);
    localStorage.setItem(this.PLAYLISTS_KEY, JSON.stringify(playlists));
  }

  // ========== FAVORITES ==========

  getFavorites(): Song[] {
    const data = localStorage.getItem(this.FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  }

  addToFavorites(song: Song): boolean {
    const favorites = this.getFavorites();

    // Check if already in favorites
    if (favorites.some(s => s.id === song.id)) {
      return false;
    }

    favorites.push(song);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  }

  removeFromFavorites(songId: number): void {
    let favorites = this.getFavorites();
    favorites = favorites.filter(s => s.id !== songId);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
  }

  isFavorite(songId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some(s => s.id === songId);
  }

  // ========== SHARE ==========

  sharePlaylist(playlist: Playlist): void {
    const text = `🎵 Escucha mi playlist "${playlist.name}" con ${playlist.songs.length} canciones en DonMusic!`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: text,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${text}\n${url}`)
        .then(() => alert('¡Link copiado al portapapeles!'))
        .catch(() => alert('No se pudo copiar el link'));
    }
  }
}
