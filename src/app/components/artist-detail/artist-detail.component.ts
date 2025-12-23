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
import { ShareService } from '../../services/share.service';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { Subscription, switchMap, of } from 'rxjs';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { MusicApiService } from '../../services/music-api.service';
import { HapticService } from '../../services/haptic.service';
import { DonMusicaProService } from '../../services/don-musica-pro.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SvgIconComponent, SkeletonComponent, AdsContainerComponent],
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
  private musicApi = inject(MusicApiService);
  private shareService = inject(ShareService);
  private hapticService = inject(HapticService);
  private proService = inject(DonMusicaProService);
  public languageService = inject(LanguageService);


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
      this.toastService.info(this.languageService.get('artist.toast.already_downloaded'));
      return;
    }

    if (!target.url) {
      this.toastService.info(this.languageService.get('home.toast.searching_download'));
      this.musicApi.getBestAudioStream(target.title || '', target.artist || this.artist()?.name || '').subscribe((url: string | null) => {
        if (url) {
          this.navigateToDownload(target, url, 'offline');
        } else {
          this.toastService.error(this.languageService.get('artist.toast.offline_source_not_found'));
        }
      });
      return;
    }

    this.navigateToDownload(target, target.url, 'offline');
  }

  private navigateToDownload(song: Song, url: string, mode: 'default' | 'offline') {
    let finalUrl = url;
    // Force direct download for Dropbox (Offline Context)
    // Use dl.dropboxusercontent.com for direct blob fetching (CORS friendly)
    if (finalUrl.includes('dropbox.com')) {
      if (mode === 'offline') {
        finalUrl = finalUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
        finalUrl = finalUrl.replace('dropbox.com', 'dl.dropboxusercontent.com');
        finalUrl = finalUrl.replace(/[?&]dl=[01]/g, '');
        finalUrl = finalUrl.replace(/[?&]raw=1/g, '');
      } else {
        // Normal download: use dl=1
        finalUrl = finalUrl.replace(/dl=0|raw=1/g, 'dl=1');
        if (!finalUrl.includes('dl=1')) {
          finalUrl = (finalUrl.includes('?') ? '&' : '?') + 'dl=1';
        }
      }
    }

    const songData = {
      ...song,
      id: song.id || '',
      artistId: this.artistId(),
      img: song.img || this.artist()?.image || '/assets/img/default-music.png',
      url: finalUrl,
      artist: song.artist || this.artist()?.name || '',
      title: song.title || '',
      duration: song.duration || ''
    };

    this.router.navigate(['/download'], {
      state: {
        songTitle: songData.title,
        artistName: songData.artist,
        downloadUrl: finalUrl,
        mode: mode,
        songData: songData
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



  // Helper to fix dropbox URLs for images
  private fixDropboxUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.includes('dropbox.com')) {
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=0', 'dl=1');
    }
    return url;
  }

  loadData(id: string) {
    this.loading.set(true);

    const normalize = (str: string) => {
      if (!str) return '';
      return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    };

    // 1. Get Artist Details first
    this.dbService.getArtists().pipe(
      switchMap(artists => {
        const found = artists.find(a => a.id === id);
        if (found) {
          // Fix artist image URL
          found.image = this.fixDropboxUrl(found.image);

          const searchName = normalize(found.name);

          // Fetch real-time stats (Spotify)
          this.spotifyService.getArtistStats(found.name).then(stats => {
            if (stats) {
              this.listeners.set(stats.followers.toLocaleString());
              if (this.isPlaceholder(found.image) && stats.image) {
                found.image = stats.image;
                this.artist.set({ ...found });
              }
            }
          });

          // Fetch Biography (Last.fm)
          this.lastFmService.getArtistInfo(found.name).subscribe(info => {
            if (info?.bio?.content) {
              this.biography.set(info.bio.summary);
            }
          });

          // Fallback image (iTunes)
          if (this.isPlaceholder(found.image)) {
            this.itunesService.getArtistImageBestEffort(found.name).subscribe(img => {
              if (img && this.isPlaceholder(this.artist()?.image)) {
                found.image = img;
                this.artist.set({ ...found });
              }
            });
          }

          this.artist.set(found);
          return this.dbService.getSongs().pipe(
            switchMap(allSongs => {
              const artistSongs = allSongs.filter(s => {
                if (!s.artist) return false;
                const songArtist = normalize(s.artist);
                // Robust matching: exact, containing, or contained
                return songArtist === searchName ||
                  songArtist.includes(searchName) ||
                  (searchName.length > 2 && searchName.includes(songArtist));
              });
              return of(artistSongs);
            })
          );
        } else {
          this.artist.set(null);
          return of([]);
        }
      })
    ).subscribe(artistSongs => {
      const artistImg = this.artist()?.image;
      const songsWithId = artistSongs.map(s => {
        // Fix song image URL first
        const fixedSongImg = this.fixDropboxUrl(s.img);

        return {
          ...s,
          artistId: this.artistId(),
          // Immediate fallback to artist image if song image is placeholder or missing
          img: this.isPlaceholder(fixedSongImg) ? artistImg : fixedSongImg
        };
      });

      this.songs.set(songsWithId);
      this.loading.set(false);

      // Fetch high-quality metadata/artwork from Spotify
      if (songsWithId.length > 0) {
        this.fetchArtworkForSongs(songsWithId);
      }
    });
  }

  private async fetchArtworkForSongs(songs: any[]) {
    // console.log('🎨 Fetching metadata for', songs.length, 'songs using Spotify API');

    for (const song of songs) {
      const isArtistFallback = song.img === this.artist()?.image;
      if (this.isPlaceholder(song.img) || isArtistFallback || !song.duration || song.duration === '0:00') {
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
    this.hapticService.medium();
    if (!song.url) {
      this.toastService.error(this.languageService.get('artist.toast.no_valid_link'));
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
        this.toastService.error(this.languageService.get('artist.toast.no_valid_link'));
        return;
      }
      // console.log('PlayAll: Reproduciendo primera canción:', firstSong.title, firstSong.url);
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
    this.hapticService.light();
    event.stopPropagation(); // Evitar reproducir al abrir menú
    if (this.activeSongMenu() === songId) {
      this.activeSongMenu.set(null);
    } else {
      this.activeSongMenu.set(songId);
    }
  }

  downloadSong(song?: Song) {
    const target = song || this.songs()[0];
    if (!target) return;

    // Close Menu
    this.showMenu.set(false);
    this.activeSongMenu.set(null);

    if (!target.url) {
      this.toastService.info(this.languageService.get('home.toast.searching_download'));
      this.musicApi.getBestAudioStream(target.title || '', target.artist || this.artist()?.name || '').subscribe((url: string | null) => {
        if (url) {
          this.navigateToDownload(target, url, 'default');
        } else {
          this.toastService.error(this.languageService.get('home.toast.download_not_found'));
        }
      });
      return;
    }

    this.navigateToDownload(target, target.url, 'default');
  }

  shareSong(song?: Song) {
    const target = song || this.currentlyPlayingSong() as any;
    if (target) {
      this.shareService.shareSong(target as any);
    } else {
      this.toastService.warning(this.languageService.get('artist.toast.no_song_share'));
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
      this.toastService.success(this.languageService.get('artist.toast.added_to', playlistName));
    } else {
      this.toastService.info(this.languageService.get('artist.toast.already_in', playlistName));
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
    this.hapticService.medium();
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
    this.hapticService.light();
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
    this.hapticService.medium();
    this.playerService.previousTrack();
  }

  nextTrack(): void {
    this.hapticService.medium();
    this.playerService.nextTrack();
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
    this.hapticService.light();
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

  goToArtistDetail(song: Song | null) {
    if (!song) return;
    this.hapticService.medium();
    if (song.artistId && song.artistId !== '0' && song.artistId !== 0) {
      if (song.artistId === this.artistId()) return; // Already here
      this.router.navigate(['/artist', song.artistId]);
    } else {
      // Fallback: search by name
      this.router.navigate(['/artists'], { queryParams: { q: song.artist } });
    }
  }

  openPlayer() {
    this.hapticService.light();
    this.router.navigate(['/player']);
  }

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
  }

  isPlaceholder(url: string | undefined): boolean {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes('default') ||
      lower.includes('placeholder') ||
      lower.includes('base64') ||
      lower.includes('placehold.co') ||
      lower.includes('storageimagedisplay.com');
  }
}
