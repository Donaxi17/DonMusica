import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../services/playlist.service';
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
  currentSong: Song | null = null;
  isPlaying = false;
  isFavoritesPlaying = false;
  showMoreMenu = false;
  showMobileMoreMenu = false;
  showHistory = false;
  progress = 0;
  private previousRoute: string = '/';

  constructor(
    public playerService: PlayerService,
    public router: Router
  ) { }

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('closeHistory', () => {
        this.showHistory = false;
      });
    }

    this.playerService.currentSong$.subscribe(song => {
      this.currentSong = song;
    });

    this.playerService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
    });

    this.playerService.isFavoritesPlaying$.subscribe(isFav => {
      this.isFavoritesPlaying = isFav;
    });

    this.playerService.progress$.subscribe(prog => {
      this.progress = prog;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (!event.url.startsWith('/player')) {
        this.previousRoute = event.url;
      }
      this.showMobileMoreMenu = false;
      this.showMoreMenu = false;
    });
  }

  seekTo(event: MouseEvent): void {
    event.stopPropagation(); // Prevent opening player
    const progressBar = event.currentTarget as HTMLElement;
    const clickPosition = event.offsetX;
    const barWidth = progressBar.offsetWidth;
    const percentage = (clickPosition / barWidth) * 100;
    this.playerService.seekTo(percentage);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Cerrar menú desktop si se hace clic fuera
    if (this.showMoreMenu) {
      const target = event.target as HTMLElement;
      // Asumiendo que el botón y el menú tienen ids o clases específicas, o simplemente cerramos
      // si el clic no fue procesado por el botón de toggle (que usa stopPropagation)
      this.showMoreMenu = false;
    }

    // Cerrar menú móvil si se hace clic fuera
    if (this.showMobileMoreMenu) {
      this.showMobileMoreMenu = false;
    }
  }

  isMoreActive(): boolean {
    const moreRoutes = ['/sin-copyright', '/converter', '/radio', '/playlists', '/blog', '/saved-lyrics', '/about', '/contact'];
    return moreRoutes.some(route => this.isActive(route));
  }

  toggleMoreMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.showMoreMenu = !this.showMoreMenu;
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
    this.router.navigate(['/player']);
  }
}
