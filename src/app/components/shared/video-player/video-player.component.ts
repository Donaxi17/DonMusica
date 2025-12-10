import { Component, inject } from '@angular/core';
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
  videos = this.videoService.currentVideoList; // Renamed for template compatibility

  minimizeVideo() {
    this.videoService.minimizeVideo();
  }

  closeVideo() {
    this.videoService.closeVideo();
  }

  nextVideo() {
    this.videoService.nextVideo();
  }

  prevVideo() {
    this.videoService.prevVideo();
  }

  handlePlayerClick(event: Event) {
    event.stopPropagation();
    if (this.isMinimized()) {
      this.videoService.maximizeVideo();
    }
  }
}
