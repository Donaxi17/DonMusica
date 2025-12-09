import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { MusicApiService } from '../../services/music-api.service';
import { Song } from '../../services/playlist.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private seoService = inject(SeoService);
  private musicApi = inject(MusicApiService);

  requestArtist = '';
  requestSong = '';
  requestMessage = '';

  trendingSongs: Song[] = [];

  ngOnInit() {
    this.seoService.setSeoData(
      'Inicio',
      'Bienvenido a DonMusica. Escucha y descarga tu música favorita gratis. La mejor calidad de sonido y los artistas del momento.'
    );

    // Load trending songs from the same source as the Trends page
    this.musicApi.getTrending('CO').subscribe({
      next: (songs) => {
        // Show only the first 6 songs for the home preview
        this.trendingSongs = songs.slice(0, 6);
      },
      error: (err) => {
        console.error('Error loading trending songs for home:', err);
      }
    });
  }

  navigateToArtists(): void {
    this.router.navigate(['/artists']);
  }

  openAdAndStart(): void {
    // 1. Open Adsterra link in new tab
    const adUrl = 'https://www.effectivegatecpm.com/sw9g0tx52?key=973a1c8fac0e809dba93c52ce9b0de4c';
    window.open(adUrl, '_blank');

    // 2. Navigate to the app functionality (Artists)
    this.navigateToArtists();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  scrollToRequest(): void {
    const element = document.getElementById('requestForm');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  submitRequest(): void {
    if (!this.requestArtist || !this.requestSong) {
      alert('Por favor completa el nombre del artista y la canción/álbum');
      return;
    }

    console.log('Music Request:', {
      artist: this.requestArtist,
      song: this.requestSong,
      message: this.requestMessage
    });

    alert('¡Solicitud enviada con éxito! Trabajaremos para agregar tu música pronto.');

    // Reset form
    this.requestArtist = '';
    this.requestSong = '';
    this.requestMessage = '';
  }
}
