import { Component, inject, OnInit, AfterViewInit, OnDestroy, ElementRef, Renderer2, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
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
import { LanguageService } from '../../services/language.service';
import { PwaInstallService } from '../../services/pwa-install.service';
import { SettingsService } from '../../services/settings.service';
import { ImgFallbackDirective } from '../../directives/img-fallback.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AdsContainerComponent, RouterModule, NoConnectionComponent, SkeletonComponent, ImgFallbackDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
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
  public languageService = inject(LanguageService);
  public settingsService = inject(SettingsService);
  public pwaInstallService = inject(PwaInstallService);

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

  // Filter options for Trends - Linked to global settings
  selectedRegion = this.settingsService.selectedRegion;

  translatedRegions = computed(() => {
    return this.settingsService.regions.map(r => ({
      ...r,
      name: r.code === 'US' ? this.languageService.get('trends.world') : r.name
    }));
  });

  deferredPrompt: any;
  // canInstall remains for the Hero button if needed, but we'll link it to the service
  get canInstall() { return this.pwaInstallService.showInstallButton() && !this.pwaInstallService.isIOS(); }

  private observer: IntersectionObserver | null = null;

  constructor() {
    // Moved to constructor to maintain Injection Context
    toObservable(this.selectedRegion).pipe(skip(1), takeUntilDestroyed()).subscribe(region => {
      this.loadTrends(region);
    });
  }

  ngOnInit() {
    // Enhanced SEO
    this.seoService.setSeoData(
      'DonMusica - Música Urbana Gratis | Descargar MP3, Letras y Videos',
      'Escucha y descarga música urbana gratis en DonMusica. Reggaeton, trap, rap y más. Rankings actualizados, letras de canciones, videos musicales y música sin copyright para tus proyectos. Artistas como Bad Bunny, Karol G, Feid y más en donmusica.online'
    );

    // PWA listen handled by global service

    // Initial Load
    this.loadTrends(this.selectedRegion());
    this.loadStats();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Helper to fix dropbox URLs for images
  private fixDropboxUrl(url: string | undefined): string | undefined {
    if (!url) return url;
    if (url.includes('dropbox.com')) {
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=0', 'dl=1');
    }
    return url;
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

    this.databaseService.getLatestSongs(6).subscribe({
      next: async songs => {
        const currentList = this.recentlyAdded();
        const initialMap = songs.map(song => {
          // Fix Dropbox URL first
          const fixedImg = this.fixDropboxUrl(song.img);
          const existing = currentList.find(s => s.id === song.id);

          if (existing && !this.isGenericImage(existing.img)) {
            return { ...song, img: existing.img };
          }
          return { ...song, img: fixedImg };
        });

        this.recentlyAdded.set(initialMap);
        recentLoaded = true;
        checkLoadingFinished();
        requestAnimationFrame(() => this.initScrollAnimations());

        // Process artwork SEQUENTIALLY to avoid rate limits
        const processRecentlyAddedImages = async () => {
          for (const song of initialMap) {
            if (this.isGenericImage(song.img)) {
              try {
                await new Promise(resolve => setTimeout(resolve, 500));
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
                  if (song.id) {
                    this.databaseService.updateSong(song.id, { img: artwork }).catch(() => { });
                  }
                }
              } catch (err) { }
            }
          }
        };
        processRecentlyAddedImages();
      },
      error: () => {
        this.loadingStats.set(false);
      }
    });

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
      lower.includes('placehold.co') ||
      lower.includes('storageimagedisplay.com');
  }

  loadTrends(region: string = 'CO') {
    this.loadingTrends.set(true);
    this.musicApi.getTrending(region).subscribe({
      next: (songs) => {
        const previewSongs = songs.slice(0, 6);
        this.trendingSongs.set(previewSongs);
        this.loadingTrends.set(false);

        const processTrendingImages = async () => {
          for (const song of previewSongs) {
            if (this.isGenericImage(song.img)) {
              try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const artwork = await this.spotifyService.getTrackArtwork(song.title, song.artist);
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
              } catch (err) { }
            }
          }
        };
        processTrendingImages();
        requestAnimationFrame(() => this.initScrollAnimations());
      },
      error: (err) => {
        console.error('Error loading trending songs for home:', err);
        this.loadingTrends.set(false);
        this.trendingSongs.set([]);
      }
    });
  }

  changeRegion(region: 'CO' | 'US' | 'MX') {
    if (this.selectedRegion() === region) return;
    this.hapticService.light();
    this.selectedRegion.set(region);
  }

  trackByRegionCode(index: number, region: any): string {
    return region.code;
  }

  ngAfterViewInit() {
    this.initScrollAnimations();
  }

  private initScrollAnimations() {
    if (this.observer) {
      this.observer.disconnect();
    }

    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(entry.target, 'active');
          if (entry.target.id === 'artists-counter' && this.displayArtists() === 0) {
            setTimeout(() => this.animateCounter(this.totalArtists(), this.displayArtists), 400);
          }
          if (entry.target.id === 'songs-counter' && this.displaySongs() === 0) {
            setTimeout(() => this.animateCounter(this.totalSongs(), this.displaySongs), 600);
          }
        } else {
          this.renderer.removeClass(entry.target, 'active');
          if (entry.target.id === 'artists-counter') this.displayArtists.set(0);
          if (entry.target.id === 'songs-counter') this.displaySongs.set(0);
        }
      });
    }, observerOptions);

    const elements = this.el.nativeElement.querySelectorAll('.reveal');
    elements.forEach((element: HTMLElement) => this.observer?.observe(element));
  }


  async installPwa() {
    this.hapticService.light();
    this.pwaInstallService.installApp();
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
      this.toastService.warning(this.languageService.get('home.toast.fill_required'));
      return;
    }
    const message = `${this.languageService.get('home.whatsapp.message_header')}% 0A % 0A` +
      `${this.languageService.get('home.whatsapp.artist')} ${this.requestArtist}% 0A` +
      `${this.languageService.get('home.whatsapp.song')} ${this.requestSong} `;
    const phoneNumber = '573017966272';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    this.hapticService.success();
    this.toastService.success(this.languageService.get('home.toast.request_sent'));
    window.open(whatsappUrl, '_blank');
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
    if (date && typeof date.toMillis === 'function') {
      millis = date.toMillis();
    } else if (date && date.seconds) {
      millis = date.seconds * 1000;
    } else if (date instanceof Date) {
      millis = date.getTime();
    } else if (typeof date === 'string' || typeof date === 'number') {
      const d = new Date(date);
      millis = isNaN(d.getTime()) ? 0 : d.getTime();
    }

    if (millis === 0) return false;
    const now = new Date().getTime();
    const diff = now - millis;
    return diff < (48 * 60 * 60 * 1000); // 48 hours
  }

  getTimeAgo(date: any): string {
    if (!date) return this.languageService.get('time.new');
    let millis = 0;

    if (typeof date === 'number') {
      millis = date;
    } else if (date && typeof date.toMillis === 'function') {
      millis = date.toMillis();
    } else if (date && date.seconds) {
      millis = date.seconds * 1000;
    } else if (date instanceof Date) {
      millis = date.getTime();
    } else if (typeof date === 'string') {
      const d = new Date(date);
      millis = isNaN(d.getTime()) ? 0 : d.getTime();
    }

    if (millis === 0) return this.languageService.get('time.new');

    const now = new Date().getTime();
    const diff = now - millis;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return this.languageService.get('time.just_now');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return this.languageService.get('time.min_ago', minutes);
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return this.languageService.get('time.hour_ago', hours);
    const days = Math.floor(hours / 24);
    if (days < 30) return this.languageService.get('time.day_ago', days);

    return this.languageService.get('time.long_ago');
  }

  private animateCounter(target: number, signalRef: any) {
    let current = 0;
    const duration = 2000;
    const start = performance.now();
    const update = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      current = Math.round(easedProgress * target);
      signalRef.set(current);
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }

  downloadSong(song: Song) {
    if (!song.url) {
      this.toastService.info(this.languageService.get('home.toast.searching_download'));
      this.musicApi.getBestAudioStream(song.title, song.artist).subscribe((url: string | null) => {
        if (url) {
          this.navigateToDownload(song, url, 'default');
        } else {
          this.toastService.error(this.languageService.get('home.toast.download_not_found'));
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

  playUISound(type: 'click' | 'success' | 'nav' = 'click') {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      if (type === 'click') {
        oscillator.type = 'sine';
        const now = audioCtx.currentTime;
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.06, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
      } else if (type === 'nav') {
        oscillator.type = 'sine';
        const now = audioCtx.currentTime;
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(550, now + 0.2);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.03, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.25);
      }
    } catch (e) { }
  }

  /**
   * NUCLEAR RESET: Limpia TODO el caché, almacenamiento y service workers
   * Esto asegura que el usuario vea la versión más limpia y sin anuncios viejos.
   */
  async hardReset() {
    this.hapticService.success();
    this.toastService.info('Limpiando app y eliminando anuncios residuales...', 5000);

    try {
      // 1. Limpiar Bases de datos de Caché (Service Worker)
      if (typeof caches !== 'undefined') {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }

      // 2. Limpiar LocalStorage y SessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // 3. Desregistrar Service Workers
      if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }

      // 4. Recarga forzando la descarga del servidor (nuclear)
      this.toastService.success('¡Limpieza completada! Reiniciando...', 2000);
      setTimeout(() => {
        window.location.href = window.location.origin + '?reset=' + Date.now();
      }, 1500);

    } catch (e) {
      console.error('Error durante el reset:', e);
      window.location.reload();
    }
  }
}
