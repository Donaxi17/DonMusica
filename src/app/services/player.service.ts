import { Injectable, inject, Injector } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
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


  constructor(private musicApi: MusicApiService) {
    this.initializeAudioListeners();
    this.setupMediaSession();
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
      if (!this.isPlayingSubject.value) {
        this.resume();
      }
      return;
    } else {
      this.currentSongSubject.next(song);
      this.updateMediaSessionMetadata(song);
      this.enrichSongMetadata(song);

      // Reset progress to avoid showing old song's position
      this.currentTimeSubject.next(0);
      this.progressSubject.next(0);
      this.durationSubject.next(0);

      const currentUrl = this.router.url;
      const isBrowseContext = currentUrl.includes('/browse');

      if (!isBrowseContext) {
        this.historyService.addToHistory(song, this.playbackContextSubject.value);
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
    this.progressSubject.next(0);
    this.currentTimeSubject.next(0);
    this.durationSubject.next(0);
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
      // Fin de la lista y no hay repetición: intentar Auto-Play
      this.handleAutoPlay(currentSong, playlist);
    }
  }

  private handleAutoPlay(currentSong: Song, currentPlaylist: Song[]) {
    const context = this.playbackContextSubject.value;

    // Si ya estamos cargando o procesando algo similar, salimos
    if (context === 'autoplay-loading') return;

    // No auto-reproducir más si es una colección personal (Playlists, Favoritos, Offline, etc.)
    // o si el usuario buscó algo específico. Queremos que el reproductor se detenga.
    const restrictedContexts = ['playlists', 'upload-music', 'offline-music', 'history', 'free-music', 'lyrics'];
    if (this.isFavoritesPlayingSubject.value || restrictedContexts.includes(context)) {
      this.isPlayingSubject.next(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
      return;
    }

    this.dbService.getSongsByArtist(currentSong.artist)
      .pipe(take(1))
      .subscribe(dbSongs => {
        // Convert DB songs to Playlist songs
        const validSongs: Song[] = dbSongs.map(s => ({
          ...s,
          id: s.id || '',
        } as unknown as Song)).filter(s => s.id !== '');

        const existingIds = new Set(currentPlaylist.map(s => String(s.id)));
        const newSongs = validSongs.filter(s => !existingIds.has(String(s.id)));

        if (newSongs.length > 0) {
          const shuffledNewSongs = newSongs.sort(() => Math.random() - 0.5);
          const updatedPlaylist = [...currentPlaylist, ...shuffledNewSongs];
          this.playlistSubject.next(updatedPlaylist);
          this.toastService.info(`Reproduciendo más de ${currentSong.artist}`);

          if (shuffledNewSongs.length > 0) {
            this.playSong(shuffledNewSongs[0]);
          }
        } else {
          this.isPlayingSubject.next(false);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'none';
          }
        }
      });
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
    if (!this.audio) return;

    // Use audio duration if available, fallback to internal duration subject
    const duration = this.audio.duration || this.durationSubject.value;

    if (duration && isFinite(duration) && duration > 0) {
      const wasPlaying = !this.audio.paused;
      const targetTime = (percentage / 100) * duration;

      try {
        this.audio.currentTime = targetTime;

        // Force an immediate update to all listeners
        this.progressSubject.next(percentage);
        this.currentTimeSubject.next(targetTime);

        if (wasPlaying && this.audio.paused) {
          this.audio.play().catch(e => console.warn('Play interrupted after seek:', e));
        }
      } catch (err) {
        console.error('Seek error:', err);
      }
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

  private lastToggleTime = 0;

  toggleShuffle(): void {
    const now = Date.now();
    if (now - this.lastToggleTime < 300) return;
    this.lastToggleTime = now;
    this.isShuffleSubject.next(!this.isShuffleSubject.value);
  }

  toggleRepeat(): void {
    const now = Date.now();
    if (now - this.lastToggleTime < 300) return;
    this.lastToggleTime = now;

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
