import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { SeoService } from '../../services/seo.service';
import { lastValueFrom } from 'rxjs';
import { VideoPlayerService, Video } from '../../services/video-player.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconComponent],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent {
  private http = inject(HttpClient);
  private seoService = inject(SeoService);
  private videoPlayerService = inject(VideoPlayerService);

  searchQuery = signal<string>('Bad Bunny');
  isLoading = signal<boolean>(false);

  // Binding to Service State for List Highlighting
  currentVideoIndex = this.videoPlayerService.currentVideoIndex;

  private readonly API_URL = 'https://itunes.apple.com/search';

  // Keep instances for Search logic
  private readonly PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.private.coffee',
    'https://pipedapi.drgns.space',
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.moomoo.me',
    'https://pipedapi.smnz.de'
  ];

  videos = signal<Video[]>([
    {
      id: '1',
      title: 'LUNA',
      artist: 'Feid & ATL Jacob',
      thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/9c/32/32/9c323260-243e-3b6d-3663-752109f78a0d/Job249c5306-695f-40c2-902e-36043234033c-159648939-PreviewImage_preview_image_nonvideo_sdr-Time1701363715625.png/600x600bb.jpg',
      views: 'Popular'
    },
    {
      id: '2',
      title: 'PERRO NEGRO',
      artist: 'Bad Bunny & Feid',
      thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Video126/v4/64/0e/0e/640e0e0e-0e0e-0e0e-0e0e-0e0e0e0e0e0e/Job249c5306-695f-40c2-902e-36043234033c-159648939-PreviewImage_preview_image_nonvideo_sdr-Time1701363715625.png/600x600bb.jpg',
      views: 'Tendencia'
    },
    {
      id: '3',
      title: 'QLONA',
      artist: 'Karol G & Peso Pluma',
      thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/12/34/56/12345678-1234-1234-1234-1234567890ab/cover.jpg/600x600bb.jpg',
      views: 'Top 10'
    }
  ]);

  constructor() {
    this.seoService.setSeoData(
      'Videos Musicales - DonMusica',
      'Disfruta de los videoclips oficiales de tus artistas favoritos. Calidad HD y sin interrupciones.'
    );
    this.search();
  }

  // Delegate Playback to Service
  playVideo(video: Video) {
    this.videoPlayerService.playVideo(video, this.videos());
  }

  search() {
    const query = this.searchQuery();
    if (!query.trim()) return;
    this.isLoading.set(true);

    const pipedSearch = this.searchPiped(query);
    const itunesSearch = lastValueFrom(this.http.get<any>(this.API_URL, {
      params: {
        term: query,
        media: 'music',
        entity: 'musicVideo',
        limit: '49'
      }
    })).catch(err => ({ results: [] }));

    Promise.all([pipedSearch, itunesSearch]).then(([youtubeResults, itunesResponse]) => {
      let combinedVideos: Video[] = [];

      if (youtubeResults && youtubeResults.length > 0) {
        combinedVideos = [...youtubeResults];
      }

      if (itunesResponse && itunesResponse.results) {
        const itunesVideos: Video[] = itunesResponse.results.map((item: any) => ({
          id: item.trackId.toString(),
          title: item.trackName,
          artist: item.artistName,
          thumbnail: item.artworkUrl100.replace('100x100', '600x600'),
          views: 'iTunes'
        }));
        combinedVideos = [...combinedVideos, ...itunesVideos];
      }

      this.videos.set(combinedVideos);
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error in combined search:', error);
      this.isLoading.set(false);
    });
  }

  async searchPiped(query: string): Promise<Video[] | null> {
    for (const instance of this.PIPED_INSTANCES) {
      try {
        const response: any = await lastValueFrom(this.http.get(`${instance}/search`, {
          params: { q: query, filter: 'all' }
        }));

        if (response && response.items) {
          const videos = response.items
            .filter((item: any) => item.type === 'stream' && !item.isShort)
            .map((item: any) => ({
              id: item.url.split('v=')[1],
              title: item.title,
              artist: item.uploaderName,
              thumbnail: item.thumbnail,
              views: this.formatViews(item.views)
            }));

          if (videos.length > 0) return videos;
        }
      } catch (error) {
        continue;
      }
    }
    return [];
  }

  updateQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  formatViews(views: number | string): string {
    // If it's a string (e.g. 'iTunes', 'Popular'), return as is
    if (typeof views === 'string') return views;

    if (!views) return '';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M vistas';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K vistas';
    }
    return views + ' vistas';
  }
}
