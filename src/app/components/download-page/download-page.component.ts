import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';

@Component({
  selector: 'app-download-page',
  standalone: true,
  imports: [CommonModule, SvgIconComponent, AdsContainerComponent],
  templateUrl: './download-page.component.html',
  styleUrl: './download-page.component.css'
})
export class DownloadPageComponent implements OnInit, OnDestroy, AfterViewInit {
  countdown: number = 0; // Sin countdown
  songTitle: string = '';
  artistName: string = '';
  downloadUrl: string = '';
  private intervalId: any;

  // Smartlink configuration
  private readonly SMARTLINK_URL = 'https://www.effectivegatecpm.com/sw9g0tx52?key=973a1c8fac0e809dba93c52ce9b0de4c'; // CAMBIA ESTO

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
    }
  }

  ngOnInit(): void {
    // No countdown needed
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

  /**
   * Opens Smartlink on EVERY download (Mobile + PC)
   */
  private openSmartlinkIfAllowed(): void {
    console.log('🔗 Abriendo Smartlink:', this.SMARTLINK_URL);
    window.open(this.SMARTLINK_URL, '_blank');
  }

  startDownload(): void {
    if (this.downloadUrl) {
      // 1. First, open Smartlink (if allowed)
      this.openSmartlinkIfAllowed();

      // 2. Wait 1 second, then start download
      setTimeout(() => {
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
      }, 1000);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
