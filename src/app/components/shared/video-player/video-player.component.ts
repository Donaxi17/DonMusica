import { Component, inject, HostListener, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { SafePipe } from '../../../pipes/safe.pipe';
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

  // Expose signals
  currentVideoUrl = this.videoService.currentVideoUrl;
  isMinimized = this.videoService.isMinimized;
  watchOnYoutubeUrl = this.videoService.watchOnYoutubeUrl;
  showYoutubeFallback = this.videoService.showYoutubeFallback;
  currentVideoIndex = this.videoService.currentVideoIndex;
  videos = this.videoService.currentVideoList;

  // Auto-advance timer (fallback for localhost)
  private autoAdvanceTimer: any = null;
  private hasAutoAdvanced = false;

  // Drag and Drop
  isDragging = false;
  hasMoved = false;
  dragStartX = 0;
  dragStartY = 0;
  videoPosition = { x: 0, y: 0 };

  constructor() {
    // Watch for video URL changes
    effect(() => {
      const url = this.currentVideoUrl();
      if (url) {
        // Reset state
        this.hasAutoAdvanced = false;

        // Clear any existing timer
        if (this.autoAdvanceTimer) {
          clearTimeout(this.autoAdvanceTimer);
        }

        // Enable YouTube event listening (works in production)
        setTimeout(() => {
          this.enableYouTubeListening();
        }, 1000);

        // Fallback timeout for localhost (4 minutes)
        // In production, the onStateChange event will trigger first
        this.autoAdvanceTimer = setTimeout(() => {
          if (!this.hasAutoAdvanced) {
            console.log('⏭️ [Fallback] Auto-advancing after 4 minutes (localhost mode)');
            this.handleVideoEnd();
          }
        }, 240000); // 4 minutes

        console.log('🎬 Video loaded - YouTube events enabled + 4min fallback timer');
      } else {
        // Video closed, clear timer
        if (this.autoAdvanceTimer) {
          clearTimeout(this.autoAdvanceTimer);
          this.autoAdvanceTimer = null;
        }
      }
    });
  }

  /**
   * Enable YouTube iframe API event listening
   * This works in production but is blocked by CORS on localhost
   */
  private enableYouTubeListening() {
    const iframe = document.querySelector('app-video-player iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      try {
        // Tell YouTube iframe to send us events
        iframe.contentWindow.postMessage(JSON.stringify({
          'event': 'listening',
          'id': 1,
          'channel': 'widget'
        }), '*');
        console.log('📡 YouTube event listening enabled');
      } catch (e) {
        console.warn('⚠️ Could not enable YouTube listening (expected on localhost)');
      }
    }
  }

  /**
   * Listen for YouTube iframe messages
   * State 0 = ended, 1 = playing, 2 = paused
   */
  @HostListener('window:message', ['$event'])
  onYouTubeMessage(event: MessageEvent) {
    if (!this.currentVideoUrl() || !event.data) return;

    try {
      let data = event.data;

      // Parse if string
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      // Check for state change event
      if (data.event === 'onStateChange') {
        const state = data.info;

        // State 0 = Video ended
        if (state === 0) {
          console.log('✅ YouTube event: Video ended, advancing to next...');
          this.handleVideoEnd();
        }
      }

      // Also check infoDelivery events
      if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
        console.log('✅ YouTube infoDelivery: Video ended, advancing to next...');
        this.handleVideoEnd();
      }
    } catch (e) {
      // Silently ignore parsing errors
    }
  }

  private handleVideoEnd() {
    // Prevent multiple calls
    if (this.hasAutoAdvanced) {
      return;
    }

    this.hasAutoAdvanced = true;

    // Clear the fallback timer
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }

    // Advance to next video
    setTimeout(() => {
      this.nextVideo();
    }, 500);
  }

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
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  nextVideo() {
    this.hasAutoAdvanced = true;
    this.videoService.nextVideo();
  }

  prevVideo() {
    this.hasAutoAdvanced = true;
    this.videoService.prevVideo();
  }

  handlePlayerClick(event: Event) {
    event.stopPropagation();
    // Solo maximizar si fue un click sin movimiento
    if (this.isMinimized() && !this.hasMoved) {
      this.videoService.maximizeVideo();
    }
  }
}
