import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { PlaylistService, Song } from '../../services/playlist.service';
import { OfflineService } from '../../services/offline.service';
import { ALL_SONGS } from '../../models/songs.data';
import { ARTISTS_DATA, Artist } from '../../models/artists.data';
import { Subscription } from 'rxjs';
import { MusicApiService } from '../../services/music-api.service';
import { ToastService } from '../../services/toast.service';
import { HapticService } from '../../services/haptic.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild('progressBarRef') progressBarRef!: ElementRef<HTMLElement>;

  currentSong: Song | null = null;
  playlist: Song[] = [];
  currentArtist: Artist | null = null;

  // Estado del reproductor
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progress = 0;
  volume = 70;
  isShuffle = false;
  repeatMode: 'off' | 'all' | 'one' = 'off';
  isFavoritesPlaying = false;
  showTimerMenu = false;
  sleepTimer: any = null;
  timerMinutes = 0;
  imageLoadError = false;
  isDragging = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public playerService: PlayerService,
    public playlistService: PlaylistService,
    private musicApi: MusicApiService,
    private toastService: ToastService,
    private offlineService: OfflineService,
    private hapticService: HapticService
  ) { }

  ngOnInit(): void {
    // ... (rest of ngOnInit)
    // Suscribirse a los cambios de query params
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        const artistId = params['artistId'];
        if (artistId) {
          this.loadArtistSongs(+artistId);
        }
      })
    );

    // Suscribirse al estado del reproductor
    this.subscriptions.push(
      this.playerService.currentSong$.subscribe(song => {
        this.currentSong = song;
        this.imageLoadError = false;
      }),
      this.playerService.isPlaying$.subscribe(playing => {
        this.isPlaying = playing;
      }),
      this.playerService.playlist$.subscribe(playlist => {
        this.playlist = playlist;
        // Si la lista está vacía y estamos en la ruta /player, volver atrás
        if (playlist.length === 0 && this.router.url.includes('/player')) {
          this.goBack();
        }
      }),
      this.playerService.currentTime$.subscribe(time => {
        // Only update current time if not dragging to prevent stutter
        if (!this.isDragging) {
          this.currentTime = time;
        }
      }),
      this.playerService.duration$.subscribe(dur => {
        this.duration = dur;
      }),
      this.playerService.progress$.subscribe(prog => {
        // Only update progress if not dragging
        if (!this.isDragging) {
          this.progress = prog;
        }
      }),
      this.playerService.volume$.subscribe(vol => {
        this.volume = vol;
      }),
      this.playerService.isShuffle$.subscribe(shuffle => {
        this.isShuffle = shuffle;
      }),
      this.playerService.repeatMode$.subscribe(mode => {
        this.repeatMode = mode;
      }),
      this.playerService.isFavoritesPlaying$.subscribe(isFav => {
        this.isFavoritesPlaying = isFav;
      }),
      this.playerService.sleepTimerRemaining$.subscribe(mins => {
        this.timerMinutes = mins;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadArtistSongs(artistId: number): void {
    // Buscar el artista
    this.currentArtist = ARTISTS_DATA.find(a => a.id === artistId) || null;

    // Filtrar canciones del artista
    const artistSongs = ALL_SONGS.filter(song => song.artistId === artistId);

    if (artistSongs.length > 0) {
      // Configurar playlist en el servicio
      this.playerService.setPlaylist(artistSongs, false);

      // Reproducir la primera canción automáticamente
      this.playerService.playSong(artistSongs[0]);
    }
  }

  playSong(song: Song): void {
    this.playerService.playSong(song);
  }

  togglePlayPause(): void {
    this.hapticService.light();
    if (this.isPlaying) {
      this.playerService.pause();
    } else {
      this.playerService.play();
    }
  }

  previousTrack(): void {
    this.hapticService.medium();
    this.playerService.previousTrack();
  }

  nextTrack(): void {
    this.hapticService.medium();
    this.playerService.nextTrack();
  }

  // --- Drag & Seek Logic ---

  startDrag(event: MouseEvent | TouchEvent): void {
    this.hapticService.light();
    this.isDragging = true;
    this.updateProgressFromEvent(event);
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent): void {
    if (this.isDragging) {
      this.updateProgressFromEvent(event);
    }
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  stopDrag(): void {
    if (this.isDragging) {
      this.isDragging = false;
      // Commit the seek on drag end
      this.playerService.seekTo(this.progress);
    }
  }

  private updateProgressFromEvent(event: MouseEvent | TouchEvent): void {
    if (!this.progressBarRef) return;

    const progressBar = this.progressBarRef.nativeElement;
    const rect = progressBar.getBoundingClientRect();

    let clientX: number;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
    } else {
      clientX = event.touches[0].clientX;
    }

    // Calculate position
    const clickPosition = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (clickPosition / rect.width) * 100;

    // Update local UI state immediately for smooth dragging
    this.progress = percentage;
    this.currentTime = (this.duration * percentage) / 100;
  }


  setVolume(value: number): void {
    this.playerService.setVolume(value);
  }

  toggleShuffle(): void {
    this.hapticService.light();
    this.playerService.toggleShuffle();
  }

  toggleRepeat(event?: Event): void {
    this.hapticService.light();
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.playerService.toggleRepeat();
  }

  toggleFavorite(song: Song): void {
    this.hapticService.medium();
    if (this.playlistService.isFavorite(song.id)) {
      this.playlistService.removeFromFavorites(song.id);
    } else {
      this.playlistService.addToFavorites(song);
    }
  }

  isFavorite(songId: number | string): boolean {
    return this.playlistService.isFavorite(songId);
  }

  isOffline(songId: number | string): boolean {
    return this.offlineService.offlineSongs().some(s => s.id === songId);
  }

  downloadMusic(song: Song): void {
    if (!song.url) {
      this.musicApi.getBestAudioStream(song.title, song.artist).subscribe((url: string | null) => {
        if (url) {
          this.navigateToDownload(song, url, 'default');
        } else {
          this.toastService.error('No se pudo encontrar una fuente de descarga para esta canción');
        }
      });
      return;
    }
    this.navigateToDownload(song, song.url, 'default');
  }

  downloadOffline(song: Song): void {
    if (!song.url) {
      this.musicApi.getBestAudioStream(song.title, song.artist).subscribe((url: string | null) => {
        if (url) {
          this.navigateToDownload(song, url, 'offline');
        } else {
          this.toastService.error('No se pudo encontrar una fuente para guardar offline');
        }
      });
      return;
    }
    this.navigateToDownload(song, song.url, 'offline');
  }

  private navigateToDownload(song: Song, url: string | null, mode: 'default' | 'offline'): void {
    // Create a copy of the song with the correct URL for the download page
    const songWithUrl = { ...song, url: url || song.url };

    this.router.navigate(['/download'], {
      state: {
        songTitle: song.title,
        artistName: song.artist,
        downloadUrl: url,
        mode: mode,
        songData: songWithUrl
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  formatTime(seconds: number): string {
    return this.playerService.formatTime(seconds);
  }

  toggleTimerMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showTimerMenu = !this.showTimerMenu;
  }

  @HostListener('document:click')
  closeTimerMenu(): void {
    if (this.showTimerMenu) {
      this.showTimerMenu = false;
    }
  }

  setSleepTimer(minutes: number): void {
    this.playerService.setSleepTimer(minutes);
    this.showTimerMenu = false;
  }

  cancelTimer(): void {
    this.playerService.cancelSleepTimer();
    this.showTimerMenu = false;
  }

  onImageError(event: any) {
    this.imageLoadError = true;
  }

  goToArtistDetail() {
    this.hapticService.medium();
    if (this.currentSong && (this.currentSong.artistId || this.currentSong.artist)) {
      if (this.currentSong.artistId && this.currentSong.artistId !== 0 && this.currentSong.artistId !== '0') {
        this.router.navigate(['/artist', this.currentSong.artistId]);
      } else {
        // Fallback: search by name
        this.router.navigate(['/artists'], { queryParams: { q: this.currentSong.artist } });
      }
    }
  }
}
