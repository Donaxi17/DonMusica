import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioService } from '../../services/radio.service';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css'
})
export class RadioComponent implements OnInit, OnDestroy, AfterViewInit {
  stations: any[] = [];
  currentStation: any = null;
  audio = new Audio();
  isPlaying = false;
  isLoading = false;
  genre: string = 'reggaeton'; // Default genre

  constructor(private radioService: RadioService) { }

  ngOnInit(): void {
    this.loadStations(this.genre);
  }

  ngAfterViewInit(): void {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }

  ngOnDestroy(): void {
    this.stopRadio();
  }

  loadStations(genre: string) {
    this.isLoading = true;
    this.genre = genre;
    this.radioService.searchStations(genre).subscribe({
      next: (data) => {
        this.stations = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading stations', err);
        this.isLoading = false;
      }
    });
  }

  playStation(station: any) {
    if (this.currentStation === station && this.isPlaying) {
      this.stopRadio();
      return;
    }

    this.currentStation = station;
    this.audio.src = station.url_resolved;
    this.audio.load();
    this.audio.play().catch(err => console.error('Error playing radio', err));
    this.isPlaying = true;
  }

  stopRadio() {
    this.audio.pause();
    this.isPlaying = false;
  }

  setGenre(genre: string) {
    this.loadStations(genre);
  }
}
