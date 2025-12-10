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

  // Auto-advance system
  private checkInterval: any = null;
  private hasAutoAdvanced = false;
  private actualPlayingTime = 0; // milliseconds of actual playback
  private lastCheckTime = 0;
  private isCurrentlyPlaying = false;
  private playerState = -1; // -1 = unstarted, 0 = ended, 1 = playing, 2 = paused

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

        console.log('🎬 Video loaded - Auto-advance system active (checks every 10s)');
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

    // If video is playing, add elapsed time to actual playing time
    if (this.isCurrentlyPlaying) {
      this.actualPlayingTime += elapsed;

      const minutes = Math.floor(this.actualPlayingTime / 60000);
      const seconds = Math.floor((this.actualPlayingTime % 60000) / 1000);
      console.log(`⏱️ Video playing for: ${minutes}m ${seconds}s (State: ${this.playerState})`);
    }

    this.lastCheckTime = now;

    // Auto-advance after 4 minutes of ACTUAL playing time
    if (this.actualPlayingTime > 240000 && !this.hasAutoAdvanced) {
      console.log(`⏭️ Video timeout (4m 0s), advancing to next...`);
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
        this.playerState = state;

        // State 0 = Video ended
        if (state === 0) {
          console.log('✅ YouTube event: Video ended, advancing to next...');
          this.isCurrentlyPlaying = false;
          this.handleVideoEnd();
        }
        // State 1 = Playing
        else if (state === 1) {
          console.log('▶️ YouTube event: Video playing');
          this.isCurrentlyPlaying = true;
          this.lastCheckTime = Date.now(); // Reset timer when resuming
        }
        // State 2 = Paused
        else if (state === 2) {
          console.log('⏸️ YouTube event: Video paused');
          this.isCurrentlyPlaying = false;
        }
      }

      // Also check infoDelivery events
      if (data.event === 'infoDelivery' && data.info) {
        if (data.info.playerState !== undefined) {
          const state = data.info.playerState;
          this.playerState = state;

          if (state === 0) {
            console.log('✅ YouTube infoDelivery: Video ended, advancing to next...');
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
}
