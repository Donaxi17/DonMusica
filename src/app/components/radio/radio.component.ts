import { Component, inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioService } from '../../services/radio.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { ToastService } from '../../services/toast.service';
import { NetworkService } from '../../services/network.service';
import { NoConnectionComponent } from '../shared/no-connection/no-connection.component';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, AdsContainerComponent, NoConnectionComponent],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css'
})
export class RadioComponent implements OnInit, OnDestroy, AfterViewInit {
  networkService = inject(NetworkService);
  stations: any[] = [];
  currentStation: any = null;
  audio = new Audio();
  isPlaying = false;
  isLoading = false;
  genre: string = 'reggaeton'; // Default genre

  private toastService = inject(ToastService);

  constructor(private radioService: RadioService) { }

  ngOnInit(): void {
    this.loadStations(this.genre);
  }

  ngAfterViewInit(): void {
    // AdSense initialization is handled by AdsContainerComponent
  }

  ngOnDestroy(): void {
    this.stopRadio();
  }

  loadStations(genre: string) {
    this.isLoading = true;
    this.genre = genre;

    if (genre === 'favorites') {
      this.stations = this.radioService.getFavorites();
      this.isLoading = false;
      if (this.stations.length === 0) {
        this.toastService.info('No tienes emisoras favoritas aún');
      }
      return;
    }

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

  toggleFavorite(station: any, event: Event) {
    event.stopPropagation();
    this.radioService.toggleFavorite(station);

    if (this.genre === 'favorites') {
      this.loadStations('favorites'); // Refresh list if looking at favorites
    }

    const isFav = this.radioService.isFavorite(station);
    if (isFav) {
      this.toastService.success('Añadida a favoritas');
    } else {
      this.toastService.info('Eliminada de favoritas');
    }
  }

  isFavorite(station: any): boolean {
    return this.radioService.isFavorite(station);
  }
}
