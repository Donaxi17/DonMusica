import { Component, OnInit, signal, HostListener, ViewChild, ElementRef, inject, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Song, PlaylistService } from '../../services/playlist.service';
import { filter } from 'rxjs/operators';
import { FooterComponent } from '../shared/footer/footer.component';
import { RecentlyPlayedComponent } from '../shared/recently-played/recently-played.component';
import { RedesSocialesComponent } from '../redes-sociales/redes-sociales.component';
import { VideoPlayerComponent } from '../shared/video-player/video-player.component';
import { SettingsService } from '../../services/settings.service';
import { HapticService } from '../../services/haptic.service';
import { ARTISTS_DATA } from '../../models/artists.data';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, RecentlyPlayedComponent, RedesSocialesComponent, VideoPlayerComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  @ViewChild('progressBarRef') progressBarRef!: ElementRef<HTMLElement>;

  // UI State (Regular properties as used in template)
  showHistory = false;
  showMobileMoreMenu = false;
  showBackToTop = false;
  scrollProgress = 0;
  showLanguageMenu = false;
  showMoreMenu = false;
  imageLoadError = false;
  isMenuOpen = false;
  isLoadingRoute = false;

  // Player State
  currentSong: any = null;
  isPlaying = false;
  currentTime = '0:00';
  duration = '0:00';
  progress = 0;
  isMuted = false;
  volume = 1;
  isFavoritesPlaying = false;
  isDragging = false;
  playbackContext = 'unknown'; // Added to track where music is from

  // Swipe Gestures for Mini Player
  swipeStartX = 0;
  swipeDeltaX = 0;
  isSwiping = false;
  wasSwiping = false; // Flag to prevent click after a real swipe

  private router = inject(Router);
  public playerService = inject(PlayerService);
  private playlistService = inject(PlaylistService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  public settingsService = inject(SettingsService);
  private hapticService = inject(HapticService);
  public languageService = inject(LanguageService);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoadingRoute = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoadingRoute = false;
        this.isMenuOpen = false;
        this.showMobileMoreMenu = false;
        this.showMoreMenu = false;
        this.showLanguageMenu = false;
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo(0, 0);
        }
      }
      this.cdr.markForCheck();
    });

    // Listener for history panel
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('openHistory', () => {
        this.showHistory = true;
        this.cdr.detectChanges();
      });
      document.addEventListener('closeHistory', () => {
        this.showHistory = false;
        this.cdr.detectChanges();
      });
    }
  }

  ngOnInit() {
    this.playerService.currentSong$.subscribe(song => {
      this.currentSong = song;
      this.imageLoadError = false;
      this.isDragging = false; // Fix: Reset on song change
      this.progress = 0;
      this.cdr.markForCheck();
    });

    this.playerService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
      this.cdr.markForCheck();
    });

    this.playerService.currentTime$.subscribe(time => {
      // Only update if not dragging to prevent UI stutter
      if (!this.isDragging) {
        this.currentTime = this.formatTime(time);
        this.cdr.markForCheck();
      }
    });

    this.playerService.duration$.subscribe(dur => {
      this.duration = this.formatTime(dur);
      this.cdr.markForCheck();
    });

    this.playerService.progress$.subscribe(prog => {
      // Only update if not dragging to prevent UI stutter
      if (!this.isDragging) {
        this.progress = prog;
        this.cdr.markForCheck();
      }
    });

    this.playerService.isMuted$.subscribe(muted => {
      this.isMuted = muted;
      this.cdr.markForCheck();
    });

    this.playerService.volume$.subscribe(vol => {
      this.volume = vol / 100;
      this.cdr.markForCheck();
    });

    this.playerService.isFavoritesPlaying$.subscribe(fav => {
      this.isFavoritesPlaying = fav;
      this.cdr.markForCheck();
    });

    this.playerService.playbackContext$.subscribe(ctx => {
      this.playbackContext = ctx;
      this.cdr.markForCheck();
    });
  }

  // --- Navigation & UI ---

  navigateTo(route: string) {
    this.hapticService.light();
    this.router.navigate([route]);
    this.isMenuOpen = false;
    this.showMobileMoreMenu = false;
    this.showMoreMenu = false;
    this.cdr.markForCheck();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  isArtistActive(): boolean {
    return this.router.url.startsWith('/artists') || this.router.url.startsWith('/artist/');
  }

  isBrowseActive(): boolean {
    return this.router.url.startsWith('/browse');
  }

  isMoreActive(): boolean {
    const routes = ['/playlists', '/blog', '/saved-lyrics', '/offline-music', '/upload-music', '/tools', '/sin-copyright', '/radio'];
    return routes.some(r => this.router.url.startsWith(r));
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.markForCheck();
  }

  toggleHistory() {
    this.hapticService.medium();
    this.showHistory = !this.showHistory;
    this.cdr.markForCheck();
  }

  shouldHideFooter(): boolean {
    const hiddenRoutes = ['/player', '/videos'];
    const isBiography = this.router.url.includes('/biography');
    return isBiography || hiddenRoutes.some(route => this.router.url.startsWith(route));
  }

  toggleMobileMoreMenu(event?: Event) {
    this.hapticService.light();
    if (event) event.stopPropagation();
    this.showMobileMoreMenu = !this.showMobileMoreMenu;
    this.cdr.markForCheck();
  }

  closeMobileMoreMenu() {
    this.showMobileMoreMenu = false;
    this.cdr.markForCheck();
  }

  toggleMoreMenu(event: Event) {
    this.hapticService.light();
    event.stopPropagation();
    this.showMoreMenu = !this.showMoreMenu;
    this.showLanguageMenu = false;
    this.cdr.markForCheck();
  }

  closeMoreMenu() {
    this.showMoreMenu = false;
    this.cdr.markForCheck();
  }

  toggleLanguageMenu(event: Event) {
    this.hapticService.light();
    event.stopPropagation();
    this.showLanguageMenu = !this.showLanguageMenu;
    this.showMoreMenu = false;
    this.cdr.markForCheck();
  }

  closeLanguageMenu() {
    this.showLanguageMenu = false;
    this.cdr.markForCheck();
  }

  changeLanguage(lang: string) {
    this.hapticService.medium();
    const normalizedLang = lang.toLowerCase() as 'es' | 'en';
    this.languageService.setLanguage(normalizedLang);
    this.cdr.markForCheck();
  }

  toggleDataSaver() {
    this.hapticService.medium();
    this.settingsService.toggleDataSaver();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const scroll = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress = (scroll / (docHeight || 1)) * 100;
      this.showBackToTop = scroll > 300;
      this.cdr.detectChanges();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Don't close menus if clicking inside the mini player or interactive areas
    if (target.closest('.ultra-glass-player')) return;

    this.showMoreMenu = false;
    this.showLanguageMenu = false;
    this.cdr.markForCheck();
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Fallback para casos donde window.scrollTo no sea suficiente
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- Player Controls ---

  togglePlayPause() {
    this.playerService.togglePlay();
  }

  previousTrack() {
    this.playerService.previousTrack();
  }

  nextTrack() {
    this.hapticService.medium();
    this.playerService.nextTrack();
  }

  openPlayer() {
    this.hapticService.light();

    // Clicking the art/caratula should generally lead to the player experience
    if (this.playbackContext?.startsWith('smart-shuffle')) {
      this.router.navigate(['/smart-shuffle']);
    } else {
      this.router.navigate(['/player']);
    }
  }

  goToArtistDetail(event: Event) {
    if (this.wasSwiping) return; // Ignore if we just finished a swipe

    this.hapticService.medium();
    event.stopPropagation();

    if (this.currentSong) {
      // 1. Specific Contexts related to sections (User requests)
      if (this.playbackContext === 'free-music') {
        this.router.navigate(['/sin-copyright']);
        return;
      }
      if (this.playbackContext === 'upload-music') {
        this.router.navigate(['/upload-music']);
        return;
      }
      if (this.playbackContext === 'offline-music') {
        this.router.navigate(['/offline-music']);
        return;
      }
      if (this.playbackContext === 'playlists') {
        this.router.navigate(['/playlists']);
        return;
      }
      if (['charts', 'new-releases', 'trends', 'lyrics', 'browse'].includes(this.playbackContext)) {
        this.router.navigate(['/browse/' + (this.playbackContext === 'browse' ? '' : this.playbackContext)]);
        return;
      }
      if (this.playbackContext?.startsWith('home')) {
        this.router.navigate(['/'], { fragment: 'recientes' });
        return;
      }
      if (this.playbackContext?.startsWith('smart-shuffle')) {
        this.router.navigate(['/smart-shuffle']);
        return;
      }

      // 2. ID check: If we have an Artist ID (from DB or enrichment)
      let artistId = this.currentSong.artistId || (this.currentSong as any).artistID;

      // Rescue: If ID is missing but we have an artist name, try to find it in our local data
      if (!artistId && this.currentSong.artist) {
        const foundArtist = ARTISTS_DATA.find(a =>
          a.name.toLowerCase() === this.currentSong.artist.toLowerCase()
        );
        if (foundArtist) {
          artistId = foundArtist.id;
        }
      }

      if (artistId && artistId !== 0 && artistId !== '0') {
        this.router.navigate(['/artist', artistId]);
        return;
      }

      // 3. Context check: If we are already in an artist context, try to stay there or extract ID
      if (this.playbackContext === 'artist' && this.currentSong.artistId) {
        this.router.navigate(['/artist', this.currentSong.artistId]);
        return;
      }

      // 4. Fallback search by name if ID is missing (common for iTunes/external songs)
      if (this.currentSong.artist) {
        this.router.navigate(['/artists'], { queryParams: { q: this.currentSong.artist } });
        return;
      }

      // 5. Final fallback
      this.openPlayer();
    }
  }

  closePlayer() {
    this.hapticService.light();
    this.playerService.stop();
  }

  onImageError(event: any) {
    if (this.currentSong && !this.imageLoadError) {
      const artistImg = this.playerService.getArtistImageForSong(this.currentSong);
      if (artistImg && event.target.src !== artistImg) {
        event.target.src = artistImg;
        this.currentSong = { ...this.currentSong, img: artistImg };
        return;
      }
    }
    this.imageLoadError = true;
    this.cdr.markForCheck();
  }

  isFavorite(id: string): boolean {
    return this.playlistService.isFavorite(id);
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getContextLabel(): string {
    if (!this.playbackContext || this.playbackContext === 'unknown') return '';

    const contextMap: { [key: string]: string } = {
      'free-music': 'Sin Copyright',
      'upload-music': 'Mis Archivos',
      'offline-music': 'Modo Offline',
      'playlists': 'Mis Playlists',
      'charts': 'Rankings',
      'new-releases': 'Novedades',
      'trends': 'Tendencias',
      'lyrics': 'Letras',
      'artist': 'Artista',
      'home-trends': 'Tendencias Home',
      'home-recent': 'Recién Agregado'
    };

    if (this.playbackContext.startsWith('smart-shuffle')) return 'Smart Shuffle';

    return contextMap[this.playbackContext] || '';
  }

  // --- Progress Bar Dragging ---

  startDrag(event: MouseEvent | TouchEvent) {
    event.stopPropagation(); // Prevent swipe from starting when dragging progress
    this.hapticService.light();
    this.isDragging = true;
    this.updateProgressFromEvent(event);
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  handleGlobalMove(event: MouseEvent | TouchEvent) {
    if (this.isDragging) {
      this.updateProgressFromEvent(event);
    } else if (this.isSwiping) {
      this.onSwipeMoveGlobal(event);
    }
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  handleGlobalEnd() {
    if (this.isDragging) {
      this.stopDrag();
    } else if (this.isSwiping) {
      this.onSwipeEndGlobal();
    }
  }
  stopDrag() {
    this.isDragging = false;
    // Final seek on the actual player service
    this.playerService.seekTo(this.progress);
    this.cdr.markForCheck();
  }

  private updateProgressFromEvent(event: MouseEvent | TouchEvent) {
    if (!this.progressBarRef) return;

    const rect = this.progressBarRef.nativeElement.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;

    // Calculate relative position and percentage
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const percentage = pos * 100;

    // Update local state for immediate feedback
    this.progress = percentage;

    // Optional: approximate currentTime for UI if duration is available
    // But since Layout holds formatted strings, we might need raw duration from service
    // For now, updating progress is the main goal for the bar.

    this.cdr.markForCheck();
  }

  // --- Mini Player Swipe Gestures (Works on Mobile and Desktop) ---

  onSwipeStart(event: MouseEvent | TouchEvent) {
    // Only swipe if not dragging the progress bar and not clicking buttons
    const target = event.target as HTMLElement;
    if (this.isDragging || target.closest('button')) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
    this.swipeStartX = clientX;
    this.isSwiping = true;
    this.swipeDeltaX = 0;
  }

  onSwipeMoveGlobal(event: MouseEvent | TouchEvent) {
    if (!this.isSwiping) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
    const rawDelta = clientX - this.swipeStartX;

    // Visual translation with rubber-band resistance
    if (Math.abs(rawDelta) > 10) {
      this.wasSwiping = true; // Mark as a "real" swipe/drag
    }

    if (Math.abs(rawDelta) > 120) {
      this.swipeDeltaX = rawDelta > 0
        ? 120 + (rawDelta - 120) * 0.3
        : -120 + (rawDelta + 120) * 0.3;
    } else {
      this.swipeDeltaX = rawDelta;
    }
  }

  onSwipeEndGlobal() {
    if (!this.isSwiping) return;

    const threshold = 70; // Increased sensitivity (was 100)

    if (this.swipeDeltaX > threshold) {
      // Swipe Right -> Next (User's preferred logic)
      this.hapticService.medium();
      this.nextTrack();
    } else if (this.swipeDeltaX < -threshold) {
      // Swipe Left -> Previous
      this.hapticService.medium();
      this.previousTrack();
    }

    // Reset with animation
    this.isSwiping = false;
    this.swipeDeltaX = 0;

    // Briefly keep wasSwiping=true to allow (click) event to check it and refuse action
    setTimeout(() => {
      this.wasSwiping = false;
    }, 100);

    this.cdr.markForCheck();
  }
}
