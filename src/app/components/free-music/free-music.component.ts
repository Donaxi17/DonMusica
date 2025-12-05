import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicApiService } from '../../services/music-api.service';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../services/playlist.service';
import { SeoService } from '../../services/seo.service';
import { AdBannerComponent } from '../shared/ad-banner/ad-banner.component';

@Component({
  selector: 'app-free-music',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './free-music.component.html',
  styleUrl: './free-music.component.css'
})
export class FreeMusicComponent implements OnInit {
  private seoService = inject(SeoService);
  private musicApi = inject(MusicApiService);
  private playerService = inject(PlayerService);

  // Géneros modernos
  latinGenres = [
    { id: 'pop', name: 'Pop', icon: '⭐' },
    { id: 'rock', name: 'Rock', icon: '🎸' },
    { id: 'electronic', name: 'Electrónica', icon: '🎧' },
    { id: 'hiphop', name: 'Hip Hop', icon: '🎤' },
    { id: 'indie', name: 'Indie', icon: '🎵' },
    { id: 'jazz', name: 'Jazz', icon: '🎷' },
    { id: 'classical', name: 'Clásica', icon: '🎻' },
    { id: 'metal', name: 'Metal', icon: '🔥' }
  ];

  selectedGenre = signal('pop');
  songs = signal<Song[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  // Sistema de descarga con anuncios
  showDownloadModal = signal(false);
  selectedDownloadSong = signal<Song | null>(null);
  downloadCountdown = signal(5);
  canDownload = signal(false);

  ngOnInit() {
    this.seoService.setSeoData(
      'Música Sin Copyright - Streaming Legal Gratis | DonMusica',
      'Descubre música sin copyright. Pop, rock, electrónica, hip hop y más géneros. Streaming legal y descargas gratuitas.'
    );
    this.loadMusicByGenre(this.selectedGenre());
  }

  loadMusicByGenre(genre: string) {
    this.selectedGenre.set(genre);
    this.isLoading.set(true);

    // Actualizar SEO dinámicamente según el género
    const genreName = this.latinGenres.find(g => g.id === genre)?.name || 'Música';
    this.seoService.setSeoData(
      `${genreName} Sin Copyright - Streaming Legal | DonMusica`,
      `Escucha ${genreName} sin copyright. Streaming legal de alta calidad. Más de 600,000 canciones disponibles.`
    );

    // Usar getJamendoByGenre para obtener música por género con mejor variedad
    this.musicApi.getJamendoByGenre(genre, 50).subscribe({
      next: (songs) => {
        this.songs.set(songs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando música:', err);
        this.songs.set([]);
        this.isLoading.set(false);
      }
    });
  }

  searchMusic() {
    if (!this.searchQuery()) return;

    this.isLoading.set(true);

    // Actualizar SEO para búsqueda
    this.seoService.setSeoData(
      `Buscar "${this.searchQuery()}" - Música Sin Copyright | DonMusica`,
      `Resultados de búsqueda para "${this.searchQuery()}". Música sin copyright.`
    );

    this.musicApi.searchJamendo(this.searchQuery(), 50).subscribe({
      next: (songs) => {
        this.songs.set(songs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.songs.set([]);
        this.isLoading.set(false);
      }
    });
  }

  playSong(song: Song) {
    this.playerService.playSong(song);
  }

  playAll() {
    if (this.songs().length > 0) {
      this.playerService.setPlaylist(this.songs());
      this.playerService.playSong(this.songs()[0]);
    }
  }

  // Sistema de descarga con anuncios - OPTIMIZADO
  openDownloadModal(song: Song) {
    this.selectedDownloadSong.set(song);
    this.showDownloadModal.set(true);
    this.canDownload.set(false);
    this.downloadCountdown.set(5);

    // Usar requestAnimationFrame para mejor rendimiento
    requestAnimationFrame(() => {
      this.startCountdown();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  closeDownloadModal() {
    this.showDownloadModal.set(false);
    this.selectedDownloadSong.set(null);
    this.canDownload.set(false);
  }

  private startCountdown() {
    const interval = setInterval(() => {
      const current = this.downloadCountdown();
      if (current > 0) {
        this.downloadCountdown.set(current - 1);
      } else {
        this.canDownload.set(true);
        clearInterval(interval);
      }
    }, 1000);
  }

  // Manejar error de imagen con fallback
  handleImageError(event: Event, songTitle: string) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = `https://placehold.co/300x300/1f2937/10b981?text=${songTitle.charAt(0)}`;
    }
  }

  downloadSong() {
    const song = this.selectedDownloadSong();
    if (!song || !this.canDownload()) return;

    // Descargar el archivo usando fetch para forzar la descarga
    fetch(song.url)
      .then(response => {
        if (!response.ok) throw new Error('Error al descargar');
        return response.blob();
      })
      .then(blob => {
        // Crear URL del blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Crear enlace temporal y forzar descarga
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${song.artist} - ${song.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Liberar memoria del blob
        window.URL.revokeObjectURL(blobUrl);

        this.closeDownloadModal();
      })
      .catch(error => {
        console.error('Error al descargar:', error);
        // Si falla el fetch, intentar método tradicional
        const link = document.createElement('a');
        link.href = song.url;
        link.download = `${song.artist} - ${song.title}.mp3`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.closeDownloadModal();
      });
  }
}
