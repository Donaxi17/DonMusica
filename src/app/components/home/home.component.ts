import { Component, inject, OnInit, AfterViewInit, ElementRef, Renderer2, ChangeDetectionStrategy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { MusicApiService } from '../../services/music-api.service';
import { ToastService } from '../../services/toast.service';
import { Song } from '../../services/playlist.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

import { NetworkService } from '../../services/network.service';

import { NoConnectionComponent } from '../shared/no-connection/no-connection.component';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AdsContainerComponent, RouterModule, NoConnectionComponent, SkeletonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private router = inject(Router);
  private seoService = inject(SeoService);
  private musicApi = inject(MusicApiService);
  public networkService = inject(NetworkService);
  private playerService = inject(PlayerService);
  private toastService = inject(ToastService);

  requestArtist = '';
  requestSong = '';
  requestMessage = '';

  trendingSongs = signal<Song[]>([]);
  loadingTrends = signal(true);

  deferredPrompt: any;
  canInstall = false;    // For the Hero button
  showInstallBanner = false; // For the bottom banner

  // Parallax tracking (Signals for OnPush)
  mouseX = signal(0);
  mouseY = signal(0);

  ngOnInit() {
    // Enhanced SEO with rich meta tags
    this.seoService.setSeoData(
      'DonMusica - Música Urbana Gratis | Descargar MP3, Letras y Videos',
      'Escucha y descarga música urbana gratis en DonMusica. Reggaeton, trap, rap y más. Rankings actualizados, letras de canciones, videos musicales y música sin copyright para tus proyectos. Artistas como Bad Bunny, Karol G, Feid y más en donmusica.online'
    );

    // Initial check for PWA install capability
    this.listenForInstallPrompt();

    // Load initial data
    this.loadTrends();
  }

  loadTrends() {
    this.loadingTrends.set(true);
    // Load trending songs from the same source as the Trends page
    this.musicApi.getTrending('CO').subscribe({
      next: (songs) => {
        // Show only the first 6 songs for the home preview
        this.trendingSongs.set(songs.slice(0, 6));
        this.loadingTrends.set(false);
        // After data is loaded, re-scan for reveal elements if needed
        setTimeout(() => this.initScrollAnimations(), 100);
      },
      error: (err) => {
        console.error('Error loading trending songs for home:', err);
        this.loadingTrends.set(false);
        this.trendingSongs.set([]);
      }
    });
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
    this.mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
  }

  ngAfterViewInit() {
    this.initScrollAnimations();
  }

  private initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px 0px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(entry.target, 'active');
        } else {
          // Re-enable removal to make animations "infinite" (scrolling up/down)
          this.renderer.removeClass(entry.target, 'active');
        }
      });
    }, observerOptions);

    const elements = this.el.nativeElement.querySelectorAll('.reveal');
    elements.forEach((element: HTMLElement) => observer.observe(element));
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
      this.toastService.info('Para instalar la App: Presiona "Añadir a pantalla de inicio" en las opciones de tu navegador o "Instalar Aplicación" en la barra de búsqueda.');
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
      this.toastService.warning('Por favor completa el nombre del artista y la canción/álbum');
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

  playSong(song: Song): void {
    this.playerService.setPlaylist(this.trendingSongs(), false, 'home-trends');
    this.playerService.playSong(song);
  }
}
