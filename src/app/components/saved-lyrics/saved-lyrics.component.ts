import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LyricsService, SavedLyric } from '../../services/lyrics.service';

@Component({
  selector: 'app-saved-lyrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-lyrics.component.html'
})
export class SavedLyricsComponent implements OnInit {
  private lyricsService = inject(LyricsService);

  savedLyrics = signal<SavedLyric[]>([]);
  selectedLyric = signal<SavedLyric | null>(null);

  ngOnInit() {
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
    if (confirm('¿Estás seguro de eliminar esta letra guardada?')) {
      this.lyricsService.deleteLyric(id);
      this.loadLyrics();

      if (this.selectedLyric()?.id === id) {
        this.closeLyric();
      }
    }
  }
}
