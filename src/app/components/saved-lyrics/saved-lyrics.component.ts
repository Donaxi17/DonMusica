import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LyricsService, SavedLyric } from '../../services/lyrics.service';
import { OfflineService } from '../../services/offline.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-saved-lyrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-lyrics.component.html'
})
export class SavedLyricsComponent implements OnInit {
  private lyricsService = inject(LyricsService);
  private offlineService = inject(OfflineService);
  private playerService = inject(PlayerService);

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

  isOffline(lyric: SavedLyric): boolean {
    const offlineSongs = this.offlineService.offlineSongs();
    return offlineSongs.some(s =>
      s.title.toLowerCase() === lyric.title.toLowerCase() &&
      s.artist.toLowerCase() === lyric.artist.toLowerCase()
    );
  }

  playSong(lyric: SavedLyric, event?: Event) {
    if (event) event.stopPropagation();

    const offlineSongs = this.offlineService.offlineSongs();
    const song = offlineSongs.find(s =>
      s.title.toLowerCase() === lyric.title.toLowerCase() &&
      s.artist.toLowerCase() === lyric.artist.toLowerCase()
    );

    if (song) {
      // Construct a playable song object from the offline data
      const playableSong = {
        ...song,
        url: song.audioUrl || song.url,
        img: song.imageUrl || song.img,
        id: String(song.id) // Ensure ID string compatibility
      };
      this.playerService.playSong(playableSong);
    }
  }
}
