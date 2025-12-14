import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Playlist, Song } from '../../services/playlist.service';

@Component({
    selector: 'app-playlist-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './playlist-detail.component.html'
})
export class PlaylistDetailComponent {
    @Input() playlist!: Playlist;
    @Input() currentSongId: number | string | null = null;
    @Input() isPlaying: boolean = false;

    @Output() playPlaylist = new EventEmitter<Playlist>();
    @Output() playSong = new EventEmitter<Song>();
    @Output() removeSong = new EventEmitter<{ playlistId: string, songId: number | string }>();
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
