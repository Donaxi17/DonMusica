import { Component, inject, signal, computed, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService, Song, Artist } from '../../services/database.service';
import { MusicApiService } from '../../services/music-api.service';
import { ToastService } from '../../services/toast.service';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

interface UploadProgress {
  uploading: boolean;
  progress: number;
  message: string;
}

interface Album {
  id: string;
  name: string;
  artistId: string;
  year: number;
  coverUrl?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private dbService = inject(DatabaseService);
  private router = inject(Router);
  private musicApi = inject(MusicApiService);
  private storage = inject(Storage);
  private zone = inject(NgZone);
  private toastService = inject(ToastService);

  // Lists from Firebase
  artists = signal<Artist[]>([]);
  albums = signal<Album[]>([]);
  genres = signal<string[]>(['Reggaeton', 'Trap', 'Pop', 'Vallenato', 'Salsa', 'Champeta', 'Cristiana']);

  // Filter
  selectedGenreFilter = signal<string>('all');

  filteredArtists = computed(() => {
    const filter = this.selectedGenreFilter().toLowerCase();
    const allArtists = this.artists();

    let filtered = allArtists;
    if (filter !== 'all') {
      filtered = allArtists.filter(artist =>
        artist.genre?.toLowerCase() === filter ||
        (filter === 'otros' && !artist.genre)
      );
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Form data
  songData = {
    title: '',
    artistId: '',
    artistName: '', // Para mostrar en el form
    albumId: '',
    albumName: '',
    genre: '',
    year: new Date().getFullYear(),
    externalUrl: '' // Nuevo campo para URL externa
  };

  // New artist/album/genre
  newArtistName = '';
  newArtistGenre = '';
  newAlbumName = '';
  newGenre = '';

  // UI States
  showNewArtistForm = signal(false);
  showNewAlbumForm = signal(false);
  showNewGenreForm = signal(false);

  // Preview Data removido (una por una)

  // Upload state
  uploadProgress = signal<UploadProgress>({
    uploading: false,
    progress: 0,
    message: ''
  });



  ngOnInit() {
    this.loadArtists();
    this.loadGenres();
  }

  loadArtists() {
    this.dbService.getArtists().subscribe(artists => {
      this.artists.set(artists);
    });
  }

  loadGenres() {
    // Cargar géneros desde localStorage o usar predeterminados
    const savedGenres = localStorage.getItem('customGenres');
    if (savedGenres) {
      const custom = JSON.parse(savedGenres);
      this.genres.set([...this.genres(), ...custom]);
    }
  }

  loadAlbumsForArtist(artistId: string) {
    // Cargar álbumes del artista desde localStorage
    const albumsKey = `albums_${artistId}`;
    const savedAlbums = localStorage.getItem(albumsKey);
    if (savedAlbums) {
      this.albums.set(JSON.parse(savedAlbums));
    } else {
      this.albums.set([]);
    }
  }

  onArtistChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const artistId = select.value;

    if (artistId === 'new') {
      this.showNewArtistForm.set(true);
      // No resetear artistId aquí para mantener el estado "new"
      this.songData.artistName = '';

      // Auto-seleccionar género si hay un filtro activo
      const currentFilter = this.selectedGenreFilter();
      this.newArtistGenre = currentFilter !== 'all' ? currentFilter : '';

      return;
    }

    this.showNewArtistForm.set(false);
    this.songData.artistId = artistId;

    const artist = this.artists().find(a => a.id === artistId);
    if (artist) {
      this.songData.artistName = artist.name;
      this.songData.genre = artist.genre || '';
      this.loadAlbumsForArtist(artistId);
    }
  }

  cancelNewArtist() {
    this.showNewArtistForm.set(false);
    this.newArtistName = '';
    this.newArtistGenre = '';
    this.songData.artistId = '';
  }

  async createNewArtist() {
    if (!this.newArtistName.trim()) {
      this.toastService.warning('Por favor ingresa el nombre del artista');
      return;
    }

    if (!this.newArtistGenre) {
      this.toastService.warning('Por favor selecciona el género del artista');
      return;
    }

    try {
      const newArtist: Artist = {
        name: this.newArtistName.trim(),
        genre: this.newArtistGenre,
        image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Imagen por defecto
        bio: ''
      };

      await this.dbService.addArtist(newArtist);

      // Recargar artistas
      this.loadArtists();

      // Limpiar y cerrar form
      this.newArtistName = '';
      this.newArtistGenre = '';
      this.showNewArtistForm.set(false);

      this.toastService.success('Artista creado exitosamente');
    } catch (error) {
      console.error('Error al crear artista:', error);
      this.toastService.error('Error al crear artista');
    }
  }

  onAlbumChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const albumId = select.value;

    if (albumId === 'new') {
      this.showNewAlbumForm.set(true);
      // No resetear albumId aquí
      this.songData.albumName = '';
      return;
    }

    if (albumId === 'none') {
      this.songData.albumId = '';
      this.songData.albumName = 'Sin Álbum';
      this.showNewAlbumForm.set(false);
      return;
    }

    this.showNewAlbumForm.set(false);
    this.songData.albumId = albumId;

    const album = this.albums().find(a => a.id === albumId);
    if (album) {
      this.songData.albumName = album.name;
      this.songData.year = album.year;
    }
  }

  createNewAlbum() {
    if (!this.newAlbumName.trim()) {
      this.toastService.warning('Por favor ingresa el nombre del álbum');
      return;
    }

    if (!this.songData.artistId) {
      this.toastService.warning('Por favor selecciona un artista primero');
      return;
    }

    const newAlbum: Album = {
      id: Date.now().toString(),
      name: this.newAlbumName.trim(),
      artistId: this.songData.artistId,
      year: this.songData.year
    };

    // Guardar en localStorage
    const albumsKey = `albums_${this.songData.artistId}`;
    const currentAlbums = this.albums();
    currentAlbums.push(newAlbum);
    localStorage.setItem(albumsKey, JSON.stringify(currentAlbums));

    this.albums.set(currentAlbums);
    this.songData.albumId = newAlbum.id;
    this.songData.albumName = newAlbum.name;

    // Limpiar y cerrar form
    this.newAlbumName = '';
    this.showNewAlbumForm.set(false);

    this.toastService.success('Álbum creado exitosamente');
  }

  cancelNewAlbum() {
    this.showNewAlbumForm.set(false);
    this.newAlbumName = '';
    this.songData.albumId = '';
  }

  onGenreChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const genre = select.value;

    if (genre === 'new') {
      this.showNewGenreForm.set(true);
      // No resetear genre aquí
      return;
    }

    this.showNewGenreForm.set(false);
    this.songData.genre = genre;
  }

  cancelNewGenre() {
    this.showNewGenreForm.set(false);
    this.newGenre = '';
    this.songData.genre = '';
  }

  createNewGenre() {
    if (!this.newGenre.trim()) {
      this.toastService.warning('Por favor ingresa el nombre del género');
      return;
    }

    const currentGenres = this.genres();
    if (!currentGenres.includes(this.newGenre.trim())) {
      currentGenres.push(this.newGenre.trim());
      this.genres.set(currentGenres);

      // Guardar en localStorage
      const customGenres = currentGenres.filter(g =>
        !['Reggaeton', 'Trap', 'Rap', 'Pop', 'Dancehall', 'R&B'].includes(g)
      );
      localStorage.setItem('customGenres', JSON.stringify(customGenres));

      this.songData.genre = this.newGenre.trim();
    }

    // Limpiar y cerrar form
    this.newGenre = '';
    this.showNewGenreForm.set(false);

    this.toastService.success('Género creado exitosamente');
  }

  onTitleInput(event: any) {
    // Reemplaza guiones por espacios en tiempo real mientras el admin escribe
    const input = event.target as HTMLInputElement;
    this.songData.title = input.value.replace(/-/g, ' ');
  }



  async uploadSong(): Promise<void> {
    // Validaciones básicas
    if (!this.songData.artistName) {
      if (this.songData.artistId) {
        const artist = this.artists().find(a => a.id === this.songData.artistId);
        if (artist) {
          this.songData.artistName = artist.name;
        } else {
          this.toastService.warning('Por favor selecciona un artista válido');
          return;
        }
      } else {
        this.toastService.warning('Por favor selecciona un artista');
        return;
      }
    }

    // Validación simplificada: solo requerimos título y URL
    if (!this.songData.title || !this.songData.externalUrl) {
      this.toastService.warning('Por favor ingresa el título y la URL de la canción');
      return;
    }

    try {
      this.uploadProgress.set({
        uploading: true,
        progress: 10,
        message: 'Procesando enlace...'
      });

      // 1. Imagen removida - Se maneja dinámicamente en el frontend

      // 2. Procesar URL (Convertir Dropbox a URL directa compatible con localhost)
      let finalAudioUrl = this.songData.externalUrl;

      if (finalAudioUrl.includes('dropbox.com')) {
        // Transformar www.dropbox.com a dl.dropboxusercontent.com para saltar redirects y mejorar CORS
        finalAudioUrl = finalAudioUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');

        // Limpiar parámetros de visualización y forzar descarga directa
        if (finalAudioUrl.includes('?')) {
          finalAudioUrl = finalAudioUrl.replace(/dl=[01]/g, 'dl=1');
          finalAudioUrl = finalAudioUrl.replace(/raw=[01]/g, 'dl=1');
          if (!finalAudioUrl.includes('dl=1')) {
            finalAudioUrl += '&dl=1';
          }
        } else {
          finalAudioUrl += '?dl=1';
        }
      }

      this.uploadProgress.set({
        uploading: true,
        progress: 50,
        message: 'Guardando en base de datos...'
      });

      // 3. Crear Objeto Canción
      const song: any = {
        artistId: this.songData.artistId,
        title: this.songData.title,
        artist: this.songData.artistName,
        url: finalAudioUrl,
        // ya no guardamos img
        album: this.songData.albumName || 'Sin Álbum',
        genre: this.songData.genre,
        year: this.songData.year,
        createdAt: Date.now() // Forzamos timestamp local para inmediatez en UI
      };

      await this.dbService.addSong(song);

      this.uploadProgress.set({
        uploading: false,
        progress: 100,
        message: `✅ ¡Canción guardada exitosamente!`
      });

      this.resetForm();
      // Limpiar mensaje después de unos segundos
      setTimeout(() => {
        this.uploadProgress.set({ uploading: false, progress: 0, message: '' });
      }, 4000);

    } catch (error: any) {
      console.error('Error al guardar:', error);
      this.uploadProgress.set({
        uploading: false,
        progress: 0,
        message: `❌ Error: ${error.message || 'Error desconocido'}`
      });
      this.toastService.error(`Error al guardar: ${error.message || error}`);
    }
  }

  resetForm(): void {
    this.songData = {
      ...this.songData,
      title: '',
      albumId: this.songData.albumId,
      albumName: this.songData.albumName,
      externalUrl: ''
    };
    // Note: artistId, artistName, genre, and year are preserved by the spread and omitting their resets
  }

  logout(): void {
    // Limpiar autenticación
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');

    // Redirigir al login
    this.router.navigate(['/admin-login']);
  }
}
