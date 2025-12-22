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

  // Helpers
  get currentVideo() {
    const idx = this.currentVideoIndex();
    const list = this.videos();
    return (idx >= 0 && idx < list.length) ? list[idx] : null;
  }


  // UI State
  isAmbientMode = signal<boolean>(true); // Dynamic glow
  isTheaterFocus = signal<boolean>(false); // Hide buttons for immersion
  private checkInterval: any = null;
  private hasAutoAdvanced = false;
  private hasShownWarning = false; // Para notificar 10s antes
  private actualPlayingTime = 0; // milliseconds of actual playback
  private lastCheckTime = 0;
  private isCurrentlyPlaying = false;
  private playerState = -1; // -1 = unstarted, 0 = ended, 1 = playing, 2 = paused

  // YouTube video info
  private videoDuration = 240; // Default 4 minutes in seconds
  private currentTime = 0; // Current playback position in seconds

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
        this.hasShownWarning = false;
        this.actualPlayingTime = 0;
        this.lastCheckTime = Date.now();
        this.isCurrentlyPlaying = true; // Assume playing since autoplay=1
        this.playerState = -1;

        // Clear any existing interval
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
        }

        // Enable YouTube event listening (works in production)
        setTimeout(() => {
          this.enableYouTubeListening();
        }, 1000);

        // Start checking every 10 seconds
        this.checkInterval = setInterval(() => {
          this.checkPlaybackProgress();
        }, 10000); // Check every 10 seconds
      } else {
        // Video closed, clear interval
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
          this.checkInterval = null;
        }
        this.actualPlayingTime = 0;
        this.isCurrentlyPlaying = false;
      }
    });
  }

  /**
   * Check playback progress and advance if needed
   * This runs every 10 seconds
   */
  private checkPlaybackProgress() {
    if (this.hasAutoAdvanced) return;

    const now = Date.now();
    const elapsed = now - this.lastCheckTime;

    if (this.isCurrentlyPlaying) {
      this.actualPlayingTime += elapsed;
    }

    this.lastCheckTime = now;

    // --- SMART AUTO-ADVANCE ---
    // If we have real video duration, use it (with 3s margin)
    // Otherwise use a safer 10-minute fallback for music videos
    const effectiveDuration = this.videoDuration > 0 ? this.videoDuration : 600;
    const currentPos = this.currentTime > 0 ? this.currentTime : (this.actualPlayingTime / 1000);

    // Warning 10s before end
    if (currentPos > (effectiveDuration - 10) && !this.hasShownWarning) {
      this.hasShownWarning = true;
    }

    // Advance if current position is near the end
    if (currentPos >= (effectiveDuration - 2) && !this.hasAutoAdvanced) {
      this.handleVideoEnd();
    }
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
      } catch (e) {
        // Silently fail - expected on localhost
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
        this.playerState = state;

        // State 0 = Video ended
        if (state === 0) {
          // console.log('✅ Video ended, advancing to next...');
          this.isCurrentlyPlaying = false;
          this.handleVideoEnd();
        }
        // State 1 = Playing
        else if (state === 1) {
          this.isCurrentlyPlaying = true;
          this.lastCheckTime = Date.now(); // Reset timer when resuming
        }
        // State 2 = Paused
        else if (state === 2) {
          this.isCurrentlyPlaying = false;
        }
      }

      // Capture video info (duration, current time)
      if (data.event === 'infoDelivery' && data.info) {
        // Get duration
        if (data.info.duration !== undefined) {
          this.videoDuration = data.info.duration;
        }

        // Get current time
        if (data.info.currentTime !== undefined) {
          this.currentTime = data.info.currentTime;
        }

        // Check player state
        if (data.info.playerState !== undefined) {
          const state = data.info.playerState;
          this.playerState = state;

          if (state === 0) {
            // console.log('✅ Video ended, advancing to next...');
            this.isCurrentlyPlaying = false;
            this.handleVideoEnd();
          } else if (state === 1) {
            this.isCurrentlyPlaying = true;
            this.lastCheckTime = Date.now();
          } else if (state === 2) {
            this.isCurrentlyPlaying = false;
          }
        }
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

    // Clear the check interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
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
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
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

  getCurrentVideoTitle(): string {
    const index = this.currentVideoIndex();
    const videoList = this.videos();
    if (index >= 0 && index < videoList.length) {
      return videoList[index].title;
    }
    return '';
  }

  getCurrentVideoArtist(): string {
    const index = this.currentVideoIndex();
    const videoList = this.videos();
    if (index >= 0 && index < videoList.length) {
      return videoList[index].artist;
    }
    return '';
  }

  getProgressPercentage(): number {
    // Try to use real YouTube time first (works in production)
    if (this.currentTime > 0 && this.videoDuration > 0) {
      const percentage = (this.currentTime / this.videoDuration) * 100;
      return Math.min(percentage, 100);
    }

    // Fallback to internal counter (localhost)
    const maxTime = 240000; // 4 minutes in milliseconds
    const percentage = (this.actualPlayingTime / maxTime) * 100;
    return Math.min(percentage, 100);
  }

  maximizeFromOverlay(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (!this.hasMoved) {
      this.videoService.maximizeVideo();
      // Reset position to center on maximize
      this.videoPosition = { x: 0, y: 0 };
    }
  }

  toggleAmbientMode() {
    this.isAmbientMode.set(!this.isAmbientMode());
  }

  toggleTheaterFocus() {
    this.isTheaterFocus.set(!this.isTheaterFocus());
  }

  /**
   * Listen for orientation changes to ensure the video player
   * accommodates correctly to the new viewport dimensions.
   */
  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange() {
    // Force a small delay to allow the browser to update dimensions
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // If we're not in landscape anymore, ensure body overflow is restored
    if (window.innerHeight > window.innerWidth && window.innerHeight > 600) {
      document.body.style.overflow = '';
    }
  }
}
