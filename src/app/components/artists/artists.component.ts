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
import { MusicApiService } from '../../services/music-api.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { HapticService } from '../../services/haptic.service';

import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { SmartShuffleComponent } from '../shared/smart-shuffle/smart-shuffle.component';
import { VoiceVisualizerComponent } from '../shared/voice-waveform/voice-waveform.component';
import { LanguageService } from '../../services/language.service';

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
  private musicApi = inject(MusicApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  public languageService = inject(LanguageService);

  public onArtistClick(artist: Artist, event: Event) {
    if (this.searchQuery() && this.getMatchingSong(artist)) {
      this.playMatchingSong(artist, event);
    } else {
      this.hapticService.light();
      this.router.navigate(['/artist', artist.id]);
    }
  }

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

  genres = computed(() => [
    { id: 'all', name: this.languageService.get('artists.genre.all'), icon: 'grid', color: 'emerald' },
    { id: 'reggaeton', name: 'Reggaeton', icon: 'fire', color: 'orange' },
    { id: 'trap', name: 'Trap', icon: 'microphone', color: 'purple' },
    { id: 'pop', name: 'Pop', icon: 'star', color: 'pink' },
    { id: 'vallenato', name: 'Vallenato', icon: 'music', color: 'green' },
    { id: 'salsa', name: 'Salsa', icon: 'music', color: 'red' },
    { id: 'champeta', name: 'Champeta', icon: 'trending-up', color: 'cyan' },
    { id: 'cristiana', name: 'Cristiana', icon: 'heart', color: 'indigo' }
  ]);


  // Normalize text: remove accents, punctuation, and extra spaces
  private normalize(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, ' ')    // Replace non-alphanumeric with space
      .replace(/\s+/g, ' ')            // Collapse multiple spaces
      .trim();
  }

  // Phonetic normalization for Spanish common mistakes
  private normalizePhonetic(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/v/g, 'b')      // v → b
      .replace(/z/g, 's')      // z → s
      .replace(/c(?=[ei])/g, 's') // ce, ci → se, si
      .replace(/ll/g, 'y')     // ll → y
      .replace(/h/g, '')       // silent h
      .replace(/qu/g, 'k')     // qu → k
      .replace(/j/g, 'h')      // j sounds like h in English
      .replace(/ge/g, 'he')    // ge → he
      .replace(/gi/g, 'hi')    // gi → hi
      .replace(/ñ/g, 'n')      // ñ → n
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Get initials from a name (e.g., "Bad Bunny" → "bb")
  private getInitials(text: string): string {
    return text.split(/\s+/)
      .map(word => word.charAt(0))
      .join('')
      .toLowerCase();
  }

  filteredArtists = computed(() => {
    const rawQuery = this.searchQuery();
    const query = this.normalize(rawQuery);
    const phoneticQuery = this.normalizePhonetic(rawQuery);
    const genre = this.selectedGenre();
    const allArtists = this.artists();

    if (!query) {
      return (genre === 'all'
        ? allArtists
        : allArtists.filter(artist => artist.genre && artist.genre.toLowerCase().includes(genre.toLowerCase()))
      ).map(artist => ({ ...artist, _matchingSong: undefined }));
    }

    const queryWords = query.split(/\s+/).filter(w => w.length > 0);
    const phoneticWords = phoneticQuery.split(/\s+/).filter(w => w.length > 0);
    const isMultiWord = queryWords.length > 1;
    const isShortQuery = query.length <= 3;

    return allArtists
      .map(artist => {
        const normalizedName = this.normalize(artist.name);
        const phoneticName = this.normalizePhonetic(artist.name);
        const nameWords = normalizedName.split(/\s+/);
        const artistInitials = this.getInitials(normalizedName);
        const inSelectedGenre = genre === 'all' || (artist.genre && artist.genre.toLowerCase().includes(genre.toLowerCase()));

        let score = 0;
        let bestMatchingSong: Song | undefined = undefined;

        // --- NAME MATCHING LOGIC ---
        // Priority 1: Exact or Prefix Phrases
        if (normalizedName === query) score = 100;
        else if (normalizedName.startsWith(query)) score = 95;
        else if (new RegExp(`\\b${query}\\b`).test(normalizedName)) score = 90;
        else if (normalizedName.includes(query)) score = 80;
        // Priority 1.5: Phonetic match
        else if (phoneticName === phoneticQuery) score = 88;
        else if (phoneticName.includes(phoneticQuery)) score = 75;
        // Priority 1.6: Initials match (e.g., "bb" → "Bad Bunny")
        else if (isShortQuery && artistInitials.startsWith(query)) score = 70;
        else if (isShortQuery && artistInitials.includes(query)) score = 60;
        else {
          // Priority 2: Word-by-word Intelligent matching
          let matchedPoints = 0;
          let matchedWordCount = 0;

          queryWords.forEach((qw, qi) => {
            let bestWordMatch = 0;
            nameWords.forEach(nw => {
              // Exact word match
              if (nw === qw) bestWordMatch = Math.max(bestWordMatch, 1.0);
              // Word starts with query word
              else if (nw.startsWith(qw)) bestWordMatch = Math.max(bestWordMatch, 0.85);
              // Query word starts with name word (for abbreviations)
              else if (qw.length >= 2 && nw.startsWith(qw.substring(0, 2))) bestWordMatch = Math.max(bestWordMatch, 0.6);
              // Levenshtein for typos - more lenient for shorter words
              else {
                const maxDist = qw.length <= 3 ? 1 : (qw.length <= 5 ? 2 : 3);
                const dist = this.getLevenshteinDistance(nw, qw);
                if (dist <= maxDist) {
                  const similarity = 1 - (dist / Math.max(qw.length, nw.length));
                  bestWordMatch = Math.max(bestWordMatch, similarity * 0.7);
                }
              }
            });

            // Also check phonetic matching
            if (bestWordMatch < 0.7) {
              const phoneticQw = phoneticWords[qi] || '';
              const phoneticNameWords = phoneticName.split(/\s+/);
              phoneticNameWords.forEach(pnw => {
                if (pnw === phoneticQw) bestWordMatch = Math.max(bestWordMatch, 0.8);
                else if (pnw.startsWith(phoneticQw)) bestWordMatch = Math.max(bestWordMatch, 0.7);
              });
            }

            if (bestWordMatch > 0) {
              matchedPoints += bestWordMatch;
              matchedWordCount++;
            }
          });

          // Less strict: require at least 40% of query words to have some match (was 50%)
          const matchRatio = matchedWordCount / queryWords.length;
          if (matchRatio >= 0.4 || matchedPoints >= 0.7) {
            score = (matchedPoints / queryWords.length) * 75;
          }
        }

        // --- SONG MATCHING LOGIC ---
        if (artist.songs && artist.songs.length > 0) {
          let bestSongScore = 0;
          let matchedSong: Song | undefined = undefined;

          for (const s of artist.songs) {
            const normTitle = this.normalize(s.title);
            const phoneticTitle = this.normalizePhonetic(s.title);
            let sScore = 0;

            if (normTitle === query) sScore = 85;
            else if (normTitle.startsWith(query)) sScore = 80;
            else if (normTitle.includes(query)) sScore = 75;
            else if (phoneticTitle.includes(phoneticQuery)) sScore = 70;
            else if (isMultiWord) {
              const titleWords = normTitle.split(/\s+/);
              let sMatchedPoints = 0;
              let sMatchedWords = 0;

              queryWords.forEach((qw, qi) => {
                let bestW = 0;
                titleWords.forEach(tw => {
                  if (tw === qw) bestW = Math.max(bestW, 1.0);
                  else if (tw.startsWith(qw)) bestW = Math.max(bestW, 0.85);
                  else {
                    const maxDist = qw.length <= 4 ? 1 : 2;
                    if (this.getLevenshteinDistance(tw, qw) <= maxDist) bestW = Math.max(bestW, 0.6);
                  }
                });
                if (bestW > 0) {
                  sMatchedPoints += bestW;
                  sMatchedWords++;
                }
              });

              if (sMatchedWords / queryWords.length >= 0.4) {
                sScore = (sMatchedPoints / queryWords.length) * 70;
              }
            } else if (query.length >= 3) {
              // Single word partial match for song titles
              const titleWords = normTitle.split(/\s+/);
              for (const tw of titleWords) {
                if (tw.startsWith(query)) {
                  sScore = 55;
                  break;
                }
                const dist = this.getLevenshteinDistance(tw, query);
                if (dist <= 2) {
                  sScore = Math.max(sScore, 45);
                }
              }
            }

            if (sScore > bestSongScore) {
              bestSongScore = sScore;
              matchedSong = s;
            }
          }

          // If song match is better than name match, use it
          if (bestSongScore > score) {
            score = bestSongScore;
            bestMatchingSong = matchedSong;
          } else if (score > 40 && bestSongScore > 30) {
            // Keep matching song for display even if name won
            bestMatchingSong = matchedSong;
          }
        }

        // --- BOOSTS ---
        if (score > 0) {
          // Genre relevance boost
          if (inSelectedGenre && genre !== 'all') score += 10;
          // Minor popularity boost based on song count
          score += Math.min((artist.songs?.length || 0) * 0.15, 5);
        }

        return { ...artist, _score: score, _matchingSong: bestMatchingSong };
      })
      .filter(a => (a as any)._score >= 15) // Lowered threshold from 30 to 15 for less strictness
      .sort((a, b) => (b as any)._score - (a as any)._score)
      .map(artist => {
        const matchingSong = (artist as any)._matchingSong;
        if (matchingSong && (!matchingSong.img || matchingSong.img.includes('default'))) {
          this.queueArtworkFetch(matchingSong, artist);
        }
        return artist;
      });
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

  /**
   * Maneja errores de carga de imágenes de artistas
   * Intenta obtener una nueva imagen de Spotify y actualizar la base de datos
   */
  async handleArtistImageError(artist: Artist) {
    if (!artist.id || !artist.name) return;

    // Evitar bucles infinitos si la nueva imagen también falla (poco probable con Spotify)
    if (artist.image?.includes('spotify') || artist.image?.includes('mzstatic')) {
      this.updateArtistImageLocally(artist.id, 'https://placehold.co/600x600/18181b/10b981?text=Artist');
      return;
    }

    console.warn(`Reparando imagen rota para el artista: ${artist.name}`);

    try {
      const spotifyStats = await this.spotifyService.getArtistStats(artist.name);
      if (spotifyStats?.image) {
        this.updateArtistImageLocally(artist.id, spotifyStats.image);
        // Persistir la corrección
        this.dbService.updateArtist(artist.id, { image: spotifyStats.image }).catch(() => { });
      } else {
        // Fallback final si ni Spotify tiene imagen
        this.updateArtistImageLocally(artist.id, 'https://placehold.co/600x600/18181b/10b981?text=Artist');
      }
    } catch (e) {
      this.updateArtistImageLocally(artist.id, 'https://placehold.co/600x600/18181b/10b981?text=Artist');
    }
  }

  /**
   * Maneja errores de carga de imágenes de canciones
   */
  async handleSongImageError(song: Song, artist: Artist) {
    if (!song.id || !artist.id) return;

    // Si la imagen de la canción falla, probamos con la del artista
    if (artist.image && !this.isPlaceholder(artist.image)) {
      this.updateSongImageLocally(artist.id, song.id, artist.image);
    } else {
      // Si no, forzamos un fetch de Spotify
      await this.fetchSongArtwork(song, artist);
    }
  }

  private updateSongImageLocally(artistId: string, songId: string, imageUrl: string) {
    this.artists.update(list => {
      return list.map(a => {
        if (a.id === artistId) {
          const updatedSongs = a.songs?.map(s =>
            s.id === songId ? { ...s, img: imageUrl } : s
          );
          return { ...a, songs: updatedSongs };
        }
        return a;
      });
    });
    this.cdr.markForCheck();
  }






  ngOnInit() {
    this.seoService.setSeoData(
      this.languageService.get('seo.artists.title'),
      this.languageService.get('seo.artists.desc')
    );

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
    if (!query || query.trim().length < 2) return text;

    const cleanQuery = query.trim();
    const queryParts = cleanQuery.split(/\s+/).filter(p => p.length >= 2);
    if (queryParts.length === 0) return text;

    // Escape regex and handle accents for the full query first (Best match)
    const getPattern = (str: string) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .split('')
        .map(char => {
          const lower = char.toLowerCase();
          switch (lower) {
            case 'a': return '[aáàäâ]';
            case 'e': return '[eéèëê]';
            case 'i': return '[iíìïî]';
            case 'o': return '[oóòöô]';
            case 'u': return '[uúùüû]';
            case 'n': return '[nñ]';
            default: return char;
          }
        })
        .join('');
    };

    // Try highlighting the full query first
    const fullPattern = getPattern(cleanQuery);
    const fullRegex = new RegExp(`(${fullPattern})`, 'gi');

    if (fullRegex.test(text)) {
      const highlighted = text.replace(fullRegex, '<span class="text-emerald-400 font-extrabold">$1</span>');
      return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    }

    // Fallback: highlight individual words
    let highlightedText = text;
    // Sort by length to avoid partial matches
    const sortedParts = [...queryParts].sort((a, b) => b.length - a.length);

    sortedParts.forEach(part => {
      const partPattern = getPattern(part);
      const partRegex = new RegExp(`(\\b${partPattern}\\b|${partPattern})`, 'gi');

      // Attempt to avoid highlighting inside tags by using a negative lookahead if possible,
      // but simple replace is usually fine for these short strings.
      // We use a temporary marker to avoid double highlighting
      highlightedText = highlightedText.replace(partRegex, '##$1%%');
    });

    // Replace markers with actual HTML
    const finalHtml = highlightedText
      .replace(/##/g, '<span class="text-emerald-400 font-extrabold">')
      .replace(/%%/g, '</span>');

    return this.sanitizer.bypassSecurityTrustHtml(finalHtml);
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
    // Clear search when selecting a genre
    this.searchQuery.set('');

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

  onSearchInput() {
    // Auto-switch to "all" genre when user starts typing
    if (this.searchQuery() && this.selectedGenre() !== 'all') {
      this.selectedGenre.set('all');
    }
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

    const matchingSong = this.getMatchingSong(artist);

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
    return this.genres().find(g => g.id === id)?.name || this.languageService.get('artists.genre.all');
  }

  isPlaceholder(url: string | undefined): boolean {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes('default-artist') ||
      lower.includes('base64') ||
      lower.includes('placeholder') ||
      lower.includes('data:image/gif') ||
      lower.includes('storageimagedisplay.com');
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

    // Process SEQUENTIALLY with delays to avoid 429/403 (Safe approach)
    for (const artist of missing) {
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Delay between requests

        const spotifyStats = await this.spotifyService.getArtistStats(artist.name);
        if (spotifyStats?.image) {
          this.updateArtistImageLocally(artist.id!, spotifyStats.image);
          this.dbService.updateArtist(artist.id!, { image: spotifyStats.image }).catch(() => { });
        } else {
          const itunesImage = await this.itunesService.getArtistImageBestEffort(artist.name).toPromise();
          if (itunesImage && !this.isPlaceholder(itunesImage)) {
            this.updateArtistImageLocally(artist.id!, itunesImage);
            this.dbService.updateArtist(artist.id!, { image: itunesImage }).catch(() => { });
          }
        }
      } catch (e) { }
    }
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
    if (!confirm(this.languageService.get('artists.admin.refresh_prompt'))) {
      return;
    }

    this.hapticService.medium();
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('spotify_artist_') || key.startsWith('spotify_search_')) {
        localStorage.removeItem(key);
      }
    });

    this.toastService.success(this.languageService.get('artists.admin.cache_cleared'));
    setTimeout(() => window.location.reload(), 1500);
  }

  downloadSong(song: Song) {
    if (!song.url) {
      this.toastService.info(this.languageService.get('home.toast.searching_download'));
      this.musicApi.getBestAudioStream(song.title, (song as any).artistName || song.artist).subscribe((url: string | null) => {
        if (url) {
          this.navigateToDownload(song, url, 'default');
        } else {
          this.toastService.error(this.languageService.get('home.toast.download_not_found'));
        }
      });
    } else {
      this.navigateToDownload(song, song.url, 'default');
    }
  }

  navigateToDownload(song: Song, url: string | null, mode: 'default' | 'offline') {
    this.router.navigate(['/download'], {
      state: {
        songTitle: song.title,
        artistName: (song as any).artistName || song.artist,
        downloadUrl: url,
        mode: mode,
        songData: song
      }
    });
  }
}
