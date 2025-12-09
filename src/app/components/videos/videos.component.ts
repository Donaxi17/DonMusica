import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SafePipe } from '../../pipes/safe.pipe';
import { SeoService } from '../../services/seo.service';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { lastValueFrom } from 'rxjs';

interface Video {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  views: string;
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, SafePipe, SvgIconComponent],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.css'
})
export class VideosComponent {
  private seoService = inject(SeoService);
  private http = inject(HttpClient);

  currentVideoUrl = signal<string | null>(null);
  searchQuery = signal<string>('Feid');
  isLoading = signal<boolean>(false);
  isVideoLoading = signal<boolean>(false);
  watchOnYoutubeUrl = signal<string | null>(null);
  currentVideoIndex = signal<number>(-1);

  private readonly API_URL = 'https://itunes.apple.com/search';

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

  search() {
    const query = this.searchQuery();
    if (!query.trim()) return;
    this.isLoading.set(true);

    // Ejecutamos ambas búsquedas en paralelo (YouTube + iTunes)
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

      // 1. YouTube Results (Priority)
      if (youtubeResults && youtubeResults.length > 0) {
        combinedVideos = [...youtubeResults];
      }

      // 2. iTunes Results (Fallback/Additional)
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

  playVideo(video: Video) {
    this.isVideoLoading.set(true);

    const index = this.videos().findIndex(v => v.id === video.id);
    if (index !== -1) {
      this.currentVideoIndex.set(index);
    }

    this.seoService.setSeoData(
      `Ver ${video.title} - ${video.artist} | DonMusica`,
      `Reproduce el video oficial de ${video.title} interpretado por ${video.artist} en alta definición.`
    );

    if (!/^\d+$/.test(video.id)) {
      this.setPlayer(video.id);
    } else {
      const query = `${video.title} ${video.artist}`;
      this.findVideoId(query).then(videoId => {
        if (videoId) {
          this.setPlayer(videoId);
        } else {
          const origin = window.location.origin;
          const searchQ = encodeURIComponent(`${query} video`);
          this.currentVideoUrl.set(`https://www.youtube-nocookie.com/embed?listType=search&list=${searchQ}&autoplay=1&origin=${origin}`);
          this.watchOnYoutubeUrl.set(`https://www.youtube.com/results?search_query=${searchQ}`);
          this.isVideoLoading.set(false);
        }
      });
    }
  }

  private setPlayer(videoId: string) {
    const origin = window.location.origin;
    this.currentVideoUrl.set(`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&origin=${origin}`);
    this.watchOnYoutubeUrl.set(`https://www.youtube.com/watch?v=${videoId}`);
    this.isVideoLoading.set(false);
  }

  nextVideo() {
    const currentIndex = this.currentVideoIndex();
    const videos = this.videos();
    if (currentIndex < videos.length - 1) {
      this.playVideo(videos[currentIndex + 1]);
    }
  }

  prevVideo() {
    const currentIndex = this.currentVideoIndex();
    const videos = this.videos();
    if (currentIndex > 0) {
      this.playVideo(videos[currentIndex - 1]);
    }
  }

  private async findVideoId(query: string): Promise<string | null> {
    for (const instance of this.PIPED_INSTANCES) {
      try {
        const response: any = await lastValueFrom(this.http.get(`${instance}/search`, {
          params: { q: query, filter: 'music_videos' }
        }));

        if (response && response.items && response.items.length > 0) {
          const video = response.items.find((item: any) => item.type === 'stream' && !item.isShort);
          if (video && video.url) {
            return video.url.split('v=')[1];
          }
          if (response.items[0]?.url) {
            return response.items[0].url.split('v=')[1];
          }
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  private formatViews(views: number): string {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M vistas';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K vistas';
    }
    return views + ' vistas';
  }

  closeVideo() {
    this.currentVideoUrl.set(null);
    this.watchOnYoutubeUrl.set(null);
    this.currentVideoIndex.set(-1);
    this.seoService.setSeoData(
      'Videos Musicales - DonMusica',
      'Disfruta de los videoclips oficiales de tus artistas favoritos. Calidad HD y sin interrupciones.'
    );
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  updateQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
}
