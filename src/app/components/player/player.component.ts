import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { PlaylistService, Song } from '../../services/playlist.service';
import { ALL_SONGS } from '../../models/songs.data';
import { ARTISTS_DATA, Artist } from '../../models/artists.data';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent implements OnInit, OnDestroy {
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

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public playerService: PlayerService,
    public playlistService: PlaylistService
  ) { }

  ngOnInit(): void {
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
      }),
      this.playerService.currentTime$.subscribe(time => {
        this.currentTime = time;
      }),
      this.playerService.duration$.subscribe(dur => {
        this.duration = dur;
      }),
      this.playerService.progress$.subscribe(prog => {
        this.progress = prog;
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
    if (this.isPlaying) {
      this.playerService.pause();
    } else {
      this.playerService.play();
    }
  }

  previousTrack(): void {
    this.playerService.previousTrack();
  }

  nextTrack(): void {
    this.playerService.nextTrack();
  }

  seekTo(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const clickPosition = event.offsetX;
    const barWidth = progressBar.offsetWidth;
    const percentage = (clickPosition / barWidth) * 100;

    this.playerService.seekTo(percentage);
  }

  setVolume(value: number): void {
    this.playerService.setVolume(value);
  }

  toggleShuffle(): void {
    this.playerService.toggleShuffle();
  }

  toggleRepeat(): void {
    this.playerService.toggleRepeat();
  }

  toggleFavorite(song: Song): void {
    if (this.playlistService.isFavorite(song.id)) {
      this.playlistService.removeFromFavorites(song.id);
    } else {
      this.playlistService.addToFavorites(song);
    }
  }

  isFavorite(songId: number | string): boolean {
    return this.playlistService.isFavorite(songId);
  }

  downloadMusic(song: Song): void {
    this.router.navigate(['/download'], {
      state: {
        songTitle: song.title,
        artistName: song.artist,
        downloadUrl: song.url
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/artists']);
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
    this.cancelTimer();
    this.timerMinutes = minutes;
    this.showTimerMenu = false;

    if (minutes > 0) {
      this.sleepTimer = setTimeout(() => {
        this.playerService.pause();
        this.timerMinutes = 0;
        this.sleepTimer = null;
      }, minutes * 60 * 1000);
    }
  }

  cancelTimer(): void {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
    }
    this.timerMinutes = 0;
    this.timerMinutes = 0;
    this.showTimerMenu = false;
  }

  onImageError(event: any) {
    this.imageLoadError = true;
  }
}
