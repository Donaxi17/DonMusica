import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OfflineService, OfflineSong } from '../../services/offline.service';
import { PlayerService } from '../../services/player.service';
import { ToastService } from '../../services/toast.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-offline-music',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './offline-music.component.html',
  styleUrl: './offline-music.component.css'
})
export class OfflineMusicComponent implements OnInit {
  private offlineService = inject(OfflineService);
  private playerService = inject(PlayerService);
  private toastService = inject(ToastService);
  private seoService = inject(SeoService);

  offlineSongs = this.offlineService.offlineSongs;
  totalSize = signal('0 B');
  isOnline = signal(navigator.onLine);

  ngOnInit() {
    this.seoService.setSeoData(
      'Música Offline | DonMusica',
      'Accede a tu música descargada sin conexión en DonMusica. Escucha tus canciones favoritas en cualquier momento y lugar, incluso sin internet. donmusica.online'
    );

    this.updateTotalSize();

    // Escuchar cambios de conexión
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  updateTotalSize() {
    const size = this.offlineService.getTotalSize();
    this.totalSize.set(this.offlineService.formatSize(size));
  }

  playSong(song: OfflineSong) {
    // Usar la URL del blob en lugar de la URL original
    const offlineSongWithUrl = {
      ...song,
      url: song.audioUrl || song.url,
      img: song.imageUrl || song.img
    };
    this.playerService.playSong(offlineSongWithUrl);
  }

  playAll() {
    if (this.offlineSongs().length === 0) {
      this.toastService.info('No tienes canciones descargadas');
      return;
    }

    const songs = this.offlineSongs().map(song => ({
      ...song,
      url: song.audioUrl || song.url,
      img: song.imageUrl || song.img
    }));

    this.playerService.setPlaylist(songs);
    this.playerService.playSong(songs[0]);
    this.toastService.success(`Reproduciendo ${songs.length} canciones offline`);
  }

  async deleteSong(song: OfflineSong, event: Event) {
    event.stopPropagation();

    const confirmed = confirm(`¿Eliminar "${song.title}" de las descargas?`);
    if (!confirmed) return;

    const success = await this.offlineService.deleteSong(String(song.id));
    if (success) {
      this.toastService.success('Canción eliminada de descargas');
      this.updateTotalSize();
    } else {
      this.toastService.error('Error al eliminar la canción');
    }
  }

  async clearAll() {
    if (this.offlineSongs().length === 0) {
      this.toastService.info('No hay canciones para eliminar');
      return;
    }

    const confirmed = confirm(`¿Eliminar todas las ${this.offlineSongs().length} canciones descargadas?`);
    if (!confirmed) return;

    await this.offlineService.clearAll();
    this.toastService.success('Todas las descargas eliminadas');
    this.updateTotalSize();
  }

  isSongActive(song: OfflineSong): boolean {
    const currentSong = this.playerService.currentSong;
    return currentSong?.id === song.id;
  }

  isPlayerPlaying(): boolean {
    return this.playerService.isPlaying;
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
