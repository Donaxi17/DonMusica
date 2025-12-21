import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { LyricsService } from '../../../services/lyrics.service';
import { ToastService } from '../../../services/toast.service';
import { SeoService } from '../../../services/seo.service';
import { OfflineService } from '../../../services/offline.service';
import { ShareService } from '../../../services/share.service';
import { HapticService } from '../../../services/haptic.service';
import { Song } from '../../../services/playlist.service';
import { AdsContainerComponent } from '../../shared/ads-container/ads-container.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { OnDestroy, ChangeDetectorRef } from '@angular/core';
import { VoiceRecognitionService } from '../../../services/voice-recognition.service';
import { VoiceVisualizerComponent } from '../../shared/voice-waveform/voice-waveform.component';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon.component';
import { LanguageService } from '../../../services/language.service';

@Component({
    selector: 'app-lyrics',
    standalone: true,
    imports: [CommonModule, FormsModule, AdsContainerComponent, SkeletonComponent, VoiceVisualizerComponent, SvgIconComponent],
    templateUrl: './lyrics.component.html',
    styleUrl: './lyrics.component.css'
})
export class LyricsComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private musicApi = inject(MusicApiService);
    private playerService = inject(PlayerService);
    private lyricsService = inject(LyricsService);
    private toastService = inject(ToastService);
    private seoService = inject(SeoService);
    private offlineService = inject(OfflineService);
    private shareService = inject(ShareService);
    private hapticService = inject(HapticService);
    private voiceService = inject(VoiceRecognitionService);
    private cdr = inject(ChangeDetectorRef);
    public languageService = inject(LanguageService);

    searchQuery = signal('');
    isSearching = signal(false);
    isListening = false;
    showLyrics = signal(false);
    selectedSongArtist = signal('');
    selectedSongTitle = signal('');
    selectedSongLyrics = signal('');
    loadingLyrics = signal(false);
    searchResults = signal<Song[]>([]);

    ngOnInit() {
        this.seoService.setSeoData(
            this.languageService.get('lyrics.seo.title'),
            this.languageService.get('lyrics.seo.desc')
        );

        this.route.queryParams.subscribe(params => {
            if (params['q']) {
                this.searchQuery.set(params['q']);
                this.onSearch();
            }
        });

        this.voiceService.text$.subscribe(text => {
            if (text) {
                this.searchQuery.set(text);
                this.isListening = false;
                this.onSearch();
                this.cdr.detectChanges();
            }
        });
    }

    ngOnDestroy() {
        this.voiceService.stop();
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'auto';
        }
    }

    toggleVoiceSearch() {
        this.hapticService.light();
        if (this.isListening) {
            this.voiceService.stop();
            this.isListening = false;
        } else {
            this.searchQuery.set('');
            this.isListening = true;
            this.voiceService.start();
        }
    }

    onSearch() {
        if (!this.searchQuery()) return;
        this.hapticService.medium();
        this.isSearching.set(true);
        this.searchResults.set([]);

        forkJoin({
            mainstream: this.musicApi.search(this.searchQuery()),
            free: this.musicApi.searchJamendo(this.searchQuery())
        }).subscribe({
            next: (results) => {
                const combined = [...results.mainstream, ...results.free];
                const unique = combined.filter((s, i, self) =>
                    i === self.findIndex(t => t.id === s.id || (t.title === s.title && t.artist === s.artist))
                );
                this.searchResults.set(unique);
                this.isSearching.set(false);
            },
            error: () => {
                this.isSearching.set(false);
                this.toastService.error(this.languageService.get('lyrics.toast.search_error'));
            }
        });
    }

    playSong(song: Song) {
        this.hapticService.medium();
        if (this.searchResults().length > 0) {
            this.playerService.setPlaylist(this.searchResults(), false, 'lyrics');
        }
        this.playerService.playSong(song);
    }

    viewLyrics(song: Song) {
        this.hapticService.light();
        this.selectedSongTitle.set(song.title);
        this.selectedSongArtist.set(song.artist);
        this.selectedSongLyrics.set('');
        this.loadingLyrics.set(true);
        this.showLyrics.set(true);

        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
        }

        this.musicApi.getLyrics(song.artist, song.title).subscribe({
            next: (lyrics) => {
                this.loadingLyrics.set(false);
                if (lyrics && lyrics.length > 50) {
                    this.selectedSongLyrics.set(lyrics);
                } else {
                    this.selectedSongLyrics.set('');
                }
            },
            error: () => {
                this.loadingLyrics.set(false);
                this.selectedSongLyrics.set('');
            }
        });
    }

    closeLyrics() {
        this.showLyrics.set(false);
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'auto';
        }
    }

    saveLyrics() {
        const title = this.selectedSongTitle();
        const artist = this.selectedSongArtist();
        const content = this.selectedSongLyrics();

        if (this.lyricsService.isSaved(title, artist)) {
            this.hapticService.light();
            this.toastService.info(this.languageService.get('lyrics.toast.already_saved'));
            return;
        }

        this.hapticService.success();
        this.lyricsService.saveLyric(title, artist, content);
        this.toastService.success(this.languageService.get('lyrics.toast.saved_success'));
    }

    isLyricsSaved(): boolean {
        return this.lyricsService.isSaved(this.selectedSongTitle(), this.selectedSongArtist());
    }

    isSongLyricsSaved(song: Song): boolean {
        return this.lyricsService.isSaved(song.title, song.artist);
    }

    downloadLyrics(song: Song, event: Event) {
        event.stopPropagation();
        this.hapticService.light();
        this.navigateToDownload(song, null, 'lyrics');
    }

    downloadProgress = this.offlineService.downloadProgress;
    isDownloadingOffline = this.offlineService.isDownloading;

    openDownload(song: Song, event: Event) {
        event.stopPropagation();
        if (!song.url) {
            this.toastService.info(this.languageService.get('home.toast.searching_download'));
            this.musicApi.getBestAudioStream(song.title, song.artist).subscribe((url: string | null) => {
                if (url) {
                    this.navigateToDownload(song, url, 'default');
                } else {
                    this.toastService.error(this.languageService.get('home.toast.download_not_found'));
                }
            });
            return;
        }
        this.navigateToDownload(song, song.url, 'default');
    }

    async downloadForOffline(song: Song, event: Event) {
        event.stopPropagation();
        if (this.isOffline(song.id)) {
            this.toastService.info(this.languageService.get('artist.toast.already_downloaded'));
            return;
        }
        if (!song.url) {
            this.toastService.info(this.languageService.get('home.toast.searching_download'));
            this.musicApi.getBestAudioStream(song.title, song.artist).subscribe((url: string | null) => {
                if (url) {
                    this.navigateToDownload(song, url, 'offline');
                } else {
                    this.toastService.error(this.languageService.get('artist.toast.offline_source_not_found'));
                }
            });
            return;
        }
        this.navigateToDownload(song, song.url, 'offline');
    }

    private navigateToDownload(song: Song, url: string | null, mode: 'default' | 'offline' | 'lyrics'): void {
        const songWithUrl = { ...song, url: url || song.url };
        this.router.navigate(['/download'], {
            state: {
                songTitle: song.title,
                artistName: song.artist,
                downloadUrl: url,
                mode: mode,
                songData: songWithUrl
            }
        });
    }

    isOffline(songId: string | number): boolean {
        return this.offlineService.isOffline(String(songId));
    }

    async shareSong(song: Song, event: Event) {
        this.hapticService.medium();
        event.stopPropagation();
        await this.shareService.shareSong(song, 'lyrics' as any);
    }

    async shareLyrics() {
        this.hapticService.medium();
        const title = this.selectedSongTitle();
        const artist = this.selectedSongArtist();
        const lyrics = this.selectedSongLyrics();
        await this.shareService.shareLyrics(title, artist, lyrics);
    }
}
