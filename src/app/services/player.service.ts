import { Injectable, inject, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from './playlist.service';
import { MusicApiService } from './music-api.service';
import { ToastService } from './toast.service';
import { VideoPlayerService } from './video-player.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio = new Audio();
  private toastService = inject(ToastService);
  private injector = inject(Injector);

  // Lazy getter to avoid circular dependency
  private get videoPlayerService() {
    return this.injector.get(VideoPlayerService);
  }

  // Estado del reproductor (observables para que los componentes se suscriban)
  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private playlistSubject = new BehaviorSubject<Song[]>([]);
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);
  private progressSubject = new BehaviorSubject<number>(0);
  private volumeSubject = new BehaviorSubject<number>(70);
  private isShuffleSubject = new BehaviorSubject<boolean>(false);
  private repeatModeSubject = new BehaviorSubject<'off' | 'all' | 'one'>('off');
  private isFavoritesPlayingSubject = new BehaviorSubject<boolean>(false);
  private playbackContextSubject = new BehaviorSubject<string>('unknown'); // 'artist', 'playlist', 'album', etc.

  // Exponer como observables públicos
  currentSong$ = this.currentSongSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  playlist$ = this.playlistSubject.asObservable();
  currentTime$ = this.currentTimeSubject.asObservable();
  duration$ = this.durationSubject.asObservable();
  progress$ = this.progressSubject.asObservable();
  volume$ = this.volumeSubject.asObservable();
  isShuffle$ = this.isShuffleSubject.asObservable();
  repeatMode$ = this.repeatModeSubject.asObservable();
  isFavoritesPlaying$ = this.isFavoritesPlayingSubject.asObservable();
  playbackContext$ = this.playbackContextSubject.asObservable();

  // ... existing code ...

  constructor(private musicApi: MusicApiService) {
    this.initializeAudioListeners();
    this.setupMediaSession();
  }

  private initializeAudioListeners(): void {
    // Actualizar progreso
    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeSubject.next(this.audio.currentTime);
      this.durationSubject.next(this.audio.duration || 0);
      const progress = this.audio.duration > 0
        ? (this.audio.currentTime / this.audio.duration) * 100
        : 0;
      this.progressSubject.next(progress);
    });

    // Auto-play siguiente canción
    this.audio.addEventListener('ended', () => {
      if (this.repeatModeSubject.value === 'one') {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.nextTrack();
      }
    });

    // Configurar volumen inicial
    this.audio.volume = this.volumeSubject.value / 100;
  }

  // ========== MEDIA SESSION API (Lock Screen Controls) ==========
  private setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previousTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && this.audio.duration) {
          this.audio.currentTime = details.seekTime;
        }
      });
    }
  }

  private updateMediaSessionMetadata(song: Song) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        artwork: [
          { src: song.img || (song as any).thumbnail || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }
  }

  // ========== PLAYBACK CONTROLS ==========

  playSong(song: Song): void {
    // 1. One King Rule: Close Video if open
    try {
      this.videoPlayerService.closeVideo();
    } catch (e) {
      // Ignore if service not ready
    }

    const currentSong = this.currentSongSubject.value;

    if (currentSong?.id === song.id) {
      // Toggle play/pause si es la misma canción
      if (this.isPlayingSubject.value) {
        this.pause();
      } else {
        this.play();
      }
    } else {
      // Reproducir nueva canción
      this.currentSongSubject.next(song);
      this.updateMediaSessionMetadata(song);

      // Reproducir directamente (iTunes previews o Dropbox)
      if (song.url) {
        // Hotfix: Limpiar URLs corruptas de Dropbox (ej: ...dl=0?dl=1)
        let cleanUrl = song.url;
        if (cleanUrl.includes('dropbox.com') && cleanUrl.includes('dl=0')) {
          cleanUrl = cleanUrl.replace('dl=0?dl=1', 'dl=1'); // Fix specific double param
          cleanUrl = cleanUrl.replace('dl=0', 'dl=1'); // General fix
        }

        console.log('PlayerService: Cargando URL:', cleanUrl);
        this.audio.src = cleanUrl;
        this.audio.load();
        this.play();
      } else {
        this.toastService.error(`No se pudo cargar "${song.title}"`);
        setTimeout(() => this.nextTrack(), 500);
      }
    }
  }

  play(): void {
    this.audio.play()
      .then(() => {
        this.isPlayingSubject.next(true);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      })
      .catch(error => console.error('Error al reproducir:', error));
  }

  pause(): void {
    this.audio.pause();
    this.isPlayingSubject.next(false);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlayingSubject.next(false);
    this.currentSongSubject.next(null);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
    }
  }

  setPlaylist(songs: Song[], isFavorites: boolean = false, context: string = 'unknown'): void {
    this.playlistSubject.next(songs);
    this.isFavoritesPlayingSubject.next(isFavorites);
    this.playbackContextSubject.next(context);
  }

  resume(): void {
    this.play();
  }

  nextTrack(): void {
    const playlist = this.playlistSubject.value;
    const currentSong = this.currentSongSubject.value;

    if (playlist.length === 0 || !currentSong) return;

    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);

    if (this.isShuffleSubject.value) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);

      this.playSong(playlist[nextIndex]);
    } else if (currentIndex < playlist.length - 1) {
      this.playSong(playlist[currentIndex + 1]);
    } else if (this.repeatModeSubject.value === 'all') {
      this.playSong(playlist[0]);
    }
  }

  previousTrack(): void {
    const playlist = this.playlistSubject.value;
    const currentSong = this.currentSongSubject.value;

    if (playlist.length === 0 || !currentSong) return;

    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);

    if (currentIndex > 0) {
      this.playSong(playlist[currentIndex - 1]);
    } else if (this.repeatModeSubject.value === 'all') {
      this.playSong(playlist[playlist.length - 1]);
    }
  }

  seekTo(percentage: number): void {
    const duration = this.durationSubject.value;
    if (duration > 0) {
      this.audio.currentTime = (percentage / 100) * duration;
    }
  }

  setVolume(value: number): void {
    this.volumeSubject.next(value);
    this.audio.volume = value / 100;
  }

  toggleShuffle(): void {
    this.isShuffleSubject.next(!this.isShuffleSubject.value);
  }

  toggleRepeat(): void {
    const current = this.repeatModeSubject.value;
    if (current === 'off') {
      this.repeatModeSubject.next('all');
    } else {
      this.repeatModeSubject.next('off');
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Getters para valores actuales (sin suscripción)
  get currentSong(): Song | null {
    return this.currentSongSubject.value;
  }

  get isPlaying(): boolean {
    return this.isPlayingSubject.value;
  }

  get playbackContext(): string {
    return this.playbackContextSubject.value;
  }

  get playlist(): Song[] {
    return this.playlistSubject.value;
  }
}
