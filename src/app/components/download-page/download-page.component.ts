import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { OfflineService } from '../../services/offline.service';
import { ToastService } from '../../services/toast.service';

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

  countdown: number = 0; // Sin countdown
  songTitle: string = '';
  artistName: string = '';
  downloadUrl: string = '';

  // 'default' = green (file), 'offline' = blue (app storage)
  mode: 'default' | 'offline' = 'default';

  // Full song object for offline download
  songData: any = null;

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
      this.songTitle = state['songTitle'] || 'Canción';
      this.artistName = state['artistName'] || 'Artista';
      this.downloadUrl = state['downloadUrl'] || '';
      this.mode = state['mode'] || 'default';
      this.songData = state['songData'] || null;
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
    // Initialize AdSense ads
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      // Initialize top ad
      (window as any).adsbygoogle.push({});
      // Initialize bottom ad
      setTimeout(() => {
        (window as any).adsbygoogle.push({});
      }, 100);
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async startDownload(): Promise<void> {
    if (this.isDownloading) return;

    this.isDownloading = true;

    // Open Monetag Smartlink (Monetization for both modes)
    window.open(this.SMARTLINK_URL, '_blank');

    // Wait 1 second before processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.mode === 'offline' && this.songData) {
      // Mode Offline
      try {
        const success = await this.offlineService.downloadSong(this.songData);
        if (success) {
          this.toastService.success('¡Canción guardada correctamente!');
          this.goBack();
        } else {
          this.toastService.error('Hubo un problema al guardar. Posible error de conexión o límites.');
          this.goBack();
        }
      } catch (error) {
        console.error('Error downloading offline', error);
        this.toastService.error('Error de red al intentar guardar offline.');
        this.goBack();
      }

    } else if (this.downloadUrl) {
      // Mode File (Default)
      const link = document.createElement('a');
      link.href = this.downloadUrl;
      link.download = `${this.songTitle} - ${this.artistName}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Go back after download starts
      setTimeout(() => {
        this.goBack();
      }, 1000);
    }

    this.isDownloading = false;
  }

  goBack(): void {
    this.location.back();
  }
}
