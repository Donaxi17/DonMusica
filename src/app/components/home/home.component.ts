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
  displayArtists = signal<number>(0);
  displaySongs = signal<number>(0);
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

    let artistsLoaded = false;
    let songsLoaded = false;
    let recentLoaded = false;

    const checkLoadingFinished = () => {
      if (artistsLoaded && songsLoaded && recentLoaded) {
        this.loadingStats.set(false);
      }
    };

    // Optimized: Use getCountFromServer to avoid reading all documents
    this.databaseService.getCollectionCount('artists').subscribe({
      next: count => {
        this.totalArtists.set(count);
        artistsLoaded = true;
        checkLoadingFinished();
      },
      error: () => {
        artistsLoaded = true;
        checkLoadingFinished();
      }
    });

    this.databaseService.getCollectionCount('songs').subscribe({
      next: count => {
        this.totalSongs.set(count);
        songsLoaded = true;
        checkLoadingFinished();
      },
      error: () => {
        songsLoaded = true;
        checkLoadingFinished();
      }
    });

    // Real-time Latest Songs subscription
    this.databaseService.getLatestSongs(6).subscribe({
      next: async songs => {
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
        recentLoaded = true;
        checkLoadingFinished();

        // RE-SCAN for reveal animations AFTER data is set on DOM
        setTimeout(() => this.initScrollAnimations(), 200);

        // Step 3: Proactively fetch artwork for all songs and update one by one as they arrive
        initialMap.forEach(async (song) => {
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
                // Persist to database so it's permanent for all users
                if (song.id) {
                  this.databaseService.updateSong(song.id, { img: artwork }).catch(() => { });
                }
              }
            } catch (err) {
              // Silence is golden
            }
          }
        });
      },
      error: () => {
        // Ensure we don't get stuck in loading
        this.loadingStats.set(false);
      }
    });

    // Fallback: If after 5 seconds we are still loading stats, force show
    setTimeout(() => {
      if (this.recentlyAdded().length > 0) {
        this.loadingStats.set(false);
      }
    }, 5000);
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
      threshold: 0.15, // 15% visibility triggers it
      rootMargin: '0px 0px -100px 0px' // Slightly more forgiving for fast mobile scrolls
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(entry.target, 'active');

          // Trigger counter animations individually when they come into view with a slight delay
          if (entry.target.id === 'artists-counter' && this.displayArtists() === 0) {
            setTimeout(() => this.animateCounter(this.totalArtists(), this.displayArtists), 400);
          }
          if (entry.target.id === 'songs-counter' && this.displaySongs() === 0) {
            setTimeout(() => this.animateCounter(this.totalSongs(), this.displaySongs), 600);
          }
        } else {
          // Remove active class when out of view to allow re-animation (Infinite feel)
          this.renderer.removeClass(entry.target, 'active');

          // Optional: Reset counters to 0 when they leave the viewport to allow re-counting
          if (entry.target.id === 'artists-counter') this.displayArtists.set(0);
          if (entry.target.id === 'songs-counter') this.displaySongs.set(0);
        }
      });
    }, observerOptions);

    const elements = this.el.nativeElement.querySelectorAll('.reveal');
    elements.forEach((element: HTMLElement) => observer.observe(element));
  }

  listenForInstallPrompt() {
    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      // Show a hint for iOS users after 5 seconds
      setTimeout(() => {
        this.showInstallBanner = true;
      }, 5000);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;

      // Enable both button and banner
      this.canInstall = true;
      this.showInstallBanner = true;
    });
  }

  async installPwa() {
    this.hapticService.light();
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
    this.hapticService.light();
    this.router.navigate(['/artists']);
  }

  navigateTo(path: string): void {
    this.hapticService.light();
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

  private animateCounter(target: number, signalRef: any) {
    let current = 0;
    const duration = 2000; // 2s para que se aprecie bien
    const start = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      current = Math.round(easedProgress * target);
      signalRef.set(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  playUISound(type: 'click' | 'success' | 'nav' = 'click') {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'click') {
        // Sonido de clic más orgánico y suave (tipo "pop" de interfaz de lujo)
        oscillator.type = 'sine';
        const now = audioCtx.currentTime;

        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.1);

        // El secreto está en un ataque casi instantáneo pero con un decaimiento muy suave
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.06, now + 0.01); // Volumen más bajo y suave
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
      } else if (type === 'nav') {
        // Sonido de navegación más aireado y profesional
        oscillator.type = 'sine';
        const now = audioCtx.currentTime;

        oscillator.frequency.setValueAtTime(440, now); // La nota 'La'
        oscillator.frequency.exponentialRampToValueAtTime(550, now + 0.2);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.03, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        oscillator.start(now);
        oscillator.stop(now + 0.25);
      }
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  downloadSong(song: Song) {
    if (!song.url) {
      this.toastService.info('Buscando enlace de descarga...');
      this.musicApi.getBestAudioStream(song.title, song.artist).subscribe((url: string | null) => {
        if (url) {
          this.navigateToDownload(song, url, 'default');
        } else {
          this.toastService.error('No se pudo encontrar un enlace de descarga válido.');
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
        artistName: song.artist,
        downloadUrl: url,
        mode: mode,
        songData: song
      }
    });
  }
}
