import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
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
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { VoiceRecognitionService } from '../../services/voice-recognition.service';
import { HapticService } from '../../services/haptic.service';
import { VoiceVisualizerComponent } from '../shared/voice-waveform/voice-waveform.component';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-free-music',
  standalone: true,
  imports: [NoConnectionComponent, CommonModule, FormsModule, SvgIconComponent, AdsContainerComponent, VoiceVisualizerComponent],
  templateUrl: './free-music.component.html',
  styleUrl: './free-music.component.css'
})
export class FreeMusicComponent implements OnInit {
  networkService = inject(NetworkService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private musicApi = inject(MusicApiService);
  private playerService = inject(PlayerService);
  private offlineService = inject(OfflineService);
  private toastService = inject(ToastService);
  private shareService = inject(ShareService);
  private cacheService = inject(CacheService);
  private voiceService = inject(VoiceRecognitionService);
  private hapticService = inject(HapticService);
  public languageService = inject(LanguageService);

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
  isListening = signal(false);

  // Descarga redirigida a página global
  isProcessingDownload = signal(false);

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
      this.languageService.get('free_music.seo.title'),
      this.languageService.get('free_music.seo.desc')
    );
    this.loadMusicByGenre(this.selectedGenre());

    // Suscribirse al estado del reproductor para feedback visual en tiempo real
    this.playerService.currentSong$.subscribe(song => {
      this.playingSongId.set(song?.id);
    });

    this.playerService.isPlaying$.subscribe(isPlaying => {
      this.isPlayerPlaying.set(isPlaying);
    });

    // Voice recognition listener
    this.voiceService.text$.subscribe(text => {
      if (text) {
        this.searchQuery.set(text);
        this.isListening.set(false);
        this.searchMusic();
      }
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
    return String(this.playingSongId()) === String(song.id);
  }

  loadMusicByGenre(genre: string) {
    this.hapticService.light();
    this.selectedGenre.set(genre);
    const cacheKey = `music_genre_${genre}`;
    const cachedSongs = this.cacheService.get<Song[]>(cacheKey);

    if (cachedSongs && !this.networkService.isOnline()) {
      this.songs.set(cachedSongs);
      this.isLoading.set(false);
      this.toastService.info(this.languageService.get('free_music.toast.cached'));
      return;
    }

    this.isLoading.set(true);
    const genreName = this.languageService.get('free_music.genre.' + genre);
    this.seoService.setSeoData(
      this.languageService.get('free_music.seo.genre_title', genreName),
      this.languageService.get('free_music.seo.genre_desc', genreName)
    );

    this.musicApi.getJamendoByGenre(genre, 50).subscribe({
      next: (songs) => {
        this.songs.set(songs);
        this.isLoading.set(false);
        this.cacheService.set(cacheKey, songs, 60);
      },
      error: (err) => {
        console.error('Error cargando música:', err);
        if (cachedSongs) {
          this.songs.set(cachedSongs);
          this.toastService.warning(this.languageService.get('free_music.toast.cached').replace('📦 ', ''));
        } else {
          this.songs.set([]);
        }
        this.isLoading.set(false);
      }
    });
  }

  searchMusic() {
    this.hapticService.medium();
    if (!this.searchQuery()) return;
    this.isLoading.set(true);
    this.seoService.setSeoData(
      this.languageService.get('free_music.seo.search_title', this.searchQuery()),
      this.languageService.get('free_music.seo.search_desc', this.searchQuery())
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
    this.hapticService.light();
    this.router.navigate(['/download'], {
      state: {
        songTitle: song.title,
        artistName: song.artist,
        downloadUrl: song.url,
        mode: 'default',
        songData: song
      }
    });
  }

  closeDownloadModal() {
    // Ya no se usa modal inline
  }

  handleImageError(event: Event, songTitle: string) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = `https://placehold.co/300x300/1f2937/10b981?text=${songTitle.charAt(0)}`;
    }
  }

  playSong(song: Song) {
    this.hapticService.light();
    const currentPlaylist = this.playerService.playlist;
    const currentSongs = this.songs();

    if (currentPlaylist.length !== currentSongs.length ||
      (currentPlaylist.length > 0 && currentSongs.length > 0 && currentPlaylist[0].id !== currentSongs[0].id)) {
      this.playerService.setPlaylist(currentSongs, false, 'free-music');
    }

    this.playerService.playSong(song);
  }

  playAll() {
    this.hapticService.medium();
    if (this.songs().length > 0) {
      this.playerService.setPlaylist(this.songs(), false, 'free-music');
      this.playerService.playSong(this.songs()[0]);
    }
  }

  downloadSong() {
    // Ya no se usa descarga directa aquí
  }

  // Métodos para descarga offline
  downloadProgress = this.offlineService.downloadProgress;
  isDownloadingOffline = this.offlineService.isDownloading;

  async downloadForOffline(song: Song, event: Event) {
    this.hapticService.light();
    event.stopPropagation();
    if (this.isOffline(song.id)) {
      this.toastService.info(this.languageService.get('free_music.toast.already_offline'));
      return;
    }

    this.router.navigate(['/download'], {
      state: {
        songTitle: song.title,
        artistName: song.artist,
        mode: 'offline',
        songData: song
      }
    });
  }

  isOffline(songId: string | number): boolean {
    return this.offlineService.isOffline(String(songId));
  }

  // Método para compartir
  async shareSong(song: Song, event: Event) {
    this.hapticService.light();
    event.stopPropagation();
    await this.shareService.shareSong(song, 'free-music');
  }

  toggleVoiceSearch() {
    this.hapticService.light();
    if (this.isListening()) {
      this.voiceService.stop();
      this.isListening.set(false);
    } else {
      this.searchQuery.set('');
      this.isListening.set(true);
      this.voiceService.start();
    }
  }
}
