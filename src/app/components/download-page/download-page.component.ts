import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { OfflineService } from '../../services/offline.service';
import { ToastService } from '../../services/toast.service';
import { LyricsService } from '../../services/lyrics.service';
import { MusicApiService } from '../../services/music-api.service';
import { DonMusicaProService } from '../../services/don-musica-pro.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-download-page',
  standalone: true,
  imports: [CommonModule, SvgIconComponent, AdsContainerComponent],
  templateUrl: './download-page.component.html',
  styleUrl: './download-page.component.css'
})
export class DownloadPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private offlineService = inject(OfflineService);
  private toastService = inject(ToastService);
  private lyricsService = inject(LyricsService);
  private musicApi = inject(MusicApiService);
  private proService = inject(DonMusicaProService);
  public languageService = inject(LanguageService);

  countdown: number = 0; // Sin countdown
  songTitle: string = '';
  artistName: string = '';
  downloadUrl: string = '';

  // 'default' = green (file), 'offline' = blue (app storage), 'lyrics' = pink (saved lyrics)
  mode: 'default' | 'offline' | 'lyrics' = 'default';

  // Full song object for offline download
  songData: any = null;
  lyricsContent: string = ''; // For lyrics mode

  private intervalId: any;

  // Smartlink configuration
  // Active Monetag Smartlink
  // private readonly SMARTLINK_URL = 'https://otieu.com/4/10301736';

  // Backup Adsterra Smartlink (Future use)
  private readonly SMARTLINK_URL = 'https://www.effectivegatecpm.com/sw9g0tx52?key=973a1c8fac0e809dba93c52ce9b0de4c';

  isDownloading = false;

  constructor(
    private router: Router,
    private location: Location
  ) {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;

    if (state) {
      this.songTitle = state['songTitle'] || this.languageService.get('download.default_song');
      this.artistName = state['artistName'] || this.languageService.get('download.default_artist');
      this.downloadUrl = state['downloadUrl'] || '';
      this.mode = state['mode'] || 'default';
      this.songData = state['songData'] || null;
      this.lyricsContent = state['lyricsContent'] || '';
    }
  }

  ngOnInit(): void {
    this.countdown = 3;
    this.startCountdown();
  }

  private startCountdown() {
    this.intervalId = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  ngAfterViewInit(): void {
    // AdSense is now handled by AdsContainerComponent or removed in favor of Adsterra
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async startDownload(): Promise<void> {
    if (this.isDownloading) return;

    this.isDownloading = true;

    // 1. Open Monetag Smartlink (Monetization first!)
    window.open(this.SMARTLINK_URL, '_blank');

    // 2. Now check if storage is full for offline mode
    if (this.mode === 'offline' && this.offlineService.isStorageFull()) {
      this.toastService.error(this.languageService.get('download.toast.storage_full'));
      this.isDownloading = false;
      return;
    }

    // Wait 1 second before processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (this.mode === 'lyrics') {
        // --- MODE LYRICS ---
        try {
          let content = this.lyricsContent;
          if (!content && this.songTitle && this.artistName) {
            // Fetch if not provided
            const result = await this.musicApi.getLyrics(this.artistName, this.songTitle).toPromise();
            content = typeof result === 'string' ? result : ((result as any)?.lyrics || '');
          }

          if (content) {
            const saved = this.lyricsService.saveLyric(this.songTitle, this.artistName, content);
            if (saved) {
              this.toastService.success(this.languageService.get('download.toast.lyrics_saved'));
              this.goBack();
            } else {
              this.toastService.warning(this.languageService.get('download.toast.lyrics_limit'));
              this.goBack();
            }
          } else {
            this.toastService.error(this.languageService.get('download.toast.lyrics_not_found'));
            this.goBack();
          }
        } catch (e) {
          console.error(e);
          this.toastService.error(this.languageService.get('download.toast.lyrics_error'));
          this.goBack();
        }

      } else if (this.mode === 'offline' && this.songData) {
        // Mode Offline
        const success = await this.offlineService.downloadSong(this.songData);
        if (success) {
          this.toastService.success(this.languageService.get('download.toast.offline_success'));
          this.goBack();
        } else {
          this.toastService.error(this.languageService.get('download.toast.offline_error'));
          this.goBack();
        }
      } else if (this.downloadUrl) {
        // Mode File (Default) - Using Blob approach for better compatibility with cross-origin Piped/Dropbox
        this.toastService.info(this.languageService.get('download.toast.download_started'));

        try {
          let urlToFetch = this.downloadUrl;
          if (urlToFetch.includes('dropbox.com')) {
            urlToFetch = urlToFetch.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
            if (urlToFetch.includes('?')) {
              urlToFetch = urlToFetch.replace(/dl=[01]/g, 'dl=1');
              urlToFetch = urlToFetch.replace(/raw=[01]/g, 'dl=1');
              if (!urlToFetch.includes('dl=1')) urlToFetch += '&dl=1';
            } else {
              urlToFetch += '?dl=1';
            }
          }

          const response = await fetch(urlToFetch);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.songTitle} - ${this.artistName}.mp3`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.toastService.success(this.languageService.get('download.toast.download_success'));
          setTimeout(() => this.goBack(), 1000);
        } catch (fetchError) {
          console.error('Fetch download failed, falling back to direct link', fetchError);
          // Fallback to direct link if fetch fails
          const link = document.createElement('a');
          link.href = this.downloadUrl;
          link.target = '_blank';
          link.download = `${this.songTitle} - ${this.artistName}.mp3`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => this.goBack(), 1000);
        }
      }
    } catch (error) {
      console.error('General download error', error);
      this.toastService.error(this.languageService.get('download.toast.generic_error'));
      this.goBack();
    } finally {
      this.isDownloading = false;
    }
  }

  goBack(): void {
    this.location.back();
  }
}
