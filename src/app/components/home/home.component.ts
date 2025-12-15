import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { SeoService } from '../../services/seo.service';
import { MusicApiService } from '../../services/music-api.service';
import { Song } from '../../services/playlist.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';

import { NetworkService } from '../../services/network.service';
import { NoConnectionComponent } from '../shared/no-connection/no-connection.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AdsContainerComponent, RouterModule, NgOptimizedImage, NoConnectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private seoService = inject(SeoService);
  private musicApi = inject(MusicApiService);
  public networkService = inject(NetworkService);

  requestArtist = '';
  requestSong = '';
  requestMessage = '';

  trendingSongs: Song[] = [];

  deferredPrompt: any;
  canInstall = false;    // For the Hero button
  showInstallBanner = false; // For the bottom banner

  ngOnInit() {
    // Enhanced SEO with rich meta tags
    this.seoService.setSeoData(
      'DonMusica - Música Urbana Gratis | Descargar MP3, Letras y Videos',
      'Escucha y descarga música urbana gratis en DonMusica. Reggaeton, trap, rap y más. Rankings actualizados, letras de canciones, videos musicales y música sin copyright para tus proyectos. Artistas como Bad Bunny, Karol G, Feid y más en donmusica.online'
    );

    // Initial check for PWA install capability
    this.listenForInstallPrompt();

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

  listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;

      // Enable both button and banner
      this.canInstall = true;
      this.showInstallBanner = true;
    });
  }

  async installPwa() {
    if (!this.deferredPrompt) {
      alert('Para instalar la App: Presiona "Añadir a pantalla de inicio" en las opciones de tu navegador o "Instalar Aplicación" en la barra de búsqueda.');
      return;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    this.deferredPrompt = null;
    this.canInstall = false;
    this.showInstallBanner = false;
  }

  navigateToArtists(): void {
    this.router.navigate(['/artists']);
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

    const message = `⚡ *Nueva Petición Musical* ⚡%0A%0A` +
      `🎙️ *Artista:* ${this.requestArtist}%0A` +
      `🎧 *Canción/Álbum:* ${this.requestSong}`;

    // Replace with your WhatsApp number, e.g., 573000000000
    // Using a general format, user can change it.
    const phoneNumber = '573017966272';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappUrl, '_blank');

    // Reset form after a slight delay to allow navigation
    setTimeout(() => {
      this.requestArtist = '';
      this.requestSong = '';
      this.requestMessage = '';
    }, 1000);
  }
}
