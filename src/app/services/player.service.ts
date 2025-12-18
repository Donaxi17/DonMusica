import { Injectable, inject, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from './playlist.service';
import { MusicApiService } from './music-api.service';
import { ToastService } from './toast.service';
import { VideoPlayerService } from './video-player.service';
import { OfflineService } from './offline.service';
import { HistoryService } from './history.service';
import { Router } from '@angular/router';
import { SpotifyService } from './spotify.service';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio = new Audio();
  private router = inject(Router);
  private toastService = inject(ToastService);
  private injector = inject(Injector);
  private offlineService = inject(OfflineService);
  private historyService = inject(HistoryService);
  private spotifyService = inject(SpotifyService);
  private dbService = inject(DatabaseService);

  // Lazy getter to avoid circular dependency
  private get videoPlayerService() {
    return this.injector.get(VideoPlayerService);
  }

  // Estado del reproductor
  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private playlistSubject = new BehaviorSubject<Song[]>([]);
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);
  private progressSubject = new BehaviorSubject<number>(0);
  private volumeSubject = new BehaviorSubject<number>(100);
  private isShuffleSubject = new BehaviorSubject<boolean>(false);
  private repeatModeSubject = new BehaviorSubject<'off' | 'all' | 'one'>('off');
  private isFavoritesPlayingSubject = new BehaviorSubject<boolean>(false);
  private playbackContextSubject = new BehaviorSubject<string>('unknown');
  private isMutedSubject = new BehaviorSubject<boolean>(false);
  private smartShuffleArtistsSubject = new BehaviorSubject<any[]>([]);
  private lastVolume = 100;

  // Sleep Timer
  private sleepTimerRemainingSubject = new BehaviorSubject<number>(0);
  private sleepTimerInterval: any = null;

  // Observables públicos
  currentSong$ = this.currentSongSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  playlist$ = this.playlistSubject.asObservable();
  currentTime$ = this.currentTimeSubject.asObservable();
  duration$ = this.durationSubject.asObservable();
  progress$ = this.progressSubject.asObservable();
  volume$ = this.volumeSubject.asObservable();
  isMuted$ = this.isMutedSubject.asObservable();
  isShuffle$ = this.isShuffleSubject.asObservable();
  repeatMode$ = this.repeatModeSubject.asObservable();
  isFavoritesPlaying$ = this.isFavoritesPlayingSubject.asObservable();
  playbackContext$ = this.playbackContextSubject.asObservable();
  sleepTimerRemaining$ = this.sleepTimerRemainingSubject.asObservable();

  constructor(private musicApi: MusicApiService) {
    this.initializeAudioListeners();
    this.setupMediaSession();
    this.initSleepTimer();
  }

  private initSleepTimer(): void {
    const sleepEndTime = localStorage.getItem('sleepTimerEndTime');
    if (sleepEndTime) {
      const endTime = parseInt(sleepEndTime, 10);
      const now = Date.now();
      if (endTime > now) {
        const remaining = Math.round((endTime - now) / 60000);
        this.sleepTimerRemainingSubject.next(remaining);
        this.startTimerInterval(endTime);
      } else {
        localStorage.removeItem('sleepTimerEndTime');
      }
    }
  }

  setSleepTimer(minutes: number): void {
    this.cancelSleepTimer();
    if (minutes <= 0) return;

    const endTime = Date.now() + minutes * 60 * 1000;
    localStorage.setItem('sleepTimerEndTime', endTime.toString());
    this.sleepTimerRemainingSubject.next(minutes);
    this.startTimerInterval(endTime);
    this.toastService.info(`Temporizador configurado para ${minutes} minutos`);
  }

  cancelSleepTimer(): void {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }
    localStorage.removeItem('sleepTimerEndTime');
    this.sleepTimerRemainingSubject.next(0);
  }

  private startTimerInterval(endTime: number): void {
    if (this.sleepTimerInterval) clearInterval(this.sleepTimerInterval);

    this.sleepTimerInterval = setInterval(() => {
      const now = Date.now();
      if (now >= endTime) {
        this.pause();
        this.cancelSleepTimer();
      } else {
        const remaining = Math.ceil((endTime - now) / 60000);
        if (remaining !== this.sleepTimerRemainingSubject.value) {
          this.sleepTimerRemainingSubject.next(remaining);
        }
      }
    }, 1000); // Check every second for accuracy
  }

  private initializeAudioListeners(): void {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeSubject.next(this.audio.currentTime);
      this.durationSubject.next(this.audio.duration || 0);
      const progress = this.audio.duration > 0
        ? (this.audio.currentTime / this.audio.duration) * 100
        : 0;
      this.progressSubject.next(progress);
    });

    this.audio.addEventListener('ended', () => {
      const mode = this.repeatModeSubject.value;
      if (mode === 'one') {
        this.audio.currentTime = 0;
        this.play();
        this.repeatModeSubject.next('off'); // Deshabilitar después de repetir una vez
        this.toastService.info('Repetido una vez. Repetición desactivada.');
      } else {
        this.nextTrack();
      }
    });

    this.audio.addEventListener('error', () => {
      const error = this.audio.error;
      console.warn('Audio playback error:', error);

      this.isPlayingSubject.next(false);

      // Only skip if we are supposedly playing and it's a real loading error
      if (this.currentSongSubject.value) {
        this.toastService.error('Error al cargar esta canción. Saltando a la siguiente...');
        setTimeout(() => this.nextTrack(), 1500);
      }
    });

    this.audio.volume = this.volumeSubject.value / 100;
    this.audio.preload = 'auto';
  }

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

  // ========== CONTROLES DE REPRODUCCIÓN ==========

  playSong(song: Song): void {
    try {
      this.videoPlayerService.closeVideo();
    } catch (e) { }

    const currentSong = this.currentSongSubject.value;

    if (currentSong?.id === song.id) {
      this.togglePlay();
    } else {
      this.currentSongSubject.next(song);
      this.updateMediaSessionMetadata(song);
      this.enrichSongMetadata(song);

      const currentUrl = this.router.url;
      const isBrowseContext = currentUrl.includes('/browse');

      if (!isBrowseContext) {
        this.historyService.addToHistory(song);
      }

      const offlineSong = this.offlineService.getOfflineSong(String(song.id || ''));
      let finalUrl = song.url;

      if (offlineSong && offlineSong.audioUrl) {
        finalUrl = offlineSong.audioUrl;
      } else if (song.url) {
        if (finalUrl.includes('dropbox.com')) {
          // Asegurar host directo para evitar problemas de CORS y redirects en localhost
          finalUrl = finalUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');

          if (finalUrl.includes('?')) {
            finalUrl = finalUrl.replace(/dl=[01]/g, 'dl=1');
            finalUrl = finalUrl.replace(/raw=[01]/g, 'dl=1');
            if (!finalUrl.includes('dl=1')) {
              finalUrl += '&dl=1';
            }
          } else {
            finalUrl += '?dl=1';
          }
        }
      }

      if (finalUrl) {
        this.audio.src = finalUrl;
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
      .catch(error => {
        console.error('Error al reproducir:', error);
        this.isPlayingSubject.next(false);
        if (this.audio.src.startsWith('blob:') && error.name === 'NotSupportedError') {
          this.toastService.error('Archivo dañado. Re-descárgalo.');
        } else {
          this.toastService.error('Error al reproducir.');
        }
      });
  }

  pause(): void {
    this.audio.pause();
    this.isPlayingSubject.next(false);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  }

  resume(): void {
    this.play();
  }

  togglePlay(): void {
    if (this.isPlayingSubject.value) {
      this.pause();
    } else {
      this.resume();
    }
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

  nextTrack(): void {
    const playlist = this.playlistSubject.value;
    const currentSong = this.currentSongSubject.value;
    if (playlist.length === 0 || !currentSong) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);

    if (this.isShuffleSubject.value) {
      let nextIndex;
      do { nextIndex = Math.floor(Math.random() * playlist.length); }
      while (nextIndex === currentIndex && playlist.length > 1);
      this.playSong(playlist[nextIndex]);
    } else if (currentIndex < playlist.length - 1) {
      this.playSong(playlist[currentIndex + 1]);
    } else if (this.repeatModeSubject.value === 'all') {
      this.playSong(playlist[0]);
    } else {
      // Fin de la lista y no hay repetición: detener estado "reproduciendo"
      this.isPlayingSubject.next(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
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

  seek(time: number): void {
    if (this.audio && !isNaN(time)) {
      this.audio.currentTime = time;
    }
  }

  seekTo(percentage: number): void {
    const duration = this.audio.duration;
    if (duration > 0) {
      this.audio.currentTime = (percentage / 100) * duration;
    }
  }

  setVolume(value: number): void {
    this.volumeSubject.next(value);
    this.audio.volume = value / 100;
  }

  toggleMute(): void {
    const currentlyMuted = this.isMutedSubject.value;
    if (currentlyMuted) {
      this.setVolume(this.lastVolume);
      this.isMutedSubject.next(false);
    } else {
      this.lastVolume = this.volumeSubject.value;
      this.setVolume(0);
      this.isMutedSubject.next(true);
    }
  }

  toggleShuffle(): void {
    this.isShuffleSubject.next(!this.isShuffleSubject.value);
  }

  toggleRepeat(): void {
    const current = this.repeatModeSubject.value;
    if (current === 'off') {
      this.repeatModeSubject.next('one');
      this.toastService.info('Se repetirá una vez');
    } else {
      this.repeatModeSubject.next('off');
      this.toastService.info('Repetición desactivada');
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Getters
  get isShuffle(): boolean { return this.isShuffleSubject.value; }
  get currentSong(): Song | null { return this.currentSongSubject.value; }
  get isPlaying(): boolean { return this.isPlayingSubject.value; }
  get playbackContext(): string { return this.playbackContextSubject.value; }
  get playlist(): Song[] { return this.playlistSubject.value; }
  get smartShuffleArtists(): any[] { return this.smartShuffleArtistsSubject.value; }
  public getArtistImageForSong(song: Song): string | null {
    if (!song) return null;
    const artists = this.smartShuffleArtistsSubject.value;
    if (!artists || artists.length === 0) return null;

    const songArtist = (song.artist || '').toLowerCase();
    const foundArtist = artists.find(a => {
      const aName = (a.name || '').toLowerCase();
      return aName === songArtist ||
        songArtist.includes(aName) ||
        aName.includes(songArtist);
    });
    return foundArtist?.image || null;
  }

  private async enrichSongMetadata(song: Song) {
    if (!song) return;

    // Check if we need better artwork
    const needsArtwork = !song.img ||
      song.img.trim() === '' ||
      song.img.includes('default-music') ||
      song.img.includes('icon-512x512') ||
      song.img.includes('default-artist');

    if (needsArtwork) {
      // Step 1: Immediate artist fallback for Smart Shuffle (don't wait for Spotify)
      if (this.playbackContextSubject.value.startsWith('smart-shuffle')) {
        const artistImg = this.getArtistImageForSong(song);
        if (artistImg && song.img !== artistImg) {
          song.img = artistImg;
          this.currentSongSubject.next({ ...song });
          this.updateMediaSessionMetadata(song);
        }
      }

      // Step 2: Fetch high-quality artwork from Spotify
      try {
        const artwork = await this.spotifyService.getTrackArtwork(song.title, song.artist);
        if (artwork && artwork !== song.img) {
          song.img = artwork;
          this.currentSongSubject.next({ ...song });
          this.updateMediaSessionMetadata(song);
        }
      } catch (e) {
        console.warn('Spotify enrich failed:', e);
      }
    }
  }

  setSmartShuffleArtists(artists: any[]) {
    this.smartShuffleArtistsSubject.next(artists);
  }
}
