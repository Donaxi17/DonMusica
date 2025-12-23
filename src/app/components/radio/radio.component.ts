import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioService } from '../../services/radio.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { ToastService } from '../../services/toast.service';
import { NetworkService } from '../../services/network.service';
import { NoConnectionComponent } from '../shared/no-connection/no-connection.component';
import { LanguageService } from '../../services/language.service';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../services/playlist.service';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, AdsContainerComponent, NoConnectionComponent],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css'
})
export class RadioComponent implements OnInit, AfterViewInit {
  networkService = inject(NetworkService);
  stations: any[] = [];
  currentStation: any = null;
  isPlaying = false;
  isLoading = false;
  genre: string = 'reggaeton'; // Default genre

  private toastService = inject(ToastService);
  public languageService = inject(LanguageService);
  private playerService = inject(PlayerService);

  constructor(private radioService: RadioService) { }

  ngOnInit(): void {
    this.loadStations(this.genre);

    // Sync with global player
    this.playerService.currentSong$.subscribe(song => {
      this.currentStation = song && song.url ? { url_resolved: song.url, stationuuid: song.id } : null;
    });

    this.playerService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
    });
  }

  ngAfterViewInit(): void {
    // AdSense initialization is handled by AdsContainerComponent
  }

  ngOnDestroy(): void {
    // The stopRadio method is removed, player state is managed by PlayerService
    // If you need to explicitly pause on destroy, use this.playerService.pause();
  }

  loadStations(genre: string) {
    this.isLoading = true;
    this.genre = genre;

    if (genre === 'favorites') {
      this.stations = this.radioService.getFavorites();
      this.isLoading = false;
      if (this.stations.length === 0) {
        this.toastService.info(this.languageService.get('radio.toast.no_favorites'));
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
    if (this.currentStation?.url_resolved === station.url_resolved && this.isPlaying) {
      this.playerService.pause();
      return;
    }

    const radioSong: Song = {
      id: station.stationuuid || station.url_resolved,
      title: station.name,
      artist: station.country || 'Radio',
      url: station.url_resolved,
      img: station.favicon || '/assets/img/default-radio.jpg',
      isFavorite: this.isFavorite(station),
      duration: '0:00'
    };

    this.playerService.setPlaylist([radioSong], false, 'radio');
    this.playerService.playSong(radioSong);
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
      this.toastService.success(this.languageService.get('radio.toast.added_favorite'));
    } else {
      this.toastService.info(this.languageService.get('radio.toast.removed_favorite'));
    }
  }

  isFavorite(station: any): boolean {
    return this.radioService.isFavorite(station);
  }
}
