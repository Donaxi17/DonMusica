import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NetworkService } from '../../services/network.service';
import { NoConnectionComponent } from '../shared/no-connection/no-connection.component';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { MusicApiService } from '../../services/music-api.service';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../services/playlist.service';
import { SeoService } from '../../services/seo.service';
import { OfflineService } from '../../services/offline.service';
import { ToastService } from '../../services/toast.service';
import { ShareService } from '../../services/share.service';
import { CacheService } from '../../services/cache.service';
import { AdBannerComponent } from '../shared/ad-banner/ad-banner.component';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';

@Component({
  selector: 'app-free-music',
  standalone: true,
  imports: [NoConnectionComponent, CommonModule, FormsModule, SvgIconComponent, AdsContainerComponent],
  templateUrl: './free-music.component.html',
  styleUrl: './free-music.component.css'
})
export class FreeMusicComponent implements OnInit {
  networkService = inject(NetworkService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private musicApi = inject(MusicApiService);
  private playerService = inject(PlayerService);
  private offlineService = inject(OfflineService);
  private toastService = inject(ToastService);
  private shareService = inject(ShareService);
  private cacheService = inject(CacheService);

  // Géneros modernos
  latinGenres = [
    { id: 'pop', name: 'Pop', icon: '⭐' },
    { id: 'rock', name: 'Rock', icon: '🎸' },
    { id: 'electronic', name: 'Electrónica', icon: '🎧' },
    { id: 'hiphop', name: 'Hip Hop', icon: '🎤' },
    { id: 'indie', name: 'Indie', icon: '🎵' },
    { id: 'jazz', name: 'Jazz', icon: '🎷' },
    { id: 'classical', name: 'Clásica', icon: '🎻' },
    { id: 'metal', name: 'Metal', icon: '🔥' }
  ];

  selectedGenre = signal('pop');
  songs = signal<Song[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  // Sistema de descarga con anuncios
  showDownloadModal = signal(false);
  selectedDownloadSong = signal<Song | null>(null);
  downloadCountdown = signal(0); // Sin countdown
  canDownload = signal(true); // Puede descargar inmediatamente
  isProcessingDownload = signal(false);

  // Smartlink configuration
  // Smartlink configuration
  // Active Monetag Smartlink
  private readonly SMARTLINK_URL = 'https://www.effectivegatecpm.com/sw9g0tx52?key=973a1c8fac0e809dba93c52ce9b0de4c';

  // Custom Download Notification
  showDownloadNotification = signal(false);
  downloadingSong = signal<Song | null>(null);
  downloadSuccess = signal(false);

  closeDownloadNotification() {
    this.showDownloadNotification.set(false);
    this.downloadingSong.set(null);
    this.downloadSuccess.set(false);
  }

  // Estado de reproducción reactivo
  playingSongId = signal<string | number | undefined>(undefined);
  isPlayerPlaying = signal(false);

  ngOnInit() {
    this.seoService.setSeoData(
      'Música Sin Copyright Gratis para YouTube y Twitch (2025) | DonMusica',
      'Descarga la mejor música sin copyright (Royalty Free) para tus videos. Pop, Rock, Electrónica, Hip Hop. 100% Legal, seguro para monetizar y libre de strikes.'
    );
    this.loadMusicByGenre(this.selectedGenre());

    // Suscribirse al estado del reproductor para feedback visual en tiempo real
    this.playerService.currentSong$.subscribe(song => {
      this.playingSongId.set(song?.id);
    });

    this.playerService.isPlaying$.subscribe(isPlaying => {
      this.isPlayerPlaying.set(isPlaying);
    });

    // Detectar búsqueda desde URL (para enlaces compartidos)
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery.set(params['q']);
        this.searchMusic();
      }
    });
  }

  isSongActive(song: Song): boolean {
    // Comparación flexible (string vs number)
    return String(this.playingSongId()) === String(song.id);
  }

  loadMusicByGenre(genre: string) {
    this.selectedGenre.set(genre);

    // Clave de caché única para este género
    const cacheKey = `music_genre_${genre}`;

    // 1. Intentar cargar desde caché primero (especialmente si está offline)
    const cachedSongs = this.cacheService.get<Song[]>(cacheKey);

    if (cachedSongs && !this.networkService.isOnline()) {
      // Si está offline y hay caché, usar caché
      console.log('📦 Usando música en caché (offline)');
      this.songs.set(cachedSongs);
      this.isLoading.set(false);
      this.toastService.info('📦 Mostrando contenido en caché');
      return;
    }

    // 2. Si está online o no hay caché, cargar desde API
    this.isLoading.set(true);

    // Actualizar SEO dinámicamente según el género con keywords potentes
    const genreName = this.latinGenres.find(g => g.id === genre)?.name || 'Música';
    this.seoService.setSeoData(
      `${genreName} Sin Copyright Gratis (Royalty Free) | DonMusica`,
      `Descarga música ${genreName} sin copyright para tus videos de YouTube, Twitch o Instagram. Audio de alta calidad, gratis y seguro para monetizar.`
    );

    // Usar getJamendoByGenre para obtener música por género con mejor variedad
    this.musicApi.getJamendoByGenre(genre, 50).subscribe({
      next: (songs) => {
        this.songs.set(songs);
        this.isLoading.set(false);

        // 3. Guardar en caché (expira en 60 minutos)
        this.cacheService.set(cacheKey, songs, 60);
      },
      error: (err) => {
        console.error('Error cargando música:', err);

        // 4. Si falla la API pero hay caché, usar caché como fallback
        if (cachedSongs) {
          console.log('⚠️ API falló, usando caché como fallback');
          this.songs.set(cachedSongs);
          this.toastService.warning('Mostrando contenido en caché');
        } else {
          this.songs.set([]);
        }

        this.isLoading.set(false);
      }
    });
  }

  searchMusic() {
    if (!this.searchQuery()) return;

    this.isLoading.set(true);

    // Actualizar SEO para búsqueda
    this.seoService.setSeoData(
      `Buscar "${this.searchQuery()}" - Música Sin Copyright | DonMusica`,
      `Resultados de búsqueda para "${this.searchQuery()}". Música sin copyright.`
    );

    this.musicApi.searchJamendo(this.searchQuery(), 50).subscribe({
      next: (songs) => {
        this.songs.set(songs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.songs.set([]);
        this.isLoading.set(false);
      }
    });
  }

  openDownloadModal(song: Song) {
    this.selectedDownloadSong.set(song);
    this.showDownloadModal.set(true);

    // Sin delay en Free Music (Inmediato)
    this.canDownload.set(true);
    this.downloadCountdown.set(0);

    this.isProcessingDownload.set(false);

    // Scroll al modal
    setTimeout(() => {
      const element = document.getElementById('download-section');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  }

  closeDownloadModal() {
    this.showDownloadModal.set(false);
    this.selectedDownloadSong.set(null);
    this.canDownload.set(false);
    this.isProcessingDownload.set(false);
  }

  private openSmartlinkIfAllowed(): void {
    console.log('🔗 Abriendo Smartlink:', this.SMARTLINK_URL);
    window.open(this.SMARTLINK_URL, '_blank');
  }

  private startCountdown() {
    const interval = setInterval(() => {
      const current = this.downloadCountdown();
      if (current > 0) {
        this.downloadCountdown.set(current - 1);
      } else {
        this.canDownload.set(true);
        clearInterval(interval);
      }
    }, 1000);
  }

  // Manejar error de imagen con fallback
  handleImageError(event: Event, songTitle: string) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = `https://placehold.co/300x300/1f2937/10b981?text=${songTitle.charAt(0)}`;
    }
  }

  playSong(song: Song) {
    // Si la playlist actual no es la lista de canciones mostrada, actualizarla
    // para permitir reproducción continua
    const currentPlaylist = this.playerService.playlist;
    const currentSongs = this.songs();

    // Compara si la playlist actual es diferente (por longitud o ID del primer elemento)
    // Esto es una verificación simple pero efectiva
    if (currentPlaylist.length !== currentSongs.length ||
      (currentPlaylist.length > 0 && currentSongs.length > 0 && currentPlaylist[0].id !== currentSongs[0].id)) {
      this.playerService.setPlaylist(currentSongs);
    }

    this.playerService.playSong(song);
  }

  playAll() {
    if (this.songs().length > 0) {
      this.playerService.setPlaylist(this.songs());
      this.playerService.playSong(this.songs()[0]);
    }
  }

  downloadSong() {
    const song = this.selectedDownloadSong();
    if (!song || !this.canDownload()) return;

    // 1. Abrir Smartlink inmediatamente (Prioridad Monetización)
    this.openSmartlinkIfAllowed();

    // 2. Mostrar notificación visual persistente
    this.downloadingSong.set(song);
    this.showDownloadNotification.set(true);
    this.downloadSuccess.set(false);

    this.isProcessingDownload.set(true);
    // this.toastService.info('⏳ Iniciando descarga...'); // Comentado para no duplicar mensajes

    // 3. Esperar 1 segundo para procesar la descarga
    setTimeout(() => {
      // Intentamos descargar como blob para evitar abrir nueva pestaña
      this.http.get(song.url, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          // Limpiamos el nombre del archivo
          const safeTitle = (song.title || 'audio').replace(/[^a-z0-9]/gi, '_').toLowerCase();
          link.download = `${safeTitle}.mp3`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Limpieza
          setTimeout(() => window.URL.revokeObjectURL(url), 100);

          this.isProcessingDownload.set(false);
          // this.closeDownloadModal(); // Mantenemos abierto para mostrar éxito
          this.downloadSuccess.set(true); // ✅ Marcar como éxito
          this.downloadingSong.set(null); // Limpiamos la canción en descarga para notificación
          this.showDownloadNotification.set(false); // Ocultamos la notificación flotante si existiera
        },
        error: (error) => {
          console.warn('Error en descarga directa (posible CORS), usando fallback', error);

          // Fallback: Si falla (CORS), abrimos en nueva pestaña
          window.open(song.url, '_blank');

          this.isProcessingDownload.set(false);
          // this.closeDownloadModal(); // Mantenemos abierto para mostrar éxito
          this.downloadSuccess.set(true);
          this.downloadingSong.set(null);
          this.showDownloadNotification.set(false);
        }
      });
    }, 1000);
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

  // Método para compartir
  async shareSong(song: Song, event: Event) {
    event.stopPropagation();

    const success = await this.shareService.shareSong(song, 'free-music');
    if (success) {
      this.toastService.success('Enlace copiado al portapapeles');
    } else {
      this.toastService.info('Compartir cancelado');
    }
  }
}
