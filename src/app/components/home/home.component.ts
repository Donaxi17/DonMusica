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
import { DatabaseService } from '../../services/database.service';
import { HapticService } from '../../services/haptic.service';
import { SpotifyService } from '../../services/spotify.service';

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
  private databaseService = inject(DatabaseService);
  private hapticService = inject(HapticService);
  private spotifyService = inject(SpotifyService);

  totalArtists = signal<number>(0);
  totalSongs = signal<number>(0);
  loadingStats = signal<boolean>(true);
  recentlyAdded = signal<any[]>([]);

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
    this.loadStats();
  }

  loadStats() {
    this.loadingStats.set(true);
    // Get stats
    this.databaseService.getArtists().subscribe(artists => {
      this.totalArtists.set(artists.length);
    });
    this.databaseService.getSongs().subscribe(songs => {
      this.totalSongs.set(songs.length);
      this.loadingStats.set(false);
    });

    // Real-time Latest Songs subscription
    this.databaseService.getLatestSongs(6).subscribe(async songs => {
      const currentList = this.recentlyAdded();

      // Step 1: Preliminary map with existing valid images
      const initialMap = songs.map(song => {
        const existing = currentList.find(s => s.id === song.id);
        if (existing && !this.isGenericImage(existing.img)) {
          return { ...song, img: existing.img };
        }
        return { ...song };
      });

      // Step 2: Show what we have initially (with placeholders if needed)
      this.recentlyAdded.set(initialMap);
      this.loadingStats.set(false);

      // Step 3: Proactively fetch artwork for all songs and update one by one as they arrive
      const fetchPromises = initialMap.map(async (song) => {
        if (this.isGenericImage(song.img)) {
          try {
            const artwork = await this.spotifyService.getTrackArtwork(song.title, song.artist);
            if (artwork) {
              this.recentlyAdded.update(list => {
                const newList = [...list];
                const index = newList.findIndex(s => s.id === song.id);
                if (index !== -1) {
                  newList[index] = { ...newList[index], img: artwork };
                }
                return newList;
              });
            }
          } catch (err) {
            // Silence is golden
          }
        }
      });

      // We don't necessarily need to wait for all if we update one by one, 
      // but waiting ensures we handle the batch.
      await Promise.all(fetchPromises);
    });
  }

  isGenericImage(img: string | undefined): boolean {
    if (!img) return true;
    const lower = img.toLowerCase();
    return lower.includes('default-music') ||
      lower.includes('default-artist') ||
      lower.includes('base64') ||
      lower.includes('placeholder') ||
      lower.includes('placehold.co');
  }

  loadTrends() {
    this.loadingTrends.set(true);
    this.musicApi.getTrending('CO').subscribe({
      next: (songs) => {
        const previewSongs = songs.slice(0, 6);
        this.trendingSongs.set(previewSongs);
        this.loadingTrends.set(false);

        // Pre-fetch artworks for trending songs immediately
        previewSongs.forEach(song => {
          if (this.isGenericImage(song.img)) {
            this.spotifyService.getTrackArtwork(song.title, song.artist).then(artwork => {
              if (artwork) {
                this.trendingSongs.update(list => {
                  const newList = [...list];
                  const index = newList.findIndex(item => item.id === song.id);
                  if (index !== -1) {
                    newList[index] = { ...newList[index], img: artwork };
                  }
                  return newList;
                });
              }
            }).catch(() => { });
          }
        });
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

    this.hapticService.success();
    this.toastService.success('¡Petición enviada! Estaremos trabajando en ella pronto.');

    window.open(whatsappUrl, '_blank');

    // Reset form after a slight delay to allow navigation
    setTimeout(() => {
      this.requestArtist = '';
      this.requestSong = '';
      this.requestMessage = '';
    }, 1000);
  }

  playSong(song: Song): void {
    this.hapticService.light();
    this.playerService.setPlaylist(this.trendingSongs(), false, 'home-trends');
    this.playerService.playSong(song);
  }

  playRecent(song: any): void {
    this.hapticService.light();
    this.playerService.setPlaylist(this.recentlyAdded(), false, 'home-recent');
    this.playerService.playSong(song);
  }

  isNewSong(date: any): boolean {
    if (!date) return false;
    let millis = 0;
    if (date && typeof date.toMillis === 'function') millis = date.toMillis();
    else if (date && date.seconds) millis = date.seconds * 1000;
    else if (date instanceof Date) millis = date.getTime();
    else if (typeof date === 'string' || typeof date === 'number') {
      const d = new Date(date);
      millis = isNaN(d.getTime()) ? 0 : d.getTime();
    }
    if (millis === 0) return false;
    const now = new Date().getTime();
    const diff = now - millis;
    return diff < (48 * 60 * 60 * 1000); // 48 hours
  }

  getTimeAgo(date: any): string {
    if (!date) return 'Nuevo';

    let millis = 0;
    if (typeof date === 'number') millis = date;
    else if (date && typeof date.toMillis === 'function') millis = date.toMillis();
    else if (date && date.seconds) millis = date.seconds * 1000;
    else if (date instanceof Date) millis = date.getTime();
    else if (typeof date === 'string') {
      const d = new Date(date);
      millis = isNaN(d.getTime()) ? 0 : d.getTime();
    }

    if (millis === 0) return 'Nuevo';

    const now = new Date().getTime();
    const diff = now - millis;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return 'Justo ahora';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `Hace ${days} d`;

    return 'Hace tiempo';
  }
}
