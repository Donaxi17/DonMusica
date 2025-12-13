import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OfflineService, OfflineSong } from '../../services/offline.service';
import { PlayerService } from '../../services/player.service';
import { ToastService } from '../../services/toast.service';
import { SeoService } from '../../services/seo.service';
import { LyricsService, SavedLyric } from '../../services/lyrics.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';

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
  private lyricsService = inject(LyricsService);

  offlineSongs = this.offlineService.offlineSongs;
  totalSize = signal('0 B');
  isOnline = signal(navigator.onLine);

  // Lyrics View
  activeLyrics = signal<SavedLyric | null>(null);

  // Storage limits (same as upload-music)
  readonly FREE_STORAGE_LIMIT = 1024; // 1 GB in MB
  readonly PRO_STORAGE_LIMIT = 5120;  // 5 GB in MB
  isPro = false;
  maxStorage = 1024; // in MB
  usedStorage = 0;   // in MB

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
    return (this.usedStorage / 1024).toFixed(2);
  }

  get maxStorageGB(): number {
    return this.maxStorage / 1024;
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
    // Create a premium, responsive toast
    const message = `
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 16px; border-radius: 12px; position: relative; overflow: hidden;">
        <!-- Animated gradient overlay -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24); background-size: 200% 100%; animation: shimmer 2s infinite;"></div>
        
        <!-- Crown Icon Header -->
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 10px; border-radius: 50%; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);">
            <span style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></span>
          </div>
        </div>
        
        <!-- Title -->
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 18px; font-weight: 800; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 4px; letter-spacing: 0.5px;">
            PLAN PRO
          </div>
          <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">
            Próximamente disponible
          </div>
        </div>
        
        <!-- Benefits Section -->
        <div style="background: rgba(30, 41, 59, 0.5); border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: 700; color: #fbbf24; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 14px;"></span>
            <span>Beneficios Exclusivos</span>
          </div>
          
          <div style="display: grid; gap: 8px;">
            <!-- Benefit 1 -->
            <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(16, 185, 129, 0.05); border-radius: 6px; border-left: 3px solid #10b981;">
              <span style="font-size: 14px; flex-shrink: 0;"></span>
              <div style="font-size: 12px; line-height: 1.4;">
                <strong style="color: #10b981;">5 GB</strong> <span style="color: #cbd5e1;">de almacenamiento</span>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">vs 1 GB en plan FREE</div>
              </div>
            </div>
            
            <!-- Benefit 2 -->
            <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(59, 130, 246, 0.05); border-radius: 6px; border-left: 3px solid #3b82f6;">
              <span style="font-size: 14px; flex-shrink: 0;"></span>
              <div style="font-size: 12px; line-height: 1.4;">
                <strong style="color: #3b82f6;">~1,280 canciones</strong>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">vs ~256 en plan FREE</div>
              </div>
            </div>
            
            <!-- Benefit 3 -->
            <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(168, 85, 247, 0.05); border-radius: 6px; border-left: 3px solid #a855f7;">
              <span style="font-size: 14px; flex-shrink: 0;"></span>
              <div style="font-size: 12px; line-height: 1.4; color: #cbd5e1;">
                <strong style="color: #a855f7;">Sin anuncios</strong>
              </div>
            </div>
            
            <!-- Benefit 4 -->
            <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(236, 72, 153, 0.05); border-radius: 6px; border-left: 3px solid #ec4899;">
              <span style="font-size: 14px; flex-shrink: 0;"></span>
              <div style="font-size: 12px; line-height: 1.4; color: #cbd5e1;">
                <strong style="color: #ec4899;">Soporte prioritario</strong>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 10px; border-top: 1px solid rgba(148, 163, 184, 0.1);">
          <div style="font-size: 10px; color: #64748b; line-height: 1.5;">
             Te notificaremos cuando esté disponible
          </div>
        </div>
      </div>
      
      <style>
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      </style>
    `;

    this.toastService.showHtml(message, 'info', 15000); // 15 seconds
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

  hasLyrics(song: OfflineSong): boolean {
    return this.lyricsService.isSaved(song.title, song.artist);
  }

  viewLyrics(song: OfflineSong, event: Event) {
    event.stopPropagation();
    const lyric = this.lyricsService.getSavedLyrics().find(l =>
      l.title.toLowerCase() === song.title.toLowerCase() &&
      l.artist.toLowerCase() === song.artist.toLowerCase()
    );

    if (lyric) {
      this.activeLyrics.set(lyric);
    } else {
      this.toastService.info('No hay letra guardada para esta canción');
    }
  }

  closeLyrics() {
    this.activeLyrics.set(null);
  }
}
