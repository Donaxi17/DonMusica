import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService, Artist } from '../../../services/database.service';
import { SpotifyService } from '../../../services/spotify.service';
import { ToastService } from '../../../services/toast.service';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon.component';

@Component({
    selector: 'app-refresh-artist-images',
    standalone: true,
    imports: [CommonModule, FormsModule, SvgIconComponent],
    templateUrl: './refresh-artist-images.component.html',
    styleUrl: './refresh-artist-images.component.css'
})
export class RefreshArtistImagesComponent {
    private dbService = inject(DatabaseService);
    private spotifyService = inject(SpotifyService);
    private toastService = inject(ToastService);

    artists = signal<Artist[]>([]);
    loading = signal<boolean>(true);
    refreshingIds = signal<Set<string>>(new Set());
    searchQuery = signal<string>('');

    ngOnInit() {
        this.loadArtists();
    }

    loadArtists() {
        this.loading.set(true);
        this.dbService.getArtists().subscribe(artists => {
            this.artists.set(artists.sort((a, b) => a.name.localeCompare(b.name)));
            this.loading.set(false);
        });
    }

    filteredArtists = () => {
        const query = this.searchQuery().toLowerCase().trim();
        if (!query) return this.artists();
        return this.artists().filter(a => a.name.toLowerCase().includes(query));
    };

    async refreshArtistImage(artist: Artist) {
        if (!artist.id) return;

        const currentRefreshing = this.refreshingIds();
        currentRefreshing.add(artist.id);
        this.refreshingIds.set(new Set(currentRefreshing));

        try {
            // Clear cache first to force fresh fetch
            this.spotifyService.clearArtistCache(artist.name);

            // Fetch fresh data from Spotify
            const spotifyStats = await this.spotifyService.getArtistStats(artist.name);

            if (spotifyStats?.image) {
                // Update in Firebase
                await this.dbService.updateArtist(artist.id, { image: spotifyStats.image });

                // Update local state
                this.artists.update(list =>
                    list.map(a => a.id === artist.id ? { ...a, image: spotifyStats.image! } : a)
                );

                this.toastService.show(`✅ Imagen de ${artist.name} actualizada`, 'success');
            } else {
                this.toastService.show(`⚠️ No se encontró imagen para ${artist.name} en Spotify`, 'warning');
            }
        } catch (error) {
            console.error('Error refreshing artist image:', error);
            this.toastService.show(`❌ Error al actualizar ${artist.name}`, 'error');
        } finally {
            const currentRefreshing = this.refreshingIds();
            currentRefreshing.delete(artist.id!);
            this.refreshingIds.set(new Set(currentRefreshing));
        }
    }

    isRefreshing(artistId: string): boolean {
        return this.refreshingIds().has(artistId);
    }

    async refreshAll() {
        if (!confirm('¿Estás seguro de que quieres actualizar TODAS las imágenes de artistas? Esto puede tomar varios minutos.')) {
            return;
        }

        const artists = this.filteredArtists();
        let updated = 0;
        let failed = 0;

        for (const artist of artists) {
            try {
                await this.refreshArtistImage(artist);
                updated++;
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                failed++;
            }
        }

        this.toastService.show(
            `✅ Actualización completa: ${updated} exitosas, ${failed} fallidas`,
            'success'
        );
    }
}
