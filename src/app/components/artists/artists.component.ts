import { Component, computed, signal, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Artist as LocalArtist, ARTISTS_DATA } from '../../models/artists.data';
import { SeoService } from '../../services/seo.service';
import { DatabaseService, Artist as RemoteArtist } from '../../services/database.service';
import { VoiceRecognitionService } from '../../services/voice-recognition.service';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconComponent],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.css'
})
export class ArtistsComponent implements OnInit {
  private router = inject(Router);
  private seoService = inject(SeoService);
  private dbService = inject(DatabaseService);
  private voiceService = inject(VoiceRecognitionService);
  private cdr = inject(ChangeDetectorRef);

  allArtists = signal<RemoteArtist[]>([]);
  selectedGenre = signal<string>('all');
  searchQuery = signal<string>('');
  isListening = false;

  genres = [
    { value: 'all', label: 'Todos' },
    { value: 'Rap', label: 'Rap / Hip-Hop' },
    { value: 'Reggaeton', label: 'Reggaeton' },
    { value: 'Trap', label: 'Trap' },
    { value: 'Pop', label: 'Pop' },
    { value: 'Dancehall', label: 'Dancehall' },
    { value: 'R&B', label: 'R&B' }
  ];

  artists = computed(() => {
    const genre = this.selectedGenre().toLowerCase();
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.allArtists();

    return list.filter(artist => {
      const matchesGenre = genre === 'all' || (artist.genre && artist.genre.toLowerCase().includes(genre));
      const matchesSearch = !query ||
        artist.name.toLowerCase().includes(query) ||
        (artist.genre && artist.genre.toLowerCase().includes(query));
      return matchesGenre && matchesSearch;
    });
  });

  ngOnInit() {
    this.seoService.setSeoData('Artistas', 'Descubre a los mejores artistas en DonMusica.');

    this.voiceService.text$.subscribe(text => {
      if (text) {
        this.searchQuery.set(text);
        this.isListening = false;
        this.cdr.detectChanges();
      }
    });

    this.dbService.getArtists().subscribe(remoteArtists => {
      if (remoteArtists?.length) {
        this.allArtists.set(remoteArtists);
      } else {
        this.allArtists.set(ARTISTS_DATA.map(a => ({
          id: a.id.toString(),
          name: a.name,
          genre: a.genre,
          image: a.image,
          bio: a.description
        })));
      }
    });
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

  selectArtist(artist: RemoteArtist): void {
    this.router.navigate(['/player'], { queryParams: { artistId: artist.id } });
  }

  onGenreChange(genre: string): void {
    this.selectedGenre.set(genre);
  }
}
