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
    duration: '',
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

  // Files
  audioFiles: File[] = [];
  // imageFile removido - ya no subimos imágenes manualmente al storage

  // Preview Data
  previewSongs = signal<{ title: string, file: File, duration: string }[]>([]);

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

  // Helper methods for bulk upload
  formatTitle(filename: string): string {
    // Eliminar extensión y posibles números iniciales (ej: "01. Cancion.mp3" -> "Cancion")
    return filename.replace(/\.[^/.]+$/, "").replace(/^\d+\s*[-.]?\s*/, "").replace(/_/g, " ");
  }

  detectDuration(file: File): Promise<string> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      });
      audio.addEventListener('error', () => resolve('Unknown'));
    });
  }

  async onAudioFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Convertir FileList a Array y permitir audio/* o extensiones comunes si el tipo mime falla
      const files = Array.from(input.files).filter(file =>
        file.type.startsWith('audio/') ||
        file.name.toLowerCase().endsWith('.mp3') ||
        file.name.toLowerCase().endsWith('.wav') ||
        file.name.toLowerCase().endsWith('.m4a')
      );

      if (files.length === 0) {
        this.toastService.warning('Por favor selecciona archivos de audio válidos (MP3, WAV, M4A)');
        return;
      }

      this.audioFiles = files;

      // Generar preview data
      const previews = [];
      for (const file of files) {
        const duration = await this.detectDuration(file);
        previews.push({
          title: this.formatTitle(file.name),
          file: file,
          duration: duration
        });
      }
      this.previewSongs.set(previews);

      // Si es solo uno, mantenemos comportamiento anterior
      if (files.length === 1) {
        this.songData.title = previews[0].title;
        this.songData.duration = previews[0].duration;
      } else {
        this.songData.title = `Carga Masiva (${files.length} canciones)`;
        this.songData.duration = 'Varios';
      }
    }
  }

  removeSong(index: number) {
    // Remove from files array
    const currentFiles = [...this.audioFiles];
    currentFiles.splice(index, 1);
    this.audioFiles = currentFiles;

    // Remove from preview signal
    const currentPreviews = [...this.previewSongs()];
    currentPreviews.splice(index, 1);
    this.previewSongs.set(currentPreviews);

    // Update form status
    if (this.audioFiles.length === 0) {
      this.resetForm();
    } else if (this.audioFiles.length === 1) {
      this.songData.title = currentPreviews[0].title;
      this.songData.duration = currentPreviews[0].duration;
    } else {
      this.songData.title = `Carga Masiva (${this.audioFiles.length} canciones)`;
    }
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

      // 1. Obtener imagen del Arista (Automático)
      const artist = this.artists().find(a => a.id === this.songData.artistId);
      const imageUrl = artist?.image || '/assets/img/default-music.png';

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
      const song: Song = {
        title: this.songData.title,
        artist: this.songData.artistName,
        url: finalAudioUrl,
        img: imageUrl, // Usamos la imagen del artista
        duration: this.songData.duration || '0:00', // Duración opcional o manual
        album: this.songData.albumName || 'Sin Álbum',
        genre: this.songData.genre,
        year: this.songData.year
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
      title: '',
      artistId: '',
      artistName: '',
      albumId: '',
      albumName: '',
      genre: '',
      year: new Date().getFullYear(),
      duration: '',
      externalUrl: ''
    };
    this.audioFiles = [];
    this.previewSongs.set([]);

    // Reset file inputs
    const audioInput = document.querySelector('input[type="file"][accept="audio/*"]') as HTMLInputElement;
    if (audioInput) audioInput.value = '';
  }

  logout(): void {
    // Limpiar autenticación
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');

    // Redirigir al login
    this.router.navigate(['/admin-login']);
  }
}
