import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OfflineService, OfflineSong } from '../../services/offline.service';
import { PlayerService } from '../../services/player.service';
import { ToastService } from '../../services/toast.service';
import { SeoService } from '../../services/seo.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { DonMusicaProService } from '../../services/don-musica-pro.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-offline-music',
  standalone: true,
  imports: [CommonModule, RouterLink, AdsContainerComponent],
  templateUrl: './offline-music.component.html',
  styleUrl: './offline-music.component.css'
})
export class OfflineMusicComponent implements OnInit {
  private offlineService = inject(OfflineService);
  private playerService = inject(PlayerService);
  private toastService = inject(ToastService);
  private seoService = inject(SeoService);
  private proService = inject(DonMusicaProService);
  public languageService = inject(LanguageService);

  offlineSongs = this.offlineService.offlineSongs;
  totalSize = signal('0 B');
  isOnline = signal(navigator.onLine);

  maxStorage = 1024; // in MB
  usedStorage = 0;   // in MB

  constructor() {
    effect(() => {
      this.updateStorageLimit();
    });

    effect(() => {
      // Trigger generic dependency on offlineSongs signal
      this.offlineSongs();
      this.updateTotalSize();
    }, { allowSignalWrites: true });
  }

  get isPro(): boolean {
    return this.proService.isPro();
  }

  updateStorageLimit() {
    // Offline limit is technically song count based currently in service (20 vs Infinity),
    // but user requested visual 5GB limit consistency. 
    // We will mock usage of the same storage limit values for consistency in UI even if logic differs slightly.
    this.maxStorage = this.proService.getOfflineLimitMB();
  }

  ngOnInit() {
    this.seoService.setSeoData(
      this.languageService.get('offline.seo.title'),
      this.languageService.get('offline.seo.desc')
    );

    this.updateTotalSize();

    // Escuchar cambios de conexión
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  updateTotalSize() {
    const size = this.offlineService.getTotalSize();
    this.totalSize.set(this.offlineService.formatSize(size));

    // Update used storage in MB
    this.usedStorage = size / (1024 * 1024);
  }

  // Storage warning level
  get storageWarningLevel(): 'safe' | 'warning' | 'danger' {
    const percentage = (this.usedStorage / this.maxStorage) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'safe';
  }

  get storagePercentage(): number {
    return Math.min(100, Math.round((this.usedStorage / this.maxStorage) * 100));
  }

  get usedStorageGB(): string {
    const val = this.usedStorage / 1024;
    return val.toFixed(2);
  }

  get formattedUsedStorage(): string {
    if (this.maxStorage < 1024) {
      return `${this.usedStorage.toFixed(1)} MB`;
    }
    const val = this.usedStorage / 1024;
    return `${val.toFixed(2)} GB`;
  }

  get storageColor(): string {
    // 0% -> Green (140)
    // 100% -> Red (0)
    const hue = Math.max(0, 140 - (this.storagePercentage * 1.4));
    return `hsl(${hue}, 70%, 50%)`;
  }

  get maxStorageGB(): string {
    return (this.maxStorage / 1024).toFixed(this.maxStorage >= 1024 ? 1 : 2);
  }

  get formattedMaxStorage(): string {
    if (this.maxStorage < 1024) {
      return `${Math.round(this.maxStorage)} MB`;
    }
    return `${(this.maxStorage / 1024).toFixed(1)} GB`;
  }

  // Estimated song capacity (assuming average 4MB per song)
  get estimatedSongsRemaining(): number {
    const avgSongSizeMB = 4;
    const remainingMB = this.maxStorage - this.usedStorage;
    return Math.floor(remainingMB / avgSongSizeMB);
  }

  get totalSongCapacity(): number {
    const avgSongSizeMB = 4;
    return Math.floor(this.maxStorage / avgSongSizeMB);
  }

  upgradeToPro() {
    this.proService.showUpgradeModal();
  }

  playSong(song: OfflineSong) {
    // Usar la URL del blob en lugar de la URL original
    const offlineSongWithUrl = {
      ...song,
      url: song.audioUrl || song.url,
      img: song.imageUrl || song.img
    };

    // Set playlist to current offline songs for context
    const allOffline = this.offlineSongs().map(s => ({
      ...s,
      url: s.audioUrl || s.url,
      img: s.imageUrl || s.img
    }));

    this.playerService.setPlaylist(allOffline, false, 'offline-music');
    this.playerService.playSong(offlineSongWithUrl);
  }

  playAll() {
    if (this.offlineSongs().length === 0) {
      this.toastService.info(this.languageService.get('offline.toast.no_songs'));
      return;
    }

    const songs = this.offlineSongs().map(song => ({
      ...song,
      url: song.audioUrl || song.url,
      img: song.imageUrl || song.img
    }));

    this.playerService.setPlaylist(songs, false, 'offline-music');
    this.playerService.playSong(songs[0]);
    this.toastService.success(this.languageService.get('offline.toast.playing', songs.length));
  }

  async deleteSong(song: OfflineSong, event: Event) {
    event.stopPropagation();

    // Removed confirmation alert as requested
    const success = await this.offlineService.deleteSong(String(song.id));
    if (success) {
      this.toastService.success(this.languageService.get('offline.toast.deleted'));
      this.updateTotalSize();
    } else {
      this.toastService.error(this.languageService.get('offline.toast.delete_error'));
    }
  }

  async clearAll() {
    if (this.offlineSongs().length === 0) {
      this.toastService.info(this.languageService.get('offline.toast.no_songs_delete'));
      return;
    }

    // Removed confirmation alert as requested
    await this.offlineService.clearAll();
    this.toastService.success(this.languageService.get('offline.toast.all_deleted'));
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
