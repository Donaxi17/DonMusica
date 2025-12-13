import { Component, inject, effect, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../services/playlist.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { ToastService } from '../../services/toast.service';
import { StorageService } from '../../services/storage.service';
import { DonMusicaProService } from '../../services/don-musica-pro.service';
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
  imports: [CommonModule, FormsModule, AdsContainerComponent, RouterModule, ScrollingModule],
  templateUrl: './upload-music.component.html',
  styleUrl: './upload-music.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadMusicComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private cdr = inject(ChangeDetectorRef);
  private playerService = inject(PlayerService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private proService = inject(DonMusicaProService);

  maxStorage = 1024; // in MB
  usedStorage = 0;   // in MB
  storagePercentage = 0;
  uploadedFiles = 0;

  get isPro(): boolean {
    return this.proService.isPro();
  }

  toggleProDebug() {
    this.proService.togglePro();
  }

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

    // React to Pro status changes automatically
    effect(() => {
      this.setStorageLimit();
      this.maxStorage = this.proService.getStorageLimitMB();
      this.calculateStorage();
      this.cdr.markForCheck();
    });

    if (!this.selectedFolder) this.selectedFolder = this.folders[0];

    // Attempt to repair files (duration + persistent blobs)
    setTimeout(() => this.repairFiles(), 1000);
  }

  // State property for filtered files instead of getter for OnPush performance
  filteredMusicFiles: MusicFile[] = [];

  // --- Actions ---



  // --- Filtering & Sorting ---

  filterFiles() {
    let files = this.uploadedMusicFiles;

    // 1. Filter by Folder
    if (this.selectedFolder) {
      if (this.selectedFolder.id === '2') {
        files = files.filter(f => f.isFavorite);
      } else {
        files = files.filter(f => f.folderId === this.selectedFolder?.id);
      }
    }

    // 2. Filter by Search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      files = files.filter(f =>
        f.name.toLowerCase().includes(term) ||
        f.artist.toLowerCase().includes(term)
      );
    }

    this.filteredMusicFiles = files;
    this.applySort();
    // Ensure folder counts are correct
    this.recalculateFolderCounts();
    this.cdr.markForCheck();
  }

  applySort() {
    this.filteredMusicFiles = [...this.filteredMusicFiles].sort((a, b) => {
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

  // --- Storage & Limits ---

  setStorageLimit() {
    this.maxStorage = this.proService.getStorageLimitMB();
    this.cdr.markForCheck();
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

  get storageWarningLevel(): 'safe' | 'warning' | 'danger' {
    if (this.storagePercentage >= 90) return 'danger';
    if (this.storagePercentage >= 75) return 'warning';
    return 'safe';
  }

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
    this.toastMessage = message;
    this.showToast = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.showToast = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  upgradeToPro() {
    this.proService.showUpgradeModal();
  }

  showUpgradeModal() {
    this.proService.showUpgradeModal();
  }

  // --- Upload Logic ---

  async onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.isUploading = true;
      this.uploadProgress = 0;
      this.cdr.markForCheck();

      try {
        // Process files
        await this.processFiles(files);
      } catch (e) {
        console.error(e);
      } finally {
        this.isUploading = false;
        this.cdr.markForCheck();
        if (this.fileInput) this.fileInput.nativeElement.value = '';
      }
    }
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

  calculateProgress(processed: number, total: number) {
    if (total > 0) {
      this.uploadProgress = Math.round((processed / total) * 100);
      this.cdr.markForCheck();
    }
  }

  checkStorageLimit(newFiles: FileList): boolean {
    const newSizeMB = Array.from(newFiles).reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    return (this.usedStorage + newSizeMB) <= this.maxStorage;
  }

  // We are rewriting processFiles completely to handle flow better
  async processFiles(files: FileList) {
    if (files.length === 0) return;

    // 1. Pre-Check Limits
    let totalSizeMB = 0;
    const audioFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac|wma|opus)$/i.test(file.name);

      if (!isAudio) {
        if (file.name.endsWith('.lrc') || file.name.endsWith('.txt')) {
          this.toastService.info(`📝 "${file.name}" es una letra. Usa la sección de Letras.`);
        } else {
          this.showToastNotification(`⚠️ "${file.name}" no es audio.`);
        }
        continue;
      }

      audioFiles.push(file);
      totalSizeMB += file.size / (1024 * 1024);
    }

    if (audioFiles.length === 0) return;

    const spaceNeeded = this.usedStorage + totalSizeMB;
    if (spaceNeeded > this.maxStorage) {
      this.showUpgradeModal();
      return;
    }

    // 2. Upload
    let targetFolderId = this.selectedFolder?.id || '1';
    if (targetFolderId === '2') targetFolderId = '1';

    this.isUploading = true;
    this.uploadProgress = 0;
    this.cdr.markForCheck();

    let processedCount = 0;
    const totalCount = audioFiles.length;

    for (const file of audioFiles) {
      this.currentUploadingFile = file.name;
      this.cdr.markForCheck();

      // Simulation
      const steps = 5;
      for (let s = 1; s <= steps; s++) {
        await new Promise(r => setTimeout(r, 20));
      }

      try {
        await this.addFile(file, targetFolderId);
        processedCount++;
        this.calculateProgress(processedCount, totalCount);
      } catch (e) {
        console.error('Error adding file', file.name, e);
      }
    }

    this.isUploading = false;
    this.currentUploadingFile = '';
    this.showToastNotification(`✅ ${processedCount} archivos subidos`);
    this.cdr.markForCheck();
  }

  async addFile(file: File, folderId: string): Promise<void> {
    const fileId = crypto.randomUUID();
    let duration = '0:00';
    let metadata: any = {};

    try {
      duration = await this.getAudioDuration(file);
      metadata = await this.extractMetadata(file);
    } catch (e) {
      console.warn('Metadata error', e);
    }

    // Save actual blob
    await this.storageService.saveFile({ id: fileId, file: file });

    const newFile: MusicFile = {
      id: fileId,
      name: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
      artist: metadata.artist || 'Desconocido',
      url: URL.createObjectURL(file), // Provide initial URL for immediate playback
      coverUrl: metadata.picture || '',
      size: this.formatSize(file.size),
      sizeRaw: file.size,
      dateAdded: new Date(),
      folderId: folderId,
      file: file,
      isFavorite: false,
      duration: duration
    };

    // Update state
    this.uploadedMusicFiles.unshift(newFile);
    this.updateFolderCount(folderId, 1);
    this.calculateStorage();
    this.filterFiles();
    this.saveToLocalStorage();
  }

  private async getAudioDuration(file: File): Promise<string> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url); // Clean up
        const seconds = audio.duration;
        resolve(this.formatDuration(seconds));
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('0:00');
      };
    });
  }

  private async extractMetadata(file: File): Promise<any> {
    try {
      const m = await mm.parseBlob(file);
      let picture = '';
      if (m.common.picture && m.common.picture.length > 0) {
        const pic = m.common.picture[0];
        let blob = new Blob([pic.data as any], { type: pic.format });

        // Resize optimization (max 120px)
        try {
          blob = await this.resizeImage(blob, 120, 120);
        } catch (e) { console.warn('Resize failed, using original', e); }

        picture = URL.createObjectURL(blob);
      }
      return {
        title: m.common.title,
        artist: m.common.artist,
        picture: picture
      };
    } catch {
      return {};
    }
  }

  private resizeImage(blob: Blob, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((b) => {
            resolve(b || blob);
          }, 'image/jpeg', 0.8);
        } else {
          resolve(blob);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(blob);
      };
    });
  }

  private repairFiles() {
    // Restore URLs if missing (page reload)
    this.uploadedMusicFiles.forEach(async f => {
      if (!f.url || f.url === '') {
        const dbFile = await this.storageService.getFile(f.id);
        if (dbFile && dbFile.file) {
          f.file = dbFile.file;
          f.url = URL.createObjectURL(dbFile.file);
          this.cdr.markForCheck();
        }
      }
    });
  }

  // --- UI Helpers ---

  openFileOptions(file: MusicFile, event: Event) {
    event.stopPropagation();
    this.fileForOptions = file;
    this.showFileOptionsModal = true;
    this.cdr.markForCheck();
  }

  closeFileOptions() {
    this.showFileOptionsModal = false;
    this.fileForOptions = null;
    this.cdr.markForCheck();
  }

  openEditModal(file: MusicFile) {
    this.editData = { name: file.name, artist: file.artist, id: file.id };
    this.showEditModal = true;
    this.closeFileOptions();
    this.cdr.markForCheck();
  }

  async saveEdit() {
    const idx = this.uploadedMusicFiles.findIndex(f => f.id === this.editData.id);
    if (idx !== -1) {
      const file = this.uploadedMusicFiles[idx];
      file.name = this.editData.name;
      file.artist = this.editData.artist || 'Desconocido';

      await this.storageService.updateFile(file);
      this.showEditModal = false;
      this.filterFiles();
      this.showToastNotification('✅ Guardado');
      this.cdr.markForCheck();
    }
  }

  setSort(sort: 'date' | 'name' | 'size') {
    if (this.sortBy === sort) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sort;
      this.sortOrder = 'asc';
    }
    this.applySort();
    this.cdr.markForCheck();
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
    this.searchTerm = '';
    this.filterFiles();
    this.cdr.markForCheck();
  }

  createFolder() {
    if (!this.newFolderName.trim()) return;

    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: this.newFolderName.trim(),
      fileCount: 0,
      createdAt: new Date(),
      isSystem: false,
      colorClass: 'zinc'
    };

    this.folders = [...this.folders, newFolder];
    this.newFolderName = '';
    this.showCreateFolderModal = false;
    this.saveToLocalStorage();
    this.showToastNotification('Carpeta creada');
    this.cdr.markForCheck();
  }

  async deleteFolder(folder: Folder, event: Event) {
    event.stopPropagation();
    if (folder.isSystem) return;

    // Delete files in DB
    const filesToDelete = this.uploadedMusicFiles.filter(f => f.folderId === folder.id);
    for (const f of filesToDelete) {
      await this.storageService.deleteFile(f.id);
    }

    // Update State
    this.uploadedMusicFiles = this.uploadedMusicFiles.filter(f => f.folderId !== folder.id);
    this.folders = this.folders.filter(f => f.id !== folder.id);

    if (this.selectedFolder?.id === folder.id) {
      this.selectFolder(this.folders[0]);
    }

    this.calculateStorage();
    this.filterFiles();
    this.saveToLocalStorage();
    this.showToastNotification('Carpeta eliminada');
    this.cdr.markForCheck();
  }

  async playFile(file: MusicFile) {
    try {
      // 1. Fetch all stored files for continuity
      const storedData = await this.storageService.getAllFiles();

      // 2. Build playlist from CURRENT FILTERED VIEW
      const playlistSongs: Song[] = this.filteredMusicFiles.map(f => {
        if (!f.url || f.url === '') {
          const found = storedData.find(dbFile => dbFile.id === f.id);
          if (found && found.file) {
            f.file = found.file;
            f.url = URL.createObjectURL(found.file);
          }
        }
        return {
          id: f.id,
          artistId: 0,
          img: f.coverUrl || '',
          title: f.name,
          artist: f.artist,
          duration: f.duration || '0:00',
          url: f.url || '',
          album: 'Uploads'
        };
      });

      this.playerService.setPlaylist(playlistSongs, false);
      const songToPlay = playlistSongs.find(s => s.id === file.id);

      if (songToPlay) {
        this.playerService.playSong(songToPlay);
        this.showToastNotification(`▶️ ${file.name}`);
      }
    } catch (error) {
      console.error('Error loading playlist', error);
      this.showToastNotification('Error al reproducir');
    }
  }

  toggleFavorite(file: MusicFile, event?: Event) {
    if (event) event.stopPropagation();
    file.isFavorite = !file.isFavorite;

    // Persist (Update just metadata in DB)
    this.storageService.updateFile(file);

    // Update UI counts
    this.recalculateFolderCounts();

    // If we are in Favorites folder, refresh view
    if (this.selectedFolder?.id === '2') {
      this.filterFiles();
    }
    this.cdr.markForCheck();
  }

  openMoveModal(file: MusicFile) {
    this.fileToMove = file;
    this.showMoveModal = true;
    this.closeFileOptions();
    this.cdr.markForCheck();
  }

  get availableFoldersToMove(): Folder[] {
    return this.folders.filter(f => !f.isSystem && f.id !== this.fileToMove?.folderId);
  }

  async moveFileToFolder(folder: Folder) {
    if (this.fileToMove) {
      this.fileToMove.folderId = folder.id;
      await this.storageService.updateFile(this.fileToMove);

      this.recalculateFolderCounts();
      this.filterFiles();

      this.showMoveModal = false;
      this.fileToMove = null;
      this.showToastNotification(`Movido a "${folder.name}"`);
      this.cdr.markForCheck();
    }
  }

  async deleteFile(file: MusicFile) {
    this.closeFileOptions();

    // If in favorites, just toggle
    if (this.selectedFolder?.id === '2') {
      this.toggleFavorite(file);
      return;
    }

    if (!confirm(`¿Eliminar "${file.name}"?`)) return;

    await this.storageService.deleteFile(file.id);
    this.uploadedMusicFiles = this.uploadedMusicFiles.filter(f => f.id !== file.id);

    this.recalculateFolderCounts();
    this.calculateStorage();
    this.filterFiles();
    this.showToastNotification('Archivo eliminado');
    this.cdr.markForCheck();
  }

  calculateStorage() {
    const totalBytes = this.uploadedMusicFiles.reduce((acc, f) => acc + (f.sizeRaw || 0), 0);
    this.usedStorage = totalBytes / (1024 * 1024);

    if (!this.maxStorage) this.maxStorage = 1024;

    this.storagePercentage = Math.min(100, (this.usedStorage / this.maxStorage) * 100);
    this.cdr.markForCheck();
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Persist folders structure only (files are in IndexedDB)
  saveToLocalStorage() {
    const foldersToSave = this.folders.filter(f => !f.isSystem);
    localStorage.setItem('donmusic_folders', JSON.stringify(foldersToSave));
  }

  loadFromLocalStorage() {
    // Intentionally left blank, logic moved to constructor
  }
}
