import { Component, inject, HostListener, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component'; // Adjust path if needed
import { SafePipe } from '../../../pipes/safe.pipe'; // Adjust path
import { VideoPlayerService } from '../../../services/video-player.service';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, SvgIconComponent, SafePipe],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent {
  videoService = inject(VideoPlayerService);

  // Expose signals helper
  currentVideoUrl = this.videoService.currentVideoUrl;
  isMinimized = this.videoService.isMinimized;
  watchOnYoutubeUrl = this.videoService.watchOnYoutubeUrl;
  showYoutubeFallback = this.videoService.showYoutubeFallback;
  currentVideoIndex = this.videoService.currentVideoIndex;
  videos = this.videoService.currentVideoList;

  // Player State: 1 = Playing, 2 = Paused, 0 = Ended
  playerState = signal<number>(-1);

  // Drag and Drop
  isDragging = false;
  hasMoved = false;
  dragStartX = 0;
  dragStartY = 0;
  videoPosition = { x: 0, y: 0 };

  onDragStart(event: MouseEvent | TouchEvent) {
    if (!this.isMinimized()) return;

    this.isDragging = true;
    this.hasMoved = false;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    this.dragStartX = clientX - this.videoPosition.x;
    this.dragStartY = clientY - this.videoPosition.y;

    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const newX = clientX - this.dragStartX;
    const newY = clientY - this.dragStartY;

    // Si se movió más de 5px, considerarlo como drag
    if (Math.abs(newX - this.videoPosition.x) > 5 || Math.abs(newY - this.videoPosition.y) > 5) {
      this.hasMoved = true;
    }

    this.videoPosition.x = newX;
    this.videoPosition.y = newY;

    event.preventDefault();
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd() {
    this.isDragging = false;
    // Reset hasMoved después de un pequeño delay
    setTimeout(() => {
      this.hasMoved = false;
    }, 100);
  }

  getVideoStyle() {
    if (!this.isMinimized() || (this.videoPosition.x === 0 && this.videoPosition.y === 0)) {
      return {};
    }
    return {
      transform: `translate(${this.videoPosition.x}px, ${this.videoPosition.y}px)`
    };
  }

  minimizeVideo() {
    this.videoService.minimizeVideo();
  }

  closeVideo() {
    this.videoService.closeVideo();
    this.playerState.set(-1);
  }

  nextVideo() {
    this.videoService.nextVideo();
    this.playerState.set(-1);
  }

  prevVideo() {
    this.videoService.prevVideo();
    this.playerState.set(-1);
  }

  handlePlayerClick(event: Event) {
    event.stopPropagation();
    // Solo maximizar si fue un click sin movimiento
    if (this.isMinimized() && !this.hasMoved) {
      this.videoService.maximizeVideo();
    }
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (this.currentVideoUrl() && event.data) {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        if (data.event === 'onStateChange') {
          this.playerState.set(data.info);

          if (data.info === 0) {
            this.nextVideo();
          }
        }
      } catch (e) { }
    }
  }

  togglePause() {
    const iframe = document.querySelector('app-video-player iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      const command = this.playerState() === 1 ? 'pauseVideo' : 'playVideo';
      iframe.contentWindow.postMessage(JSON.stringify({
        'event': 'command',
        'func': command,
        'args': ''
      }), '*');
    }
  }

  resumeVideo() {
    const iframe = document.querySelector('app-video-player iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        'event': 'command',
        'func': 'playVideo',
        'args': ''
      }), '*');
    }
  }
}
