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
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [NoConnectionComponent, CommonModule, FormsModule, SvgIconComponent, RouterModule, AdsContainerComponent],
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

  searchQuery = signal<string>('');
  isListening = false;
  selectedGenre = signal<string>('all');

  // Artists Data
  artists = signal<Artist[]>([]);
  loading = signal<boolean>(true);

  genres = [
    { id: 'all', name: 'Todos', icon: 'grid', color: 'emerald' },
    { id: 'reggaeton', name: 'Reggaeton', icon: 'fire', color: 'orange' },
    { id: 'trap', name: 'Trap Latino', icon: 'microphone', color: 'purple' },
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

      // Optimizacion: Solo buscamos imagen si no tiene una personalizada o si es la default
      const artistsWithImages = await Promise.all(artistsWithSongs.map(async (artist) => {
        if (!artist.image || artist.image.includes('default-artist')) {
          try {
            const itunesImage = await this.itunesService.getArtistImageBestEffort(artist.name).toPromise();
            if (itunesImage) {
              return { ...artist, image: itunesImage };
            }
          } catch (e) {
            console.error('Error fetching iTunes image', e);
          }
        }
        return artist;
      }));

      this.artists.set(artistsWithImages);
      this.loading.set(false);
    });
  }
}
