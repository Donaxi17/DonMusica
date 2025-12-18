import { Component, inject, signal, OnInit, ChangeDetectorRef, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
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
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';

import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [NoConnectionComponent, CommonModule, FormsModule, SvgIconComponent, RouterModule, AdsContainerComponent, SkeletonComponent, NgOptimizedImage],
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

  searchQuery = signal<string>('');
  isListening = false;
  selectedGenre = signal<string>('all');

  // Artists Data
  artists = signal<Artist[]>([]);
  loading = signal<boolean>(true);

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

  filteredArtists = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const genre = this.selectedGenre();

    return this.artists().filter(artist => {
      const matchesSearch = artist.name.toLowerCase().includes(query) ||
        (artist.songs && artist.songs.some(s => s.title.toLowerCase().includes(query)));

      const matchesGenre = genre === 'all' || (artist.genre && artist.genre.toLowerCase().includes(genre));
      return matchesSearch && matchesGenre;
    });
  });

  // Cache State
  private readonly CACHE_KEY = 'artist_images_cache';
  private imgCache: { [key: string]: { url: string; lastUpdated: number } } = {};

  ngOnInit() {
    this.seoService.setSeoData('Artistas', 'Explora artistas musicales.');

    // Load cache once
    try {
      this.imgCache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
    } catch (e) {
      console.warn('Error parsing artist cache', e);
    }

    this.voiceService.text$.subscribe(text => {
      if (text) {
        this.searchQuery.set(text);
        this.isListening = false;
        this.cdr.detectChanges();
      }
    });

    this.loadArtists();
  }

  toggleVoiceSearch() {
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
    this.selectedGenre.set(genreId);

    if (event) {
      const target = (event.target as HTMLElement).closest('button');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }

  loadArtists() {
    this.loading.set(true);

    // Use combineLatest to get both artists and songs (real-time updates)
    combineLatest([
      this.dbService.getArtists(),
      this.dbService.getSongs()
    ]).subscribe(async ([artists, songs]: [Artist[], Song[]]) => {

      // Map songs to artists for searching
      const artistsWithSongs = artists.map(artist => {
        // Find songs where artist name matches (loose matching)
        const artistSongs = songs.filter(song =>
          song.artist && song.artist.toLowerCase().includes(artist.name.toLowerCase())
        );
        return { ...artist, songs: artistSongs };
      });

      const THREE_MONTHS = 90 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      let cacheModified = false;

      // Optimizacion: Priorizamos Spotify para fotos de artista (Más actualizadas y de perfil)
      const artistsWithImages = await Promise.all(artistsWithSongs.map(async (artist) => {
        const cached = this.imgCache[artist.name];
        const isCacheValid = cached && (now - cached.lastUpdated < THREE_MONTHS);

        // 1. If we have a valid cache, use it
        if (isCacheValid) {
          return { ...artist, image: cached.url };
        }

        // 2. If no valid cache, decide if we need to fetch
        // Fetch if: No image, Default image, iTunes image (upgrade to Spotify), or Cache Expired
        const needsUpdate = !artist.image ||
          artist.image.includes('default-artist') ||
          artist.image.includes('mzstatic') ||
          (cached && !isCacheValid); // Expired cache

        if (needsUpdate) {
          try {
            // Intentar Spotify primero
            const spotifyStats = await this.spotifyService.getArtistStats(artist.name);
            if (spotifyStats?.image) {
              // Update Cache
              this.imgCache[artist.name] = { url: spotifyStats.image, lastUpdated: now };
              cacheModified = true;
              return { ...artist, image: spotifyStats.image };
            }
          } catch (e) {
            console.warn(`Spotify img failed for ${artist.name}`);
          }

          // Fallback a iTunes
          try {
            // Only fetch from iTunes if we don't have a valid cached URL (even if expired, it might be better than nothing if iTunes fails)
            // But here we want to refresh.
            const itunesImage = await this.itunesService.getArtistImageBestEffort(artist.name).toPromise();
            if (itunesImage && !itunesImage.includes('default-artist')) {
              this.imgCache[artist.name] = { url: itunesImage, lastUpdated: now };
              cacheModified = true;
              return { ...artist, image: itunesImage };
            }
          } catch (err) {
            console.error('iTunes fallback error', err);
          }
        }

        // If update failed but we had an old cache, maybe stick with it?
        // Or if we have an existing DB image that is not default.
        if (cached) return { ...artist, image: cached.url };

        return artist;
      }));

      if (cacheModified) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.imgCache));
      }

      this.artists.set(artistsWithImages);
      this.loading.set(false);
    });
  }
}
