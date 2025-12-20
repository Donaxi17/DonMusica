import { Component, inject, signal, OnInit, ChangeDetectorRef, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../services/seo.service';
import { VoiceRecognitionService } from '../../services/voice-recognition.service';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';

import { RouterModule } from '@angular/router';
import { NetworkService } from '../../services/network.service';
import { NoConnectionComponent } from '../shared/no-connection/no-connection.component';
import { DatabaseService, Artist, Song } from '../../services/database.service';
import { combineLatest } from 'rxjs';
import { ItunesService } from '../../services/itunes.service';
import { SpotifyService } from '../../services/spotify.service';
import { PlayerService } from '../../services/player.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { HapticService } from '../../services/haptic.service';

import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { SmartShuffleComponent } from '../shared/smart-shuffle/smart-shuffle.component';
import { VoiceVisualizerComponent } from '../shared/voice-waveform/voice-waveform.component';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [NoConnectionComponent, CommonModule, FormsModule, SvgIconComponent, RouterModule, AdsContainerComponent, SkeletonComponent, SmartShuffleComponent, VoiceVisualizerComponent],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.css'
})
export class ArtistsComponent implements OnInit {
  private seoService = inject(SeoService);
  private voiceService = inject(VoiceRecognitionService);
  private cdr = inject(ChangeDetectorRef);
  networkService = inject(NetworkService);
  private dbService = inject(DatabaseService);
  private itunesService = inject(ItunesService);
  private spotifyService = inject(SpotifyService);
  private hapticService = inject(HapticService);
  private playerService = inject(PlayerService);
  private sanitizer = inject(DomSanitizer);

  searchQuery = signal<string>('');
  recentSearches = signal<string[]>([]);
  isListening = false;
  selectedGenre = signal<string>('all');

  // Artists Data
  artists = signal<Artist[]>([]);
  loading = signal<boolean>(true);
  showSmartShuffle = signal<boolean>(false);

  // Cache to track which songs we've already tried to fetch artwork for
  private artworkFetchCache = new Set<string>();

  genres = [
    { id: 'all', name: 'Todos', icon: 'grid', color: 'emerald' },
    { id: 'reggaeton', name: 'Reggaeton', icon: 'fire', color: 'orange' },
    { id: 'trap', name: 'Trap', icon: 'microphone', color: 'purple' },
    { id: 'pop', name: 'Pop', icon: 'star', color: 'pink' },
    { id: 'vallenato', name: 'Vallenato', icon: 'music', color: 'green' },
    { id: 'salsa', name: 'Salsa', icon: 'music', color: 'red' },
    { id: 'champeta', name: 'Champeta', icon: 'trending-up', color: 'cyan' },
    { id: 'cristiana', name: 'Cristiana', icon: 'heart', color: 'indigo' }
  ];


  // Normalize text: remove accents, apostrophes, and special characters
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/['']/g, '') // Remove apostrophes
      .trim();
  }

  filteredArtists = computed(() => {
    const query = this.normalize(this.searchQuery());
    const genre = this.selectedGenre();

    let filtered = this.artists();
    if (genre !== 'all') {
      filtered = filtered.filter(artist => artist.genre && artist.genre.toLowerCase().includes(genre));
    }

    if (query) {
      return filtered.filter(artist => {
        const normalizedName = this.normalize(artist.name);

        // 1. Coincidencia exacta o contenida (Rápido)
        if (normalizedName.includes(query) || query.includes(normalizedName)) return true;

        // 2. Coincidencia difusa inteligente (Palabra por palabra)
        const nameWords = normalizedName.split(/\s+/);
        const queryWords = query.split(/\s+/);

        const hasFuzzyMatch = nameWords.some(nameWord => {
          return queryWords.some(queryWord => {
            if (queryWord.length < 3) return nameWord === queryWord;
            const distance = this.getLevenshteinDistance(nameWord, queryWord);
            const allowedErrors = queryWord.length > 6 ? 2 : 1;
            return distance <= allowedErrors;
          });
        });

        if (hasFuzzyMatch) return true;

        // 3. Revisar canciones
        const songMatches = artist.songs && artist.songs.some(s => {
          const normalizedTitle = this.normalize(s.title);
          if (normalizedTitle.includes(query)) return true;

          // Fuzzy match para títulos de canciones también
          const titleWords = normalizedTitle.split(/\s+/);
          return titleWords.some(titleWord => {
            return queryWords.some(queryWord => {
              if (queryWord.length < 4) return false;
              return this.getLevenshteinDistance(titleWord, queryWord) <= 1;
            });
          });
        });

        return songMatches;
      }).map(artist => {
        // Encontrar la canción que mejor coincide
        const matchingSong = artist.songs?.find(s => {
          const normTitle = this.normalize(s.title);
          if (normTitle.includes(query)) return true;
          const titleWords = normTitle.split(/\s+/);
          const queryWords = query.split(/\s+/);
          return titleWords.some(tw => queryWords.some(qw => qw.length >= 4 && this.getLevenshteinDistance(tw, qw) <= 1));
        });

        if (matchingSong && (!matchingSong.img || matchingSong.img.includes('default'))) {
          this.queueArtworkFetch(matchingSong, artist);
        }

        return { ...artist, _matchingSong: matchingSong };
      });
    }

    return filtered.map(artist => ({ ...artist, _matchingSong: undefined }));
  });

  // Algoritmo de Levenshtein para medir similitud de palabras
  private getLevenshteinDistance(s: string, t: string): number {
    if (s === t) return 0;
    if (s.length === 0) return t.length;
    if (t.length === 0) return s.length;

    const v0 = new Array(t.length + 1);
    const v1 = new Array(t.length + 1);

    for (let i = 0; i < v0.length; i++) v0[i] = i;

    for (let i = 0; i < s.length; i++) {
      v1[0] = i + 1;
      for (let j = 0; j < t.length; j++) {
        const cost = s[i] === t[j] ? 0 : 1;
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
      }
      for (let j = 0; j < v0.length; j++) v0[j] = v1[j];
    }
    return v0[t.length];
  }

  // Cola de peticiones para no saturar a Spotify
  private artworkQueue: { song: Song, artist: Artist }[] = [];
  private isProcessingQueue = false;

  private queueArtworkFetch(song: Song, artist: Artist) {
    const cacheKey = `${artist.id}-${song.id}`;
    if (this.artworkFetchCache.has(cacheKey)) return;

    this.artworkQueue.push({ song, artist });

    if (!this.isProcessingQueue) {
      this.processArtworkQueue();
    }
  }

  private async processArtworkQueue() {
    if (this.artworkQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const { song, artist } = this.artworkQueue.shift()!;

    // Esperar un poco entre peticiones (200ms) para evitar 429
    await new Promise(resolve => setTimeout(resolve, 200));

    await this.fetchSongArtwork(song, artist);
    this.processArtworkQueue();
  }





  ngOnInit() {
    this.seoService.setSeoData('Artistas', 'Explora artistas musicales.');

    this.voiceService.text$.subscribe(text => {
      if (text) {
        this.searchQuery.set(text);
        this.isListening = false;
        this.cdr.detectChanges();
      }
    });

    this.loadRecentSearches();
    this.loadArtists();
  }

  // --- Search History ---
  loadRecentSearches() {
    try {
      const history = JSON.parse(localStorage.getItem('donmusic_search_history') || '[]');
      this.recentSearches.set(history);
    } catch (e) {
      this.recentSearches.set([]);
    }
  }

  saveSearch(query: string) {
    if (!query || query.trim().length < 2) return;
    const cleanQuery = query.trim();

    // Create a copy to trigger reactivity safely
    let history = [...this.recentSearches()];

    // Remove if exists (case-insensitive)
    history = history.filter(q => q.toLowerCase() !== cleanQuery.toLowerCase());

    // Add to beginning
    history.unshift(cleanQuery);

    // Limit to 5
    history = history.slice(0, 5);

    // Update signal and storage
    this.recentSearches.set(history);
    localStorage.setItem('donmusic_search_history', JSON.stringify(history));
    console.log('Saved search:', cleanQuery, history);
  }

  removeSearch(query: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const history = this.recentSearches().filter(q => q !== query);
    this.recentSearches.set(history);
    localStorage.setItem('donmusic_search_history', JSON.stringify(history));
  }

  selectSearch(query: string) {
    this.hapticService.light();
    this.searchQuery.set(query);
  }

  // --- Highlighting ---
  // --- Highlighting ---
  highlightText(text: string, query: string): SafeHtml {
    if (!query || query.length < 2) return text;

    // Escape special regex characters
    const cleanQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create a pattern where vowels match accent-insensitive versions
    // filtering by base character
    const pattern = cleanQuery
      .split('')
      .map(char => {
        const lower = char.toLowerCase();
        if (lower === 'a') return '[aáàäâ]';
        if (lower === 'e') return '[eéèëê]';
        if (lower === 'i') return '[iíìïî]';
        if (lower === 'o') return '[oóòöô]';
        if (lower === 'u') return '[uúùüû]';
        return char;
      })
      .join('');

    const regex = new RegExp(`(${pattern})`, 'gi');

    // Safety check to avoid destroying HTML if something matches a tag (unlikely here but good practice)
    const newText = text.replace(regex, '<span class="text-emerald-400 font-extrabold">$1</span>');

    return this.sanitizer.bypassSecurityTrustHtml(newText);
  }

  toggleVoiceSearch() {
    this.hapticService.light();
    if (this.isListening) {
      this.voiceService.stop();
      this.isListening = false;
    } else {
      this.searchQuery.set('');
      this.isListening = true;
      this.voiceService.start();
    }
  }

  onGenreChange(genreId: string, event?: Event): void {
    this.hapticService.light();
    this.selectedGenre.set(genreId);

    if (event) {
      const target = (event.target as HTMLElement).closest('button');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }

  clearSearch() {
    this.hapticService.light();
    this.searchQuery.set('');
  }

  onEnter() {
    this.hapticService.light();
    this.saveSearch(this.searchQuery());
    // Hide keyboard on mobile
    (document.activeElement as HTMLElement)?.blur();
  }

  playMatchingSong(artist: Artist, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.hapticService.medium();

    const query = this.normalize(this.searchQuery());
    const matchingSong = artist.songs?.find(s => this.normalize(s.title).includes(query));

    if (matchingSong) {
      // Ensure the song has the correct artistID
      const songToPlay = { ...matchingSong, artistId: artist.id };

      // Create a playlist with this song first, then the rest of the artist's songs
      const otherSongs = artist.songs
        ?.filter(s => s.id !== matchingSong.id)
        .map(s => ({ ...s, artistId: artist.id })) || [];

      const playlist = [songToPlay, ...otherSongs] as any[];

      this.playerService.setPlaylist(playlist, false, 'artist');

      // Save to history since this was a successful interaction
      this.saveSearch(this.searchQuery());

      this.playerService.playSong(songToPlay as any);
    }
  }

  getMatchingSong(artist: any): Song | undefined {
    return artist._matchingSong;
  }

  private async fetchSongArtwork(song: Song, artist: Artist) {
    // Create unique cache key
    const cacheKey = `${artist.id}-${song.id}`;

    // Skip if we already tried to fetch this song's artwork
    if (this.artworkFetchCache.has(cacheKey)) {
      return;
    }

    // Mark as fetching to prevent duplicate requests
    this.artworkFetchCache.add(cacheKey);

    try {
      const metadata = await this.spotifyService.getTrackMetadata(song.title, song.artist || artist.name);
      if (metadata?.image) {
        // Update the song image in the artist's songs array
        const updatedArtists = this.artists().map(a => {
          if (a.id === artist.id) {
            const updatedSongs = a.songs?.map(s =>
              s.id === song.id ? { ...s, img: metadata.image } : s
            );
            return { ...a, songs: updatedSongs };
          }
          return a;
        });
        this.artists.set(updatedArtists);
        this.cdr.markForCheck();
      }
    } catch (error) {
      // Silently fail
    }
  }


  toggleSmartShuffle() {
    this.hapticService.medium();
    this.showSmartShuffle.update(v => !v);
  }

  getGenreName(id: string): string {
    return this.genres.find(g => g.id === id)?.name || 'Todos';
  }

  isPlaceholder(url: string | undefined): boolean {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes('default-artist') ||
      lower.includes('base64') ||
      lower.includes('placeholder') ||
      lower.includes('data:image/gif');
  }

  loadArtists() {
    this.loading.set(true);

    combineLatest([
      this.dbService.getArtists(),
      this.dbService.getSongs()
    ]).subscribe(async ([artists, songs]: [Artist[], Song[]]) => {

      const artistsWithSongs = artists.map(artist => {
        const artistSongs = songs.filter(song =>
          song.artist && (
            song.artist.toLowerCase().includes(artist.name.toLowerCase()) ||
            artist.name.toLowerCase().includes(song.artist.toLowerCase())
          )
        );

        // Check cache immediately for those that are placeholders
        let currentImg = artist.image;
        if (this.isPlaceholder(currentImg)) {
          const spotifyCache = this.spotifyService.getArtistStatsFromCache(artist.name);
          const itunesCache = this.itunesService.getArtistImageFromCache(artist.name);
          currentImg = spotifyCache?.image || itunesCache || currentImg;
        }

        return { ...artist, image: currentImg, songs: artistSongs };
      });

      // Set data (will show cached images immediately)
      this.artists.set(artistsWithSongs);
      this.loading.set(false);

      // Background process for remaining placeholders
      this.processMissingImages(artistsWithSongs);
    });
  }

  private async processMissingImages(allArtists: Artist[]) {
    // Collect artists that still need an image
    const missing = allArtists.filter(a => this.isPlaceholder(a.image));
    if (missing.length === 0) return;

    // Process in parallel for speed
    await Promise.all(missing.map(async (artist) => {
      try {
        const spotifyStats = await this.spotifyService.getArtistStats(artist.name);
        if (spotifyStats?.image) {
          this.updateArtistImageLocally(artist.id!, spotifyStats.image);
          // Persist to Firestore so NO ONE has to fetch it again
          this.dbService.updateArtist(artist.id!, { image: spotifyStats.image }).catch(() => { });
        } else {
          const itunesImage = await this.itunesService.getArtistImageBestEffort(artist.name).toPromise();
          if (itunesImage && !this.isPlaceholder(itunesImage)) {
            this.updateArtistImageLocally(artist.id!, itunesImage);
            // Persist to Firestore
            this.dbService.updateArtist(artist.id!, { image: itunesImage }).catch(() => { });
          }
        }
      } catch (e) {
        // Silently fail
      }
    }));
  }

  private updateArtistImageLocally(artistId: string, imageUrl: string) {
    this.artists.update(list => {
      const newList = [...list];
      const index = newList.findIndex(a => a.id === artistId);
      if (index !== -1) {
        newList[index] = { ...newList[index], image: imageUrl };
      }
      return newList;
    });
    this.cdr.markForCheck();
  }

  async clearAllArtistImagesCache() {
    if (!confirm('¿Quieres actualizar todas las imágenes de artistas desde Spotify?\n\nEsto limpiará el caché y recargará la página.')) {
      return;
    }

    // Clear ALL Spotify cache from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('spotify_artist_stats') || key.includes('donmusic_cache_spotify')) {
        localStorage.removeItem(key);
        console.log('🗑️ Eliminado:', key);
      }
    });

    console.log('✅ Caché de Spotify completamente limpiado');
    console.log('🔄 Recargando página para buscar imágenes frescas...');

    // Reload page to fetch fresh images
    window.location.reload();
  }
}
