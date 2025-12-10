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

  searchQuery = signal<string>('Karol G');
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
      id: 'iNu4Qp6d-3Q',
      title: 'QLONA',
      artist: 'Karol G & Peso Pluma',
      thumbnail: 'https://i.ytimg.com/vi/iNu4Qp6d-3Q/hqdefault.jpg',
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
      id: 'VQjdPI3XPAs',
      title: 'PERRO NEGRO',
      artist: 'Bad Bunny & Feid',
      thumbnail: 'https://i.ytimg.com/vi/VQjdPI3XPAs/hqdefault.jpg',
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

    // Hacer búsqueda en background después de 500ms
    setTimeout(() => this.search(), 500);
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
    // Create promises for all instances simultaneously
    const searchPromises = this.PIPED_INSTANCES.map(async (instance) => {
      try {
        const response: any = await Promise.race([
          lastValueFrom(this.http.get(`${instance}/search`, {
            params: { q: query, filter: 'all' }
          })),
          // Timeout after 3 seconds
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 3000)
          )
        ]);

        if (response && response.items) {
          const videos = response.items
            .filter((item: any) => item.type === 'stream' && !item.isShort)
            .map((item: any) => ({
              id: item.url.split('v=')[1],
              title: item.title,
              artist: item.uploaderName,
              // Use hqdefault for better reliability (maxresdefault not always available)
              thumbnail: `https://i.ytimg.com/vi/${item.url.split('v=')[1]}/hqdefault.jpg`,
              views: this.formatViews(item.views)
            }));

          if (videos.length > 0) {
            return videos;
          }
        }
        return null;
      } catch (error) {
        return null;
      }
    });

    // Race all instances - use the first one that succeeds
    try {
      const results = await Promise.race(
        searchPromises.map(p => p.then(result => {
          if (result && result.length > 0) return result;
          throw new Error('No results');
        }))
      );
      return results;
    } catch {
      // Silently fail - iTunes will provide results
      return [];
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
