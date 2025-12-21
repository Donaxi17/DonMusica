import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Playlist, Song } from '../../services/playlist.service';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-playlist-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './playlist-detail.component.html'
})
export class PlaylistDetailComponent {
    public languageService = inject(LanguageService);
    @Input() playlist!: Playlist;
    @Input() currentSongId: number | string | null = null;
    @Input() isPlaying: boolean = false;
    @Input() offlineSongIds: Set<string> = new Set();

    @Output() playPlaylist = new EventEmitter<Playlist>();
    @Output() playSong = new EventEmitter<Song>();
    @Output() removeSong = new EventEmitter<{ playlistId: string, songId: number | string }>();
    @Output() downloadSong = new EventEmitter<Song>();
    @Output() downloadOffline = new EventEmitter<Song>();
    @Output() deletePlaylist = new EventEmitter<string>();
    @Output() share = new EventEmitter<Playlist>();
    @Output() back = new EventEmitter<void>();

    onPlayPlaylist() {
        this.playPlaylist.emit(this.playlist);
    }

    onPlaySong(song: Song) {
        this.playSong.emit(song);
    }

    onRemoveSong(songId: number | string, event: Event) {
        event.stopPropagation();
        this.removeSong.emit({ playlistId: this.playlist.id, songId });
    }

    onDownloadSong(song: Song, event: Event) {
        event.stopPropagation();
        this.downloadSong.emit(song);
    }

    onDownloadOffline(song: Song, event: Event) {
        event.stopPropagation();
        this.downloadOffline.emit(song);
    }

    isOffline(songId: number | string): boolean {
        return this.offlineSongIds.has(String(songId));
    }

    onDeletePlaylist() {
        this.deletePlaylist.emit(this.playlist.id);
    }

    onShare() {
        this.share.emit(this.playlist);
    }

    onBack() {
        this.back.emit();
    }
}
