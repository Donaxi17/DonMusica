import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';

@Component({
  selector: 'app-download-page',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './download-page.component.html',
  styleUrl: './download-page.component.css'
})
export class DownloadPageComponent implements OnInit, OnDestroy, AfterViewInit {
  countdown: number = 5;
  songTitle: string = '';
  artistName: string = '';
  downloadUrl: string = '';
  private intervalId: any;

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
    // Start countdown
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

  startDownload(): void {
    if (this.downloadUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = this.downloadUrl;
      link.download = `${this.songTitle} - ${this.artistName}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Go back after a short delay
      setTimeout(() => {
        this.goBack();
      }, 1000);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
