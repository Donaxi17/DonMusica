import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from '../../services/playlist.service';

@Component({
    selector: 'app-favorites',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './favorites.component.html'
})
export class FavoritesComponent {
    @Input() favorites: Song[] = [];
    @Input() currentSongId: number | string | null = null;
    @Input() isPlaying: boolean = false;

    @Output() playAll = new EventEmitter<void>();
    @Output() playSong = new EventEmitter<Song>();
    @Output() remove = new EventEmitter<number | string>();

    onPlayAll() {
        this.playAll.emit();
    }

    onPlaySong(song: Song) {
        this.playSong.emit(song);
    }

    onRemove(id: number | string, event: Event) {
        event.stopPropagation();
        this.remove.emit(id);
    }
}
