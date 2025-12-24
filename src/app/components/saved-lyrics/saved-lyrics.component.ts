import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LyricsService, SavedLyric } from '../../services/lyrics.service';
import { OfflineService } from '../../services/offline.service';
import { DonMusicaProService } from '../../services/don-musica-pro.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { ToastService } from '../../services/toast.service';
import { LanguageService } from '../../services/language.service';
import { SettingsService } from '../../services/settings.service';
import { NativeAdsComponent } from '../shared/native-ads/native-ads.component';

@Component({
  selector: 'app-saved-lyrics',
  standalone: true,
  imports: [CommonModule, RouterModule, AdsContainerComponent, NativeAdsComponent],
  templateUrl: './saved-lyrics.component.html'
})
export class SavedLyricsComponent implements OnInit {
  private lyricsService = inject(LyricsService);
  private offlineService = inject(OfflineService);

  private proService = inject(DonMusicaProService);
  private toastService = inject(ToastService);
  public languageService = inject(LanguageService);
  private settingsService = inject(SettingsService);

  selectedRegion = this.settingsService.selectedRegion;
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

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }

  viewLyric(lyric: SavedLyric) {
    this.selectedLyric.set(lyric);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'; // Stop background scrolling
    }
  }

  closeLyric() {
    this.selectedLyric.set(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto'; // Restore background scrolling
    }
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



  upgradeToPro() {
    this.proService.showUpgradeModal();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.lrc')) {
      this.toastService.warning(this.languageService.get('saved_lyrics.toast.invalid_file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const content = e.target.result;
      const title = file.name.replace(/\.[^/.]+$/, "");

      const success = this.lyricsService.saveLyric(title, 'Importado', content);

      if (success) {
        this.loadLyrics();
        this.toastService.success(this.languageService.get('saved_lyrics.toast.imported'));
      } else {
        this.toastService.error(this.languageService.get('saved_lyrics.toast.limit_reached'));
      }
    };
    reader.readAsText(file);

    // Reset inputs
    event.target.value = '';
  }
}
