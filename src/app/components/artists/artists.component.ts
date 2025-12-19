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

  loadArtists() {
    this.loading.set(true);

    combineLatest([
      this.dbService.getArtists(),
      this.dbService.getSongs()
    ]).subscribe(async ([artists, songs]: [Artist[], Song[]]) => {

      const artistsWithSongs = artists.map(artist => {
        const artistSongs = songs.filter(song =>
          song.artist && song.artist.toLowerCase().includes(artist.name.toLowerCase())
        );
        return { ...artist, songs: artistSongs };
      });

      // Set initial data immediately (Instant feel)
      this.artists.set(artistsWithSongs);
      this.loading.set(false);

      // Background process to update images if necessary
      const updatedArtists = [...artistsWithSongs];
      let needsStateUpdate = false;

      for (let i = 0; i < updatedArtists.length; i++) {
        const artist = updatedArtists[i];

        // Check if image needs update (missing, default, itunes to spotify upgrade)
        const isDefault = !artist.image || artist.image.includes('default-artist') || artist.image.includes('mzstatic');

        if (isDefault) {
          try {
            // SpotifyService already handles caching internally now
            const spotifyStats = await this.spotifyService.getArtistStats(artist.name);
            if (spotifyStats?.image) {
              updatedArtists[i] = { ...artist, image: spotifyStats.image };
              needsStateUpdate = true;
              // Update state gradually for smooth appearance
              this.artists.set([...updatedArtists]);
            } else {
              // Fallback to iTunes (also cached internally)
              const itunesImage = await this.itunesService.getArtistImageBestEffort(artist.name).toPromise();
              if (itunesImage && !itunesImage.includes('default-artist')) {
                updatedArtists[i] = { ...artist, image: itunesImage };
                needsStateUpdate = true;
                this.artists.set([...updatedArtists]);
              }
            }
          } catch (e) {
            console.warn(`Background img update failed for ${artist.name}`);
          }
        }
      }
    });
  }
}
