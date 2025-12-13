import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LyricsService, SavedLyric } from '../../services/lyrics.service';
import { OfflineService } from '../../services/offline.service';
import { DonMusicaProService } from '../../services/don-musica-pro.service';

@Component({
  selector: 'app-saved-lyrics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './saved-lyrics.component.html'
})
export class SavedLyricsComponent implements OnInit {
  private lyricsService = inject(LyricsService);
  private offlineService = inject(OfflineService);

  private proService = inject(DonMusicaProService);

  // ... (rest of the file) ...

  savedLyrics = signal<SavedLyric[]>([]);
  selectedLyric = signal<SavedLyric | null>(null);

  offlineLyrics = computed(() => {
    const offlineSongs = this.offlineService.offlineSongs();
    return this.savedLyrics().filter(lyric =>
      offlineSongs.some(song =>
        song.title.toLowerCase().trim() === lyric.title.toLowerCase().trim() &&
        song.artist.toLowerCase().trim() === lyric.artist.toLowerCase().trim()
      )
    );
  });

  manualLyrics = computed(() => {
    const offlineSongs = this.offlineService.offlineSongs();
    return this.savedLyrics().filter(lyric =>
      !offlineSongs.some(song =>
        song.title.toLowerCase().trim() === lyric.title.toLowerCase().trim() &&
        song.artist.toLowerCase().trim() === lyric.artist.toLowerCase().trim()
      )
    );
  });

  ngOnInit() {
    this.offlineService.loadOfflineSongs();
    this.loadLyrics();
  }

  loadLyrics() {
    this.savedLyrics.set(this.lyricsService.getSavedLyrics());
  }

  viewLyric(lyric: SavedLyric) {
    this.selectedLyric.set(lyric);
  }

  closeLyric() {
    this.selectedLyric.set(null);
  }

  deleteLyric(id: string, event: Event) {
    event.stopPropagation();
    this.lyricsService.deleteLyric(id);
    this.loadLyrics();

    if (this.selectedLyric()?.id === id) {
      this.closeLyric();
    }
  }

  limitInfo = computed(() => {
    // Read the signal to track dependencies
    this.proService.isPro();
    this.savedLyrics();
    return this.lyricsService.getLimitInfo();
  });

  toggleProMode() {
    this.proService.togglePro();
    this.loadLyrics(); // Trigger update
  }

  upgradeToPro() {
    this.proService.showUpgradeModal();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.lrc')) {
      alert('Por favor selecciona un archivo de texto (.txt) o letra (.lrc)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const content = e.target.result;
      const title = file.name.replace(/\.[^/.]+$/, "");

      const success = this.lyricsService.saveLyric(title, 'Importado', content);

      if (success) {
        this.loadLyrics();
        alert('Letra importada correctamente');
      } else {
        alert('¡Límite alcanzado! Elimina letras antiguas o actualiza a PRO para guardar más.');
      }
    };
    reader.readAsText(file);

    // Reset inputs
    event.target.value = '';
  }
}
