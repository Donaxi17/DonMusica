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
  currentLanguage = 'ES';
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

  private router = inject(Router);
  public playerService = inject(PlayerService);
  private playlistService = inject(PlaylistService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  public settingsService = inject(SettingsService);
  private hapticService = inject(HapticService);

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
      this.cdr.markForCheck();
    });

    this.playerService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
      this.cdr.markForCheck();
    });

    this.playerService.currentTime$.subscribe(time => {
      this.currentTime = this.formatTime(time);
      this.cdr.markForCheck();
    });

    this.playerService.duration$.subscribe(dur => {
      this.duration = this.formatTime(dur);
      this.cdr.markForCheck();
    });

    this.playerService.progress$.subscribe(prog => {
      this.progress = prog;
      this.cdr.markForCheck();
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
    this.currentLanguage = lang;
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

  @HostListener('document:click')
  onDocumentClick() {
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
    if (this.playerService.playbackContext?.startsWith('smart-shuffle')) {
      this.router.navigate(['/smart-shuffle']);
    } else {
      this.router.navigate(['/player']);
    }
  }

  goToArtistDetail(event: Event) {
    this.hapticService.medium();
    event.stopPropagation();
    if (this.currentSong && (this.currentSong.artistId || this.currentSong.artist)) {
      // If it's a dynamic artist from search/top charts, we might want to search it first
      // but if we have an ID, we go directly.
      if (this.currentSong.artistId && this.currentSong.artistId !== 0 && this.currentSong.artistId !== '0') {
        this.router.navigate(['/artist', this.currentSong.artistId]);
      } else {
        // Fallback: search by name
        this.router.navigate(['/artists'], { queryParams: { q: this.currentSong.artist } });
      }
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

  // --- Progress Bar Dragging ---

  startDrag(event: MouseEvent | TouchEvent) {
    this.hapticService.light();
    this.handleDrag(event);

    if (isPlatformBrowser(this.platformId)) {
      const moveHandler = (e: MouseEvent | TouchEvent) => this.handleDrag(e);
      const endHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', endHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', endHandler);
      };

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', endHandler);
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', endHandler);
    }
  }

  private handleDrag(event: MouseEvent | TouchEvent) {
    if (this.progressBarRef) {
      const rect = this.progressBarRef.nativeElement.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      this.playerService.seekTo(pos * 100);
      this.cdr.detectChanges();
    }
  }
}
