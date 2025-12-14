import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DatabaseService, Artist, Song } from '../../services/database.service';
import { PlayerService } from '../../services/player.service';
import { PlaylistService } from '../../services/playlist.service';
import { ItunesService } from '../../services/itunes.service';
import { ToastService } from '../../services/toast.service';
import { OfflineService } from '../../services/offline.service';
import { SpotifyService } from '../../services/spotify.service';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SvgIconComponent],
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


  artistId = signal<string>('');
  artist = signal<Artist | null>(null);
  songs = signal<Song[]>([]);
  loading = signal<boolean>(true);

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
      this.currentTime = time;
    });

    this.playerService.duration$.subscribe(dur => {
      this.duration = dur;
    });

    this.playerService.progress$.subscribe(prog => {
      this.progress = prog;
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
    if (await this.offlineService.isOffline(target.id || '')) {
      this.toastService.info('Esta canción ya está descargada.');
      return;
    }

    const songToDownload = {
      ...target,
      id: target.id || '',
      artistId: this.artistId(),
      img: target.img || this.artist()?.image || '/assets/img/default-music.png',
      url: target.url || '',
      artist: target.artist || this.artist()?.name || '',
      title: target.title || '',
      duration: target.duration || ''
    };

    // Navigate to Download Page with Offline Mode
    this.router.navigate(['/download'], {
      state: {
        songTitle: songToDownload.title,
        artistName: songToDownload.artist,
        downloadUrl: songToDownload.url,
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

    // 1. Get Artist Details
    this.dbService.getArtists().subscribe(artists => {
      const found = artists.find(a => a.id === id);
      if (found) {
        // Check image
        if (!found.image || found.image.includes('default')) {
          this.itunesService.getArtistImageBestEffort(found.name).subscribe(img => {
            if (img) found.image = img;
            this.artist.set(found);
          });
        } else {
          this.artist.set(found);
        }
      }
    });

    // 2. Get Songs
    this.dbService.getSongs().subscribe(allSongs => {
      // Filter songs by artist name or ID with loose matching
      const currentArtist = this.artist();
      const artistName = currentArtist?.name?.toLowerCase().trim() || '';
      const artistId = this.artistId();

      const artistSongs = allSongs.filter(s => {
        if (!s.artist) return false;
        const songArtist = s.artist.toLowerCase().trim();

        // Match by Name (Exact or Includes)
        const nameMatch = songArtist === artistName || songArtist.includes(artistName) || artistName.includes(songArtist);

        // Match by ID (if song has artistId stored, though typically it might not yet)
        // const idMatch = s.artistId === artistId; 

        return nameMatch;
      });

      this.songs.set(artistSongs);
      this.loading.set(false);

      // Background Artwork Fetcher from iTunes
      this.fetchArtworkForSongs(artistSongs);
    });
  }

  private async fetchArtworkForSongs(songs: any[]) {
    console.log('🎨 Fetching artwork for', songs.length, 'songs using Spotify API');

    for (const song of songs) {
      try {
        console.log(`🔍 Searching Spotify for: "${song.title}" by "${song.artist}"`);
        const artwork = await this.spotifyService.getTrackArtwork(song.title, song.artist);

        if (artwork) {
          console.log(`✅ Found artwork for "${song.title}":`, artwork);
          song.img = artwork;
          // Force signal update to refresh UI
          this.songs.set([...this.songs()]);
        } else {
          console.log(`❌ No artwork found for "${song.title}"`);
        }
      } catch (error) {
        console.error(`❌ Error fetching artwork for ${song.title}:`, error);
      }
    }

    console.log('✨ Finished fetching artwork');
  }

  playSong(song: Song, index: number) {
    if (!song.url) {
      alert('Esta canción no tiene un enlace de reproducción válido.');
      return;
    }

    console.log('Reproduciendo:', song.title, song.url);

    // Map DbSong to PlayerSong (adding artistId)
    const queue = this.songs().map(s => ({
      ...s,
      id: s.id || '',
      artistId: this.artistId(),
      // Ensure required fields for PlayerService
      img: s.img || this.artist()?.image || '/assets/img/default-music.png', // Fallback to artist image
      url: s.url || '',
      artist: s.artist || '',
      title: s.title || '',
      duration: s.duration || ''
    } as any));

    this.playerService.setPlaylist(queue, false, 'artist');
    this.playerService.playSong(queue[index]);
  }

  playAll() {
    const songs = this.songs();
    if (songs.length > 0) {
      const firstSong = songs[0];
      if (!firstSong.url) {
        console.error('Primera canción no tiene URL válida:', firstSong);
        alert('Esta canción no tiene un enlace de reproducción válido.');
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
      if (url.includes('dl=0')) url = url.replace('dl=0', 'dl=1');
      else if (!url.includes('dl=1')) url = (url.includes('?') ? '&' : '?') + 'dl=1';
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
      this.playerService.play();
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
}
