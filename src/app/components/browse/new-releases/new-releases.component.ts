import { Component, OnInit, signal, inject, PLATFORM_ID, Inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import { AdsContainerComponent } from '../../shared/ads-container/ads-container.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { MusicApiService } from '../../../services/music-api.service';
import { Song } from '../../../services/playlist.service';
import { PlayerService } from '../../../services/player.service';
import { SeoService } from '../../../services/seo.service';
import { LanguageService } from '../../../services/language.service';
import { SettingsService } from '../../../services/settings.service';
import { ImgFallbackDirective } from '../../../directives/img-fallback.directive';
import { ToastService } from '../../../services/toast.service';

import { NativeAdsComponent } from '../../shared/native-ads/native-ads.component';

@Component({
    selector: 'app-new-releases',
    standalone: true,
    imports: [CommonModule, SkeletonComponent, ImgFallbackDirective, NativeAdsComponent],
    templateUrl: './new-releases.component.html'
})
export class NewReleasesComponent implements OnInit {
    private seoService = inject(SeoService);
    public languageService = inject(LanguageService);
    public settingsService = inject(SettingsService);

    releases = signal<Song[]>([]);
    private allReleases: Song[] = [];
    loading = signal(true);
    currentSongIndex = signal<number>(-1);
    isPlaying = signal(false);
    currentTime = signal(0);
    duration = signal(0);

    // Filter options using global settings
    selectedRegion = this.settingsService.selectedRegion;

    translatedRegions = computed(() => {
        return this.settingsService.regions.map(r => ({
            ...r,
            name: r.code === 'US' ? this.languageService.get('trends.world') : r.name
        }));
    });

    constructor(
        private musicApi: MusicApiService,
        private player: PlayerService,
        private toastService: ToastService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // Sync region changes
        toObservable(this.selectedRegion)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe(region => {
                this.loadReleases(region);
            });

        // Sync player state
        this.player.isPlaying$
            .pipe(takeUntilDestroyed())
            .subscribe(playing => {
                this.isPlaying.set(playing);
            });

        // For time/duration we might need another approach if they are not exposed as observables or if we don't need them reactive here (template usually handles async pipe for these if they are observables).
        // If currentTime/duration are needed for UI updates:
        // Assuming PlayerService has currentTime$ and duration$
        /* 
        this.player.currentTime$.pipe(takeUntilDestroyed()).subscribe(t => this.currentTime.set(t));
        this.player.duration$.pipe(takeUntilDestroyed()).subscribe(d => this.duration.set(d));
        */
    }

    ngOnInit() {
        // SEO optimization
        this.seoService.setSeoData(
            this.languageService.get('releases.seo.title'),
            this.languageService.get('releases.seo.desc')
        );

        // Initial Load
        this.loadReleases(this.selectedRegion());
    }

    changeRegion(region: 'CO' | 'US' | 'MX') {
        if (this.selectedRegion() === region) return;
        this.selectedRegion.set(region);
    }

    trackByRegionCode(index: number, region: { code: string }): string {
        return region.code;
    }

    private loadReleases(region: string) {
        this.loading.set(true);
        this.musicApi.getNewReleases(region, 80).subscribe({
            next: (data) => {
                this.allReleases = data;
                this.releases.set(data);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading new releases', error);
                this.toastService.error(this.languageService.get('errors.loading_releases') || 'Error cargando lanzamientos');
                this.loading.set(false);
                this.releases.set([]);
            }
        });
    }

    playSong(song: Song, index: number) {
        this.player.setPlaylist(this.releases(), false, 'new-releases');
        this.player.playSong(song);
    }

    playAll() {
        if (this.releases().length === 0) return;
        this.player.setPlaylist(this.releases(), false, 'new-releases');
        this.player.playSong(this.releases()[0]);
    }

    isCurrentSong(song: Song): boolean {
        return this.player.currentSong?.id === song.id;
    }
}
