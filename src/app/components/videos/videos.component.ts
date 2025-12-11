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

  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  private searchDebounceTimer: any = null;

  // Binding to Service State for List Highlighting
  currentVideoIndex = this.videoPlayerService.currentVideoIndex;

  private readonly API_URL = 'https://itunes.apple.com/search';

  // Keep instances for Search logic
  private readonly PIPED_INSTANCES = [
    'https://api.piped.private.coffee',
    'https://pipedapi.kavin.rocks',
    // 'https://pipedapi.drgns.space', // CORS Issues
    // 'https://api.piped.projectsegfau.lt', // CORS Issues
    // 'https://pipedapi.moomoo.me', // CORS Issues
    // 'https://pipedapi.smnz.de'
  ];

  videos = signal<Video[]>([]);


  // Trending videos precargados para mostrar inmediatamente
  private readonly TRENDING_VIDEOS: Video[] = [
    {
      id: 'SHq2qrFUlGY',
      title: 'QLONA',
      artist: 'Karol G & Peso Pluma',
      thumbnail: 'https://i.ytimg.com/vi/SHq2qrFUlGY/hqdefault.jpg',
      views: '🔥 Tendencia'
    },
    {
      id: 'kLp_Hh6DKWc',
      title: 'S91',
      artist: 'Karol G',
      thumbnail: 'https://i.ytimg.com/vi/kLp_Hh6DKWc/hqdefault.jpg',
      views: '⭐ Popular'
    },
    {
      id: 'saGYMhApaH8',
      title: 'LUNA',
      artist: 'Feid & ATL Jacob',
      thumbnail: 'https://i.ytimg.com/vi/saGYMhApaH8/hqdefault.jpg',
      views: '🎵 Top'
    },
    {
      id: 'QhBnZ6NPOY0',
      title: 'PERRO NEGRO',
      artist: 'Bad Bunny & Feid',
      thumbnail: 'https://i.ytimg.com/vi/QhBnZ6NPOY0/hqdefault.jpg',
      views: '🔥 Viral'
    },
    {
      id: 'sDKnKzYyx5c',
      title: 'Si Antes Te Hubiera Conocido',
      artist: 'Karol G',
      thumbnail: 'https://i.ytimg.com/vi/sDKnKzYyx5c/hqdefault.jpg',
      views: '💚 Hit'
    },
    {
      id: 'OSUxrSe5GbI',
      title: 'Gata Only',
      artist: 'FloyyMenor & Cris Mj',
      thumbnail: 'https://i.ytimg.com/vi/OSUxrSe5GbI/hqdefault.jpg',
      views: '🎶 Éxito'
    }
  ];

  constructor() {
    this.seoService.setSeoData(
      'Videos Musicales - DonMusica',
      'Disfruta de los videoclips oficiales de tus artistas favoritos. Calidad HD y sin interrupciones.'
    );

    // Cargar videos populares inmediatamente
    this.loadTrendingVideos();

    // Búsqueda automática desactivada - los usuarios pueden buscar manualmente
    // setTimeout(() => this.search(), 500);
  }

  loadTrendingVideos() {
    this.videos.set(this.TRENDING_VIDEOS);
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
          // Use highest quality artwork available
          thumbnail: item.artworkUrl100.replace('100x100', '600x600'),
          views: '🎵 iTunes'
        }));
        combinedVideos = [...combinedVideos, ...itunesVideos];
      }

      this.videos.set(combinedVideos);
      this.isLoading.set(false);
    }).catch(() => {
      // Silently handle errors - keep existing videos or show empty state
      this.isLoading.set(false);
    });
  }

  async searchPiped(query: string): Promise<Video[] | null> {
    // Use official YouTube Data API v3 (most stable and reliable)
    const API_KEY = 'AIzaSyBOVqgCBS239UOk7Mj-5OF2HrpcbWpXP-w';
    const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

    try {
      const response: any = await lastValueFrom(
        this.http.get(YOUTUBE_API_URL, {
          params: {
            part: 'snippet',
            q: query + ' official video',
            type: 'video',
            videoCategoryId: '10', // Music category
            maxResults: '20',
            key: API_KEY
          }
        })
      );

      if (response && response.items && response.items.length > 0) {
        const videos = response.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          views: '🎵 YouTube'
        }));

        return videos;
      }

      return null;
    } catch (error) {
      console.error('YouTube API error:', error);
      return null;
    }
  }

  updateQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);

    // Clear existing timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Wait 500ms after user stops typing before searching
    this.searchDebounceTimer = setTimeout(() => {
      if (input.value.trim()) {
        this.search();
      }
    }, 500);
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
