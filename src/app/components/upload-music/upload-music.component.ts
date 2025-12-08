import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../services/playlist.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-music.component.html',
  styleUrl: './upload-music.component.css'
})
export class UploadMusicComponent {
  private playerService = inject(PlayerService);

  readonly FREE_STORAGE_LIMIT = 1024;
  readonly PRO_STORAGE_LIMIT = 20480;

  maxStorage = 1024;
  usedStorage = 0;
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
  }

  get filteredMusicFiles(): MusicFile[] {
    if (!this.selectedFolder) return this.uploadedMusicFiles;

    if (this.selectedFolder.id === '2') {
      return this.uploadedMusicFiles.filter(f => f.isFavorite);
    }

    return this.uploadedMusicFiles.filter(f => f.folderId === this.selectedFolder?.id);
  }

  // Set storage limit based on user type
  setStorageLimit() {
    this.isPro = false;
    this.maxStorage = this.isPro ? this.PRO_STORAGE_LIMIT : this.FREE_STORAGE_LIMIT;
  }

  getStorageLimitInfo(): string {
    return this.isPro ? '20 GB (Pro)' : '1 GB (Free)';
  }

  get maxStorageGB(): number {
    return this.maxStorage / 1024;
  }

  get usedStorageGB(): string {
    return (this.usedStorage / 1024).toFixed(2);
  }

  canUpgrade(): boolean {
    return !this.isPro;
  }

  showToastNotification(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  upgradeToPro() {
    this.showToastNotification('👑 ¡Próximamente disponible!');
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

    let targetFolderId = this.selectedFolder?.id || '1';
    if (targetFolderId === '2') targetFolderId = '1';

    this.isUploading = true;
    this.uploadProgress = 0;
    const totalFiles = files.length;
    let processedFiles = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/')) {
        this.showToastNotification(`⚠️ El archivo "${file.name}" no es un archivo de audio válido.`);
        continue;
      }
      this.currentUploadingFile = file.name;
      const simulationDuration = Math.min(2000, Math.max(500, file.size / 10000));
      const steps = 10;
      for (let step = 1; step <= steps; step++) {
        await new Promise(resolve => setTimeout(resolve, simulationDuration / steps));
        const currentFileProgress = (step / steps);
        this.uploadProgress = Math.round(((processedFiles + currentFileProgress) / totalFiles) * 100);
      }
      const fileSizeMB = file.size / (1024 * 1024);
      if (this.usedStorage + fileSizeMB > this.maxStorage) {
        this.showToastNotification('⚠️ No hay suficiente espacio de almacenamiento.');
        this.isUploading = false;
        return;
      }
      await this.addFile(file, targetFolderId);
      processedFiles++;
    }

    this.isUploading = false;
    this.uploadProgress = 0;
    this.currentUploadingFile = '';
    this.showToastNotification(`✅ ¡${processedFiles} archivos subidos!`);
    this.saveToLocalStorage();
  }

  addFile(file: File, folderId: string): Promise<void> {
    return new Promise((resolve) => {
      this.updateFolderCount(folderId, 1);

      const newFile: MusicFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Desconocido',
        url: URL.createObjectURL(file),
        coverUrl: '',
        size: this.formatSize(file.size),
        sizeRaw: file.size,
        dateAdded: new Date(),
        folderId: folderId,
        file: file,
        isFavorite: false
      };

      this.uploadedMusicFiles.unshift(newFile);
      this.calculateStorage();
      resolve();
    });
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
      if (!confirm(`¿Eliminar "${folder.name}" y sus archivos?`)) return;
      this.uploadedMusicFiles = this.uploadedMusicFiles.filter(file => file.folderId !== folder.id);
    }
    this.folders = this.folders.filter(f => f.id !== folder.id);

    if (this.selectedFolder?.id === folder.id) {
      this.selectedFolder = this.folders[0];
    }

    this.calculateStorage();
    this.saveToLocalStorage();
  }

  playFile(file: MusicFile) {
    if ((!file.url || file.url === '') && !file.file) {
      this.showToastNotification('❌ Recarga perdida');
      return;
    }
    if (!file.url && file.file) file.url = URL.createObjectURL(file.file);

    const song: Song = {
      id: file.id,
      artistId: 0,
      img: 'assets/images/default-music-note.svg',
      title: file.name,
      artist: file.artist,
      duration: '0:00',
      url: file.url,
      album: 'Uploads'
    };
    this.playerService.playSong(song);
    this.showToastNotification(`▶️ ${file.name}`);
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
    // If in favorites view, just toggle favorite off
    if (this.selectedFolder?.id === '2') {
      this.toggleFavorite(file);
      return;
    }

    if (!confirm(`¿Eliminar permanentemente "${file.name}"?`)) return;

    this.updateFolderCount(file.folderId, -1);
    if (file.isFavorite) {
      this.updateFolderCount('2', -1);
    }

    this.uploadedMusicFiles = this.uploadedMusicFiles.filter(f => f.id !== file.id);
    this.calculateStorage();
    this.saveToLocalStorage();
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
        size: f.size,
        sizeRaw: f.sizeRaw,
        folderId: f.folderId,
        dateAdded: f.dateAdded,
        isFavorite: f.isFavorite
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
            url: '',
            coverUrl: ''
          }));
        }
        this.recalculateFolderCounts();
      } catch (e) { console.error(e); }
    }
  }
}
