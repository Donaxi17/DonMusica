import { Component, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DatabaseService, Artist, Song } from '../../services/database.service';
import { PlayerService } from '../../services/player.service';
import { PlaylistService } from '../../services/playlist.service';
import { ItunesService } from '../../services/itunes.service';
import { ToastService } from '../../services/toast.service';
import { OfflineService } from '../../services/offline.service';
import { SpotifyService } from '../../services/spotify.service';
import { LastFmService } from '../../services/lastfm.service';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { Subscription, switchMap, of } from 'rxjs';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SvgIconComponent, AdsContainerComponent],
  templateUrl: './artist-detail.component.html',
  styleUrl: './artist-detail.component.css'
})
export class ArtistDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dbService = inject(DatabaseService);
  public playerService = inject(PlayerService);
  private itunesService = inject(ItunesService);
  private playlistService = inject(PlaylistService);
  private toastService = inject(ToastService);
  public offlineService = inject(OfflineService);
  private spotifyService = inject(SpotifyService);
  private lastFmService = inject(LastFmService);


  artistId = signal<string>('');
  artist = signal<Artist | null>(null);
  songs = signal<Song[]>([]);
  loading = signal<boolean>(true);
  biography = signal<string>('');

  // Stats
  listeners = signal<string>('0');

  // Menu State
  showMenu = signal<boolean>(false);
  activeSongMenu = signal<string | null>(null);
  showPlaylistModal = signal<boolean>(false);
  songToAddToPlaylist = signal<Song | null>(null);

  // Playlists Data
  userPlaylists = signal<{ id: string, name: string }[]>([]);

  currentlyPlayingSong = signal<Song | null>(null);

  // Player State (matching PlayerComponent)
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progress = 0;
  volume = 70;
  isShuffle = false;
  repeatMode: 'off' | 'all' | 'one' = 'off';
  showTimerMenu = false;
  sleepTimer: any = null;
  timerMinutes = 0;

  @ViewChild('progressBarRef') progressBarRef!: ElementRef;
  isDragging = false;

  private sub: Subscription | null = null;

  ngOnInit() {
    // Subscribe to player state
    this.playerService.currentSong$.subscribe(song => {
      this.currentlyPlayingSong.set(song as any); // Cast to any to avoid type mismatch
    });

    this.playerService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
    });

    this.playerService.volume$.subscribe(vol => {
      this.volume = vol;
    });

    this.playerService.isShuffle$.subscribe(shuffle => {
      this.isShuffle = shuffle;
    });

    this.playerService.repeatMode$.subscribe(mode => {
      this.repeatMode = mode;
    });

    this.playerService.currentTime$.subscribe(time => {
      if (!this.isDragging) {
        this.currentTime = time;
      }
    });

    this.playerService.duration$.subscribe(dur => {
      this.duration = dur;
    });

    this.playerService.progress$.subscribe(prog => {
      if (!this.isDragging) {
        this.progress = prog;
      }
    });

    this.sub = this.route.params.subscribe(params => {
      // ... existing code ...

      const id = params['id'];
      if (id) {
        this.artistId.set(id);
        this.loadData(id);

        // Generate consistent monthly listeners based on Artist ID
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
          hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const min = 100000;
        const max = 5000000;
        // Use sin(hash) to get a deterministic pseudo-random number between 0 and 1
        const pseudoRandom = (Math.sin(hash) + 1) / 2;
        const listenerCount = Math.floor(pseudoRandom * (max - min) + min);

        this.listeners.set(listenerCount.toLocaleString());
      }
    });

  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  async downloadOffline(song?: Song) {
    const target = song || this.songs()[0];
    if (!target) return;

    this.showMenu.set(false);
    this.activeSongMenu.set(null);

    // Stop if already downloaded
    if (this.offlineService.isOffline(target.id || '')) {
      this.toastService.info('Esta canción ya está descargada.');
      return;
    }

    let url = target.url || '';
    // Force direct download for Dropbox (Offline Context)
    // Use dl.dropboxusercontent.com for direct blob fetching (CORS friendly)
    if (url.includes('dropbox.com')) {
      url = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      url = url.replace('dropbox.com', 'dl.dropboxusercontent.com'); // Catch-all if www is missing
      // Remove dl parameters if present to avoid confusion, though usually ignored by dl. domain
      url = url.replace(/[?&]dl=[01]/g, '');
      url = url.replace(/[?&]raw=1/g, '');
    }

    const songToDownload = {
      ...target,
      id: target.id || '', // Ensure ID is string
      artistId: this.artistId(),
      img: target.img || this.artist()?.image || '/assets/img/default-music.png',
      url: url,
      artist: target.artist || this.artist()?.name || '',
      title: target.title || '',
      duration: target.duration || ''
    };

    // Navigate to Download Page with Offline Mode
    this.router.navigate(['/download'], {
      state: {
        songTitle: songToDownload.title,
        artistName: songToDownload.artist,
        downloadUrl: url,
        mode: 'offline',
        songData: songToDownload
      }
    });

  }

  isOffline(songId: string): boolean {
    return this.offlineService.isOffline(songId);
  }

  getDownloadProgress(songId: string): number {
    return this.offlineService.downloadProgress()[songId] || 0;
  }

  isDownloading(songId: string): boolean {
    return this.offlineService.isDownloading()[songId] || false;
  }



  loadData(id: string) {
    this.loading.set(true);

    // 1. Get Artist Details first
    this.dbService.getArtists().pipe(
      switchMap(artists => {
        const found = artists.find(a => a.id === id);
        if (found) {
          // Check image and stats logic
          this.spotifyService.getArtistStats(found.name).then(stats => {
            if (stats) {
              this.listeners.set(stats.followers.toLocaleString()); // Set Reat Stats
              if ((!found.image || found.image.includes('default')) && stats.image) {
                found.image = stats.image;
                this.artist.set(found);
              }
            }
          });

          // Fetch Biography from Last.fm
          this.lastFmService.getArtistInfo(found.name).subscribe(info => {
            if (info && info.bio && info.bio.content) {
              this.biography.set(info.bio.summary);
            }
          });

          if (!found.image || found.image.includes('default')) {
            this.itunesService.getArtistImageBestEffort(found.name).subscribe(img => {
              if (img && (!found.image || found.image.includes('default'))) {
                found.image = img;
                this.artist.set(found);
              }
            });
          }
          this.artist.set(found);
          // Only if artist is found, fetch songs
          return this.dbService.getSongs();
        } else {
          this.artist.set(null);
          return of([]); // Return empty if artist not found
        }
      })
    ).subscribe(allSongs => {
      const currentArtist = this.artist();

      if (!currentArtist) {
        this.songs.set([]);
        this.loading.set(false);
        return;
      }

      const artistName = currentArtist.name.toLowerCase().trim();

      const artistSongs = allSongs.filter(s => {
        if (!s.artist) return false;
        const songArtist = s.artist.toLowerCase().trim();

        // Match by Name (Exact or Includes)
        // Check if song artist is exactly the artist name, or contains it (e.g. "Feid" in "Feid ft...")
        // OR if artist name contains song artist (but only if song artist is significant length to avoid "The" matching "The Weeknd")
        const nameMatch = songArtist === artistName ||
          songArtist.includes(artistName) ||
          (songArtist.length > 2 && artistName.includes(songArtist));

        return nameMatch;
      });

      this.songs.set(artistSongs);
      this.loading.set(false);

      // Background Artwork Fetcher
      if (artistSongs.length > 0) {
        this.fetchArtworkForSongs(artistSongs);
      }
    });
  }

  private async fetchArtworkForSongs(songs: any[]) {
    // console.log('🎨 Fetching metadata for', songs.length, 'songs using Spotify API');

    for (const song of songs) {
      if (!song.img || song.img.includes('default') || !song.duration || song.duration === '0:00') {
        try {
          const metadata = await this.spotifyService.getTrackMetadata(song.title, song.artist);
          // ... rest of logic
          if (metadata) {
            if (metadata.image) song.img = metadata.image;
            if (metadata.duration_ms) {
              const minutes = Math.floor(metadata.duration_ms / 60000);
              const seconds = Math.floor((metadata.duration_ms % 60000) / 1000);
              song.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            // Force signal update to refresh UI
            this.songs.set([...this.songs()]);
          }
        } catch (error) {
          // console.error(`❌ Error fetching metadata for ${song.title}:`, error);
        }
      }
    }
    // console.log('✨ Finished fetching metadata');
  }

  playSong(song: Song, index: number) {
    if (!song.url) {
      this.toastService.error('Esta canción no tiene un enlace de reproducción válido.');
      return;
    }

    // console.log('Reproduciendo:', song.title, song.url);

    const queue = this.songs().map(s => {
      const offlineVersion = this.offlineService.getOfflineSong(s.id || '');
      return {
        ...s,
        id: s.id || '',
        artistId: this.artistId(),
        // Ensure required fields for PlayerService
        img: offlineVersion?.imageUrl || s.img || this.artist()?.image || '/assets/img/default-music.png', // Fallback to artist image
        url: offlineVersion?.audioUrl || s.url || '',
        artist: s.artist || '',
        title: s.title || '',
        duration: s.duration || ''
      } as any;
    });

    this.playerService.setPlaylist(queue, false, 'artist');
    this.playerService.playSong(queue[index]);
  }

  playAll() {
    const songs = this.songs();
    if (songs.length > 0) {
      const firstSong = songs[0];
      if (!firstSong.url) {
        console.error('Primera canción no tiene URL válida:', firstSong);
        this.toastService.error('Esta canción no tiene un enlace de reproducción válido.');
        return;
      }
      console.log('PlayAll: Reproduciendo primera canción:', firstSong.title, firstSong.url);
      this.playSong(firstSong, 0);
    } else {
      console.warn('PlayAll: No hay canciones disponibles');
    }
  }

  // --- Menu Actions ---
  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  toggleSongMenu(songId: string, event: Event) {
    event.stopPropagation(); // Evitar reproducir al abrir menú
    if (this.activeSongMenu() === songId) {
      this.activeSongMenu.set(null);
    } else {
      this.activeSongMenu.set(songId);
    }
  }

  downloadSong(song?: Song) {
    const target = song || this.songs()[0];
    if (!target || !target.url) return;

    let url = target.url;
    // Force direct download for Dropbox
    if (url.includes('dropbox.com')) {
      // For file downloads, we MUST use dl=1 to valid 'Content-Disposition: attachment'
      url = url.replace(/dl=0|raw=1/g, 'dl=1');
      if (!url.includes('dl=1')) {
        url = (url.includes('?') ? '&' : '?') + 'dl=1';
      }
    }

    // Close Menu
    this.showMenu.set(false);
    this.activeSongMenu.set(null);

    // Navigate to Download Page
    this.router.navigate(['/download'], {
      state: {
        songTitle: target.title,
        artistName: target.artist || this.artist()?.name,
        downloadUrl: url
      }
    });
  }

  shareSong(song?: Song) {
    const title = song ? song.title : this.artist()?.name;
    const text = `Escucha ${title} en DonMusic!`;

    if (navigator.share) {
      navigator.share({
        title: 'DonMusic',
        text: text,
        url: window.location.href
      });
    } else {
      alert('Enlace copiado al portapapeles');
      navigator.clipboard.writeText(window.location.href);
    }

    this.showMenu.set(false);
    this.activeSongMenu.set(null);
  }

  // --- Playlist Logic ---
  openPlaylistModal(song: Song) {
    this.songToAddToPlaylist.set(song);
    this.userPlaylists.set(this.playlistService.getPlaylists());
    this.showPlaylistModal.set(true);

    this.showMenu.set(false);
    this.activeSongMenu.set(null);
  }

  addToPlaylist(song?: Song) {
    const target = song || this.songs()[0];
    if (!target) return;
    this.openPlaylistModal(target);
  }

  createAndAddPlaylist() {
    const name = prompt('Nombre de la nueva playlist:');
    if (!name) return;

    const newPl = this.playlistService.createPlaylist(name);
    this.userPlaylists.set(this.playlistService.getPlaylists()); // Refresh
    this.selectPlaylist(newPl.id, newPl.name);
  }

  selectPlaylist(playlistId: string, playlistName: string) {
    const song = this.songToAddToPlaylist();
    if (!song) return;

    // Prepare Song
    const songToAdd = {
      ...song,
      artistId: this.artistId(),
      id: song.id || '',
      img: song.img || this.artist()?.image || '/assets/img/default-music.png',
      url: song.url || '',
      artist: song.artist || this.artist()?.name || '',
      title: song.title || '',
      duration: song.duration || ''
    };

    const success = this.playlistService.addSongToPlaylist(playlistId, songToAdd as any);

    if (success) {
      this.toastService.success(`Agregada a "${playlistName}"`);
    } else {
      this.toastService.info(`Ya existe en "${playlistName}"`);
    }

    this.closePlaylistModal();
  }

  closePlaylistModal() {
    this.showPlaylistModal.set(false);
    this.songToAddToPlaylist.set(null);
  }

  isFavorite(songId: string): boolean {
    return this.playlistService.isFavorite(songId);
  }

  toggleFavorite(song: Song, event: Event): void {
    event.stopPropagation();

    if (!song.id) return;

    if (this.isFavorite(song.id)) {
      this.playlistService.removeFromFavorites(song.id);
    } else {
      // Create a valid Song object for PlaylistService
      const favSong = {
        ...song,
        artistId: this.artistId(), // Ensure artistId is present
        id: song.id,
        // Ensure defaults
        img: song.img || this.artist()?.image || '/assets/img/default-music.png',
        url: song.url || '',
        artist: song.artist || this.artist()?.name || '',
        title: song.title || '',
        duration: song.duration || ''
      };
      this.playlistService.addToFavorites(favSong as any);
    }
  }

  // --- Player Controls (matching PlayerComponent) ---

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.playerService.pause();
    } else {
      // If we have a current song, just resume
      if (this.currentlyPlayingSong()) {
        this.playerService.play();
      } else {
        // If not, play the first song if available
        const songs = this.songs();
        if (songs.length > 0) {
          this.playSong(songs[0], 0);
        }
      }
    }
  }

  previousTrack(): void {
    this.playerService.previousTrack();
  }

  nextTrack(): void {
    this.playerService.nextTrack();
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

  // --- Sleep Timer ---

  toggleTimerMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showTimerMenu = !this.showTimerMenu;
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
    this.showTimerMenu = false;
  }

  formatTime(seconds: number): string {
    return this.playerService.formatTime(seconds);
  }

  previousVolume = 70;

  toggleMute() {
    if (this.volume > 0) {
      this.previousVolume = this.volume;
      this.setVolume(0);
    } else {
      this.setVolume(this.previousVolume || 50);
    }
  }
  // --- Seek Bar Logic ---

  startDrag(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.drag(event);
    document.addEventListener('mousemove', this.boundDrag);
    document.addEventListener('mouseup', this.boundStopDrag);
    document.addEventListener('touchmove', this.boundDrag);
    document.addEventListener('touchend', this.boundStopDrag);
  }

  drag(event: MouseEvent | TouchEvent) {
    if (!this.progressBarRef) return;

    const progressBar = this.progressBarRef.nativeElement;
    const rect = progressBar.getBoundingClientRect();
    let clientX = 0;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
    } else if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
    }

    let percentage = ((clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    this.progress = percentage;
    this.currentTime = (percentage / 100) * this.duration;
  }

  stopDrag() {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.boundDrag);
    document.removeEventListener('mouseup', this.boundStopDrag);
    document.removeEventListener('touchmove', this.boundDrag);
    document.removeEventListener('touchend', this.boundStopDrag);

    this.playerService.seekTo(this.progress);
  }

  private boundDrag = (e: MouseEvent | TouchEvent) => this.drag(e);
  private boundStopDrag = () => this.stopDrag();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // If dragging, do not close menus
    if (this.isDragging) return;

    // Close active menus if click is outside
    if (this.activeSongMenu()) {
      this.activeSongMenu.set(null);
    }
    if (this.showMenu()) {
      this.showMenu.set(false);
    }
    if (this.showTimerMenu) {
      this.showTimerMenu = false;
    }
  }
}
