import { Component, OnInit, signal, HostListener, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Song, PlaylistService } from '../../services/playlist.service';
import { filter } from 'rxjs/operators';
import { FooterComponent } from '../shared/footer/footer.component';
import { RecentlyPlayedComponent } from '../shared/recently-played/recently-played.component';
import { RedesSocialesComponent } from '../redes-sociales/redes-sociales.component';
import { VideoPlayerComponent } from '../shared/video-player/video-player.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, RecentlyPlayedComponent, RedesSocialesComponent, VideoPlayerComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  @ViewChild('progressBarRef') progressBarRef!: ElementRef<HTMLElement>;

  // Inject PlaylistService
  private playlistService = inject(PlaylistService);

  currentSong: Song | null = null;
  isPlaying = false;
  isFavoritesPlaying = false;
  showMoreMenu = false;
  showMobileMoreMenu = false;
  showHistory = false;
  showLanguageMenu = false;
  currentLanguage: 'ES' | 'EN' = 'EN';
  progress = 0;
  imageLoadError = false;

  isDragging = false;

  private previousRoute: string = '/';

  constructor(
    public playerService: PlayerService,
    public router: Router
  ) { }

  // Rest of code...

  isFavorite(songId: string | number): boolean {
    return this.playlistService.isFavorite(String(songId));
  }


  ngOnInit(): void {
    // Load saved language from localStorage
    if (typeof localStorage !== 'undefined') {
      const savedLanguage = localStorage.getItem('appLanguage') as 'ES' | 'EN';
      if (savedLanguage) {
        this.currentLanguage = savedLanguage;
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('closeHistory', () => {
        this.showHistory = false;
      });
    }

    this.playerService.currentSong$.subscribe(song => {
      this.currentSong = song;
      this.imageLoadError = false;
    });

    this.playerService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
    });

    this.playerService.isFavoritesPlaying$.subscribe(isFav => {
      this.isFavoritesPlaying = isFav;
    });

    this.playerService.progress$.subscribe(prog => {
      // Only update local progress if not dragging
      if (!this.isDragging) {
        this.progress = prog;
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (!event.url.startsWith('/player')) {
        this.previousRoute = event.url;
      }
      this.showMobileMoreMenu = false;
      this.showMoreMenu = false;
      this.showLanguageMenu = false;
    });
  }

  // --- Drag & Seek Logic ---
  startDrag(event: MouseEvent | TouchEvent): void {
    if (event.cancelable) {
      event.preventDefault(); // Prevent text selection/scroll
    }
    event.stopPropagation();
    this.isDragging = true;
    this.updateProgressFromEvent(event);
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent): void {
    if (this.isDragging) {
      this.updateProgressFromEvent(event);
    }
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  stopDrag(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.playerService.seekTo(this.progress);
    }
  }

  private updateProgressFromEvent(event: MouseEvent | TouchEvent): void {
    if (!this.progressBarRef) return;

    const progressBar = this.progressBarRef.nativeElement;
    const rect = progressBar.getBoundingClientRect();

    let clientX: number;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
    } else {
      clientX = event.touches[0].clientX;
    }

    // Calculate position
    const clickPosition = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (clickPosition / rect.width) * 100;

    // Update locally for smooth UI
    this.progress = percentage;
  }

  seekTo(event: MouseEvent): void {
    // Legacy click seek (fallback)
    this.startDrag(event);
    this.stopDrag();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Avoid closing if dragging
    if (this.isDragging) return;

    // Cerrar menú desktop si se hace clic fuera
    if (this.showMoreMenu) {
      this.showMoreMenu = false;
    }
    // Cerrar menú de idioma si se hace clic fuera
    if (this.showLanguageMenu) {
      this.showLanguageMenu = false;
    }
    // Cerrar menú móvil si se hace clic fuera
    if (this.showMobileMoreMenu) {
      this.showMobileMoreMenu = false;
    }
  }

  isMoreActive(): boolean {
    const moreRoutes = ['/tools', '/sin-copyright', '/radio', '/playlists', '/blog', '/saved-lyrics', '/about', '/contact'];
    return moreRoutes.some(route => this.isActive(route));
  }

  toggleMoreMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.showMoreMenu = !this.showMoreMenu;
    if (this.showMoreMenu) {
      this.showLanguageMenu = false;
    }
  }

  closeMoreMenu() {
    this.showMoreMenu = false;
  }

  toggleMobileMoreMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.showMobileMoreMenu = !this.showMobileMoreMenu;
  }

  closeMobileMoreMenu() {
    this.showMobileMoreMenu = false;
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    const urlTree = this.router.parseUrl(this.router.url);
    const urlSegmentGroup = urlTree.root.children['primary'];
    const urlSegments = urlSegmentGroup ? urlSegmentGroup.segments : [];
    const currentPath = '/' + urlSegments.map(s => s.path).join('/');

    if (route === '/') {
      return currentPath === '/';
    }

    return currentPath.startsWith(route);
  }

  togglePlayPause(): void {
    if (this.currentSong) {
      if (this.isPlaying) {
        this.playerService.pause();
      } else {
        this.playerService.play();
      }
    }
  }

  previousTrack(): void {
    this.playerService.previousTrack();
  }

  nextTrack(): void {
    this.playerService.nextTrack();
  }

  closePlayer(): void {
    this.playerService.stop();
  }

  openPlayer(): void {
    // If dragging, do nothing
    if (this.isDragging) return;

    if (this.playerService.playbackContext === 'artist' && this.currentSong?.artistId) {
      this.router.navigate(['/artist', this.currentSong.artistId]);
    } else {
      this.router.navigate(['/player']);
    }
  }

  toggleLanguageMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.showLanguageMenu = !this.showLanguageMenu;
    if (this.showLanguageMenu) {
      this.showMoreMenu = false;
    }
  }

  changeLanguage(language: 'ES' | 'EN') {
    this.currentLanguage = language;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('appLanguage', language);
    }
    // Aquí puedes agregar lógica adicional para cambiar el idioma de la app
    // Por ejemplo, usando un servicio de traducción
  }

  closeLanguageMenu() {
    this.showLanguageMenu = false;
  }

  onImageError(event: any) {
    this.imageLoadError = true;
  }
}
