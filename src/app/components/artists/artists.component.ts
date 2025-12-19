import { Component, inject, signal, OnInit, ChangeDetectorRef, computed } from '@angular/core';
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
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { HapticService } from '../../services/haptic.service';

import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { SmartShuffleComponent } from '../shared/smart-shuffle/smart-shuffle.component';
import { VoiceWaveformComponent } from '../shared/voice-waveform/voice-waveform.component';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [NoConnectionComponent, CommonModule, FormsModule, SvgIconComponent, RouterModule, AdsContainerComponent, SkeletonComponent, SmartShuffleComponent, VoiceWaveformComponent],
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

  searchQuery = signal<string>('');
  isListening = false;
  selectedGenre = signal<string>('all');

  // Artists Data
  artists = signal<Artist[]>([]);
  loading = signal<boolean>(true);
  showSmartShuffle = signal<boolean>(false);

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

  ngOnInit() {
    this.seoService.setSeoData('Artistas', 'Explora artistas musicales.');

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
}
