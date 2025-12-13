import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../services/playlist.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { ToastService } from '../../services/toast.service';
import { StorageService } from '../../services/storage.service';
import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';

// Polyfill Buffer for the browser if needed (often handled by build tools, but good to ensure)
(window as any).Buffer = Buffer;

interface MusicFile {
  id: string;
  name: string;
  artist: string;
  url: string;
  coverUrl: string;
  size: string;
  sizeRaw: number;
  dateAdded: Date;
  folderId: string;
  file?: File;
  isFavorite: boolean;
  duration: string;
}

interface Folder {
  id: string;
  name: string;
  fileCount: number;
  createdAt: Date;
  isSystem?: boolean;
  colorClass?: string;
}

@Component({
  selector: 'app-upload-music',
  standalone: true,
  imports: [CommonModule, FormsModule, AdsContainerComponent],
  templateUrl: './upload-music.component.html',
  styleUrl: './upload-music.component.css'
})
export class UploadMusicComponent {
  private playerService = inject(PlayerService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);

  // Storage limits in MB (1GB = 1024MB, 5GB = 5120MB)
  readonly FREE_STORAGE_LIMIT = 1024; // 1 GB
  readonly PRO_STORAGE_LIMIT = 5120;  // 5 GB

  maxStorage = 1024; // in MB
  usedStorage = 0;   // in MB
  storagePercentage = 0;
  uploadedFiles = 0;
  isPro = false;

  uploadedMusicFiles: MusicFile[] = [];

  folders: Folder[] = [
    { id: '1', name: 'General', fileCount: 0, createdAt: new Date(), isSystem: true, colorClass: 'emerald' },
    { id: '2', name: 'Favoritas', fileCount: 0, createdAt: new Date(), isSystem: true, colorClass: 'red' },
  ];

  selectedFolder: Folder | null = this.folders[0];
  showCreateFolderModal = false;
  newFolderName = '';

  // Search & Sort State
  searchTerm = '';
  sortBy: 'date' | 'name' | 'size' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Edit Modal State
  showEditModal = false;
  editData = { id: '', name: '', artist: '' };


  // File Options Modal State (Kebab Menu)
  showFileOptionsModal = false;
  fileForOptions: MusicFile | null = null;

  // Move Modal State
  showMoveModal = false;
  fileToMove: MusicFile | null = null;

  showToast = false;
  toastMessage = '';

  isUploading = false;
  uploadProgress = 0;
  currentUploadingFile = '';

  constructor() {
    this.loadFromLocalStorage();
    this.setStorageLimit();
    this.calculateStorage();
    if (!this.selectedFolder) this.selectedFolder = this.folders[0];

    // Attempt to repair files (duration + persistent blobs)
    setTimeout(() => this.repairFiles(), 1000);
  }

  get filteredMusicFiles(): MusicFile[] {
    let files = this.uploadedMusicFiles;

    // 1. Filter by Folder
    if (this.selectedFolder) {
      if (this.selectedFolder.id === '2') {
        files = files.filter(f => f.isFavorite);
      } else {
        files = files.filter(f => f.folderId === this.selectedFolder?.id);
      }
    }

    // 2. Filter by Search Term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      files = files.filter(f =>
        f.name.toLowerCase().includes(term) ||
        f.artist.toLowerCase().includes(term)
      );
    }

    // 3. Sort
    return files.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.sizeRaw - b.sizeRaw;
          break;
        case 'date':
        default:
          comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
      }
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // Set storage limit based on user type
  setStorageLimit() {
    this.isPro = false;
    this.maxStorage = this.isPro ? this.PRO_STORAGE_LIMIT : this.FREE_STORAGE_LIMIT;
  }

  getStorageLimitInfo(): string {
    return this.isPro ? '5 GB (Pro)' : '1 GB (Free)';
  }

  get maxStorageGB(): number {
    return this.maxStorage / 1024;
  }

  get usedStorageGB(): string {
    return (this.usedStorage / 1024).toFixed(2);
  }

  // Storage warning level (for visual indicators)
  get storageWarningLevel(): 'safe' | 'warning' | 'danger' {
    if (this.storagePercentage >= 90) return 'danger';
    if (this.storagePercentage >= 75) return 'warning';
    return 'safe';
  }

  // Estimated song capacity (assuming average 4MB per song)
  get estimatedSongsRemaining(): number {
    const avgSongSizeMB = 4;
    const remainingMB = this.maxStorage - this.usedStorage;
    return Math.floor(remainingMB / avgSongSizeMB);
  }

  get totalSongCapacity(): number {
    const avgSongSizeMB = 4;
    return Math.floor(this.maxStorage / avgSongSizeMB);
  }

  canUpgrade(): boolean {
    return !this.isPro;
  }

  showToastNotification(message: string) {
    // Legacy support wrapper, redirecting to new ToastService
    // Some existing calls pass emoji, we can keep them or clean them up later
    this.toastService.info(message);
  }

  upgradeToPro() {
    // Create a premium, responsive toast
    const message = `
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 16px; border-radius: 12px; position: relative; overflow: hidden;">
        <!-- Animated gradient overlay -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24); background-size: 200% 100%; animation: shimmer 2s infinite;"></div>
        
        <!-- Crown Icon Header -->
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 10px; border-radius: 50%; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);">
            <span style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></span>
          </div>
        </div>
        
        <!-- Title -->
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 18px; font-weight: 800; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 4px; letter-spacing: 0.5px;">
            PLAN PRO
          </div>
          <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">
            Próximamente disponible
          </div>
        </div>
        
        <!-- Benefits Section -->
        <div style="background: rgba(30, 41, 59, 0.5); border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: 700; color: #fbbf24; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 14px;"></span>
            <span>Beneficios Exclusivos</span>
          </div>
          
          <div style="display: grid; gap: 8px;">
            <!-- Benefit 1 -->
            <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(16, 185, 129, 0.05); border-radius: 6px; border-left: 3px solid #10b981;">
              <span style="font-size: 14px; flex-shrink: 0;"></span>
              <div style="font-size: 12px; line-height: 1.4;">
                <strong style="color: #10b981;">5 GB</strong> <span style="color: #cbd5e1;">de almacenamiento</span>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">vs 1 GB en plan FREE</div>
              </div>
            </div>
            
            <!-- Benefit 2 -->
            <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(59, 130, 246, 0.05); border-radius: 6px; border-left: 3px solid #3b82f6;">
              <span style="font-size: 14px; flex-shrink: 0;"></span>
              <div style="font-size: 12px; line-height: 1.4;">
                <strong style="color: #3b82f6;">~1,280 canciones</strong>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">vs ~256 en plan FREE</div>
              </div>
            </div>
            
            <!-- Benefit 3 -->
            <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(168, 85, 247, 0.05); border-radius: 6px; border-left: 3px solid #a855f7;">
              <span style="font-size: 14px; flex-shrink: 0;"></span>
              <div style="font-size: 12px; line-height: 1.4; color: #cbd5e1;">
                <strong style="color: #a855f7;">Sin anuncios</strong>
              </div>
            </div>
            
            <!-- Benefit 4 -->
            <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(236, 72, 153, 0.05); border-radius: 6px; border-left: 3px solid #ec4899;">
              <span style="font-size: 14px; flex-shrink: 0;"></span>
              <div style="font-size: 12px; line-height: 1.4; color: #cbd5e1;">
                <strong style="color: #ec4899;">Soporte prioritario</strong>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 10px; border-top: 1px solid rgba(148, 163, 184, 0.1);">
          <div style="font-size: 10px; color: #64748b; line-height: 1.5;">
             Te notificaremos cuando esté disponible
          </div>
        </div>
      </div>
      
      <style>
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      </style>
    `;
    
    this.toastService.showHtml(message, 'info', 15000); // 10 seconds
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) this.processFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  async processFiles(files: FileList) {
    if (files.length === 0) return;

    // Calculate total size of files to upload
    let totalSizeMB = 0;
    const audioFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/')) {
        this.showToastNotification(`⚠️ "${file.name}" no es un archivo de audio válido.`);
        continue;
      }
      audioFiles.push(file);
      totalSizeMB += file.size / (1024 * 1024);
    }

    if (audioFiles.length === 0) return;

    // Check if there's enough space BEFORE starting upload
    const spaceNeeded = this.usedStorage + totalSizeMB;
    const spaceAvailable = this.maxStorage - this.usedStorage;

    if (spaceNeeded > this.maxStorage) {
      const spaceNeededGB = (totalSizeMB / 1024).toFixed(2);
      const spaceAvailableGB = (spaceAvailable / 1024).toFixed(2);

      if (this.isPro) {
        this.toastService.error(`⚠️ Espacio insuficiente. Necesitas ${spaceNeededGB} GB pero solo tienes ${spaceAvailableGB} GB disponibles.`);
      } else {
        this.toastService.error(`⚠️ Límite alcanzado. Necesitas ${spaceNeededGB} GB pero el plan FREE solo permite 1 GB. Actualiza a PRO para obtener 5 GB.`);
      }
      return;
    }

    // Warn if approaching limit (>80%)
    const futurePercentage = (spaceNeeded / this.maxStorage) * 100;
    if (futurePercentage > 80 && futurePercentage <= 100) {
      const remainingGB = ((this.maxStorage - spaceNeeded) / 1024).toFixed(2);
      this.toastService.warning(`⚠️ Te quedarán solo ${remainingGB} GB disponibles después de esta subida.`);
    }

    let targetFolderId = this.selectedFolder?.id || '1';
    if (targetFolderId === '2') targetFolderId = '1';

    this.isUploading = true;
    this.uploadProgress = 0;
    const totalFiles = audioFiles.length;
    let processedFiles = 0;

    for (const file of audioFiles) {
      this.currentUploadingFile = file.name;
      const simulationDuration = Math.min(2000, Math.max(500, file.size / 10000));
      const steps = 10;

      for (let step = 1; step <= steps; step++) {
        await new Promise(resolve => setTimeout(resolve, simulationDuration / steps));
        const currentFileProgress = (step / steps);
        this.uploadProgress = Math.round(((processedFiles + currentFileProgress) / totalFiles) * 100);
      }

      await this.addFile(file, targetFolderId);
      processedFiles++;
    }

    this.isUploading = false;
    this.uploadProgress = 0;
    this.currentUploadingFile = '';
    this.showToastNotification(`✅ ¡${processedFiles} ${processedFiles === 1 ? 'archivo subido' : 'archivos subidos'}!`);
    this.saveToLocalStorage();
  }

  // Helper using a temporary Audio element to get duration
  private getAudioDuration(file: File): Promise<string> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;

      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        const duration = audio.duration;
        if (!isFinite(duration)) {
          resolve('0:00');
          return;
        }
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve('0:00');
      };
    });
  }

  private async repairFiles() {
    console.log('Verificando integridad de archivos...');
    const files = this.uploadedMusicFiles;

    for (const file of files) {
      // 1. Check if we need to restore the file object (for playback/re-extraction)
      if (!file.file || !file.url || file.url === '') {
        try {
          const dbFile = await this.storageService.getFile(file.id);
          if (dbFile && dbFile.file) {
            file.file = dbFile.file;
            file.url = URL.createObjectURL(dbFile.file);

            // 2. Check/Repair Duration
            if (!file.duration || file.duration === '0:00') {
              file.duration = await this.getAudioDuration(dbFile.file);
            }

            // 3. Restore Cover Art (if assuming blob URLs died on reload)
            if (!file.coverUrl || file.coverUrl.startsWith('blob:')) {
              const metadata = await this.extractMetadata(dbFile.file);
              if (metadata.picture) {
                file.coverUrl = metadata.picture;
              }
            }
          }
        } catch (err) {
          console.warn('Error restoring file data', file.id, err);
        }
      }
    }

    this.saveToLocalStorage();
    console.log('Verificación completada');
  }

  async extractMetadata(file: File): Promise<{ title?: string, artist?: string, picture?: string }> {
    try {
      const metadata = await mm.parseBlob(file);
      const title = metadata.common.title;
      const artist = metadata.common.artist;
      let picture = '';

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0];
        const blob = new Blob([pic.data as any], { type: pic.format });
        picture = URL.createObjectURL(blob);
      }

      return { title, artist, picture };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {};
    }
  }

  async addFile(file: File, folderId: string): Promise<void> {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Calculate duration
    let duration = '0:00';
    try {
      duration = await this.getAudioDuration(file);
    } catch (e) {
      console.error('Error getting duration', e);
    }

    // Extract Metadata (ID3)
    const metadata = await this.extractMetadata(file);

    // Store actual file in IndexedDB
    try {
      await this.storageService.saveFile({
        id: fileId,
        file: file
      });
    } catch (error) {
      console.error('Error saving to IndexedDB', error);
      this.toastService.warning('Error guardando archivo persistente');
    }

    this.updateFolderCount(folderId, 1);

    const newFile: MusicFile = {
      id: fileId,
      name: metadata.title || file.name.replace(/\.[^/.]+$/, ""), // Use ID3 title if available
      artist: metadata.artist || 'Desconocido', // Use ID3 artist if available
      url: URL.createObjectURL(file),
      coverUrl: metadata.picture || '', // Use ID3 picture if available
      size: this.formatSize(file.size),
      sizeRaw: file.size,
      dateAdded: new Date(),
      folderId: folderId,
      file: file,
      isFavorite: false,
      duration: duration
    };

    this.uploadedMusicFiles.unshift(newFile);
    this.calculateStorage();
    this.saveToLocalStorage();
  }

  // Options Menu Logic
  openFileOptions(file: MusicFile, event: Event) {
    event.stopPropagation();
    this.fileForOptions = file;
    this.showFileOptionsModal = true;
  }

  closeFileOptions() {
    this.showFileOptionsModal = false;
    this.fileForOptions = null;
  }

  // Edit Logic
  openEditModal(file: MusicFile, event?: Event) {
    if (event) event.stopPropagation();
    this.closeFileOptions(); // Close options menu if open
    this.editData = { id: file.id, name: file.name, artist: file.artist };
    this.showEditModal = true;
  }

  saveEdit() {
    const fileIndex = this.uploadedMusicFiles.findIndex(f => f.id === this.editData.id);
    if (fileIndex !== -1) {
      this.uploadedMusicFiles[fileIndex].name = this.editData.name;
      this.uploadedMusicFiles[fileIndex].artist = this.editData.artist || 'Desconocido';
      this.saveToLocalStorage();
      this.showToastNotification('✅ Cambios guardados');
    }
    this.showEditModal = false;
  }

  setSort(sort: 'date' | 'name' | 'size') {
    if (this.sortBy === sort) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sort;
      this.sortOrder = 'asc';
    }
  }

  updateFolderCount(folderId: string, change: number) {
    const folder = this.folders.find(f => f.id === folderId);
    if (folder) {
      folder.fileCount += change;
      if (folder.fileCount < 0) folder.fileCount = 0;
    }
  }

  recalculateFolderCounts() {
    this.folders.forEach(f => f.fileCount = 0);
    this.uploadedMusicFiles.forEach(file => {
      const folder = this.folders.find(f => f.id === file.folderId);
      if (folder) folder.fileCount++;
      if (file.isFavorite) {
        const favFolder = this.folders.find(f => f.id === '2');
        if (favFolder) favFolder.fileCount++;
      }
    });
  }

  selectFolder(folder: Folder) {
    this.selectedFolder = folder;
  }

  createFolder() {
    if (!this.newFolderName.trim()) return;

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: this.newFolderName.trim(),
      fileCount: 0,
      createdAt: new Date(),
      isSystem: false,
      colorClass: 'zinc'
    };

    this.folders.push(newFolder);
    this.newFolderName = '';
    this.showCreateFolderModal = false;
    this.saveToLocalStorage();
  }

  deleteFolder(folder: Folder, event: Event) {
    event.stopPropagation();
    if (folder.isSystem) return;

    if (folder.fileCount > 0) {
      // Direct delete without confirm, as requested for smooth UX
      this.uploadedMusicFiles = this.uploadedMusicFiles.filter(file => file.folderId !== folder.id);
    }
    this.folders = this.folders.filter(f => f.id !== folder.id);
    this.toastService.success(`Carpeta "${folder.name}" eliminada`);

    if (this.selectedFolder?.id === folder.id) {
      this.selectedFolder = this.folders[0];
    }

    this.calculateStorage();
    this.saveToLocalStorage();
  }

  async playFile(file: MusicFile) {
    // this.toastService.info('📂 Cargando carpeta para reproducción...');

    try {
      // 1. Fetch all stored files from IndexedDB to ensure playlist continuity
      const storedData = await this.storageService.getAllFiles();

      // 2. Prepare the playlist context
      // We iterate over the CURRENT VIEW (filteredMusicFiles) to maintain order and filters
      const playlistSongs: Song[] = this.filteredMusicFiles.map(f => {
        // Find the actual file blob in DB if we don't have it in memory/URL
        if (!f.url || f.url === '') {
          const found = storedData.find(dbFile => dbFile.id === f.id);
          if (found && found.file) {
            f.file = found.file;
            f.url = URL.createObjectURL(found.file);
          }
        }

        // Return the song object for the player
        return {
          id: f.id,
          artistId: 0,
          img: f.coverUrl || '',
          title: f.name,
          artist: f.artist,
          duration: f.duration || '0:00',
          url: f.url || '', // Should be valid now if file exists
          album: 'Uploads'
        };
      });

      // 3. Set Playlist in Player
      this.playerService.setPlaylist(playlistSongs, false);

      // 4. Play the specific song the user clicked
      const songToPlay = playlistSongs.find(s => s.id === file.id);
      if (songToPlay && songToPlay.url) {
        this.playerService.playSong(songToPlay);
        this.showToastNotification(`▶️ ${file.name}`);
      } else {
        this.toastService.error('⚠️ El archivo no se pudo cargar.');
        this.deleteFile(file); // Clean up if missing
      }

    } catch (error) {
      console.error('Error loading playlist', error);
      this.toastService.error('Error al cargar la carpeta');
    }
  }

  toggleFavorite(file: MusicFile, event?: Event) {
    if (event) event.stopPropagation();
    file.isFavorite = !file.isFavorite;

    const favFolder = this.folders.find(f => f.id === '2');
    if (favFolder) {
      favFolder.fileCount += file.isFavorite ? 1 : -1;
    }

    this.saveToLocalStorage();
  }

  // New Move Logic
  openMoveModal(file: MusicFile) {
    this.fileToMove = file;
    this.showMoveModal = true;
  }

  get availableFoldersToMove(): Folder[] {
    // Return all folders except 'Favoritas' and current folder
    return this.folders.filter(f => f.id !== '2' && f.id !== this.fileToMove?.folderId);
  }

  moveFileToFolder(folder: Folder) {
    if (!this.fileToMove) return;

    this.updateFolderCount(this.fileToMove.folderId, -1);
    this.fileToMove.folderId = folder.id;
    this.updateFolderCount(folder.id, 1);

    this.showToastNotification(`📂 Movido a "${folder.name}"`);
    this.showMoveModal = false;
    this.fileToMove = null;
    this.saveToLocalStorage();
  }

  deleteFile(file: MusicFile) {
    this.closeFileOptions();

    // If in favorites view, just toggle favorite off
    if (this.selectedFolder?.id === '2') {
      this.toggleFavorite(file);
      return;
    }

    // if (!confirm(`¿Eliminar permanentemente "${file.name}"?`)) return;

    this.updateFolderCount(file.folderId, -1);
    if (file.isFavorite) {
      this.updateFolderCount('2', -1);
    }

    // Remove from IndexedDB
    this.storageService.deleteFile(file.id).catch(err => console.error('Error deleting from DB', err));

    this.uploadedMusicFiles = this.uploadedMusicFiles.filter(f => f.id !== file.id);
    this.calculateStorage();
    this.saveToLocalStorage();
    this.toastService.success('Archivo eliminado');
  }

  calculateStorage() {
    this.usedStorage = 0;
    this.uploadedFiles = this.uploadedMusicFiles.length;
    this.uploadedMusicFiles.forEach(file => {
      const sizeMB = file.sizeRaw / (1024 * 1024);
      this.usedStorage += sizeMB;
    });
    this.usedStorage = Math.round(this.usedStorage * 100) / 100;
    this.storagePercentage = Math.round((this.usedStorage / this.maxStorage) * 100);
    if (this.storagePercentage > 100) this.storagePercentage = 100;

    this.recalculateFolderCounts();
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  saveToLocalStorage() {
    const data = {
      folders: this.folders,
      files: this.uploadedMusicFiles.map(f => ({
        id: f.id,
        name: f.name,
        artist: f.artist,
        coverUrl: f.coverUrl, // Save cover URL (blob url might expire, need logic to persist blobs ideally, but for now this works for session/memory or if blobs are re-created)
        size: f.size,
        sizeRaw: f.sizeRaw,
        folderId: f.folderId,
        dateAdded: f.dateAdded,
        isFavorite: f.isFavorite,
        duration: f.duration
      }))
    };
    localStorage.setItem('donmusic_uploads_meta', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('donmusic_uploads_meta');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.folders) {
          this.folders = parsed.folders.map((f: Folder) => {
            if (f.id === '1') return { ...f, isSystem: true, colorClass: 'emerald' };
            if (f.id === '2') return { ...f, isSystem: true, colorClass: 'red' };
            return { ...f, isSystem: false, colorClass: 'zinc' };
          });
          if (!this.folders.find(f => f.id === '1'))
            this.folders.unshift({ id: '1', name: 'General', fileCount: 0, createdAt: new Date(), isSystem: true, colorClass: 'emerald' });
          if (!this.folders.find(f => f.id === '2'))
            this.folders.splice(1, 0, { id: '2', name: 'Favoritas', fileCount: 0, createdAt: new Date(), isSystem: true, colorClass: 'red' });
        }
        if (parsed.files) {
          this.uploadedMusicFiles = parsed.files.map((f: any) => ({
            ...f,
            ...f,
            url: '',
            coverUrl: f.coverUrl || '',
            duration: f.duration || '0:00'
          }));
        }
        this.recalculateFolderCounts();
      } catch (e) { console.error(e); }
    }
  }
}
