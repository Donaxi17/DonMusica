import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, Inject, HostListener, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import { AdsContainerComponent } from '../../shared/ads-container/ads-container.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { MusicApiService } from '../../../services/music-api.service';
import { Song } from '../../../services/playlist.service';
import { PlayerService } from '../../../services/player.service';
import { SeoService } from '../../../services/seo.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../services/language.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
    selector: 'app-new-releases',
    standalone: true,
    imports: [CommonModule, SkeletonComponent, AdsContainerComponent],
    templateUrl: './new-releases.component.html'
})
export class NewReleasesComponent implements OnInit, OnDestroy {
    private seoService = inject(SeoService);
    public languageService = inject(LanguageService);
    public settingsService = inject(SettingsService);
    private playerSubscription?: Subscription;

    releases = signal<Song[]>([]);
    private allReleases: Song[] = [];
    loading = signal(true);
    currentSongIndex = signal<number>(-1);
    isPlaying = signal(false);
    currentTime = signal(0);
    duration = signal(0);

    // Filter options using global settings
    selectedRegion = this.settingsService.selectedRegion;
    regions = [
        { code: 'CO' as const, name: 'Colombia 🇨🇴', flag: '🇨🇴' },
        { code: 'MX' as const, name: 'México 🇲🇽', flag: '🇲🇽' },
        { code: 'US' as const, name: 'Mundial 🌎', flag: '🌎' }
    ];

    private regionSub: any;

    translatedRegions = computed(() => {
        return this.regions.map(r => ({
            ...r,
            name: r.code === 'US' ? this.languageService.get('trends.world') : r.name
        }));
    });

    constructor(
        private musicApi: MusicApiService,
        private player: PlayerService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // Move toObservable here to maintain Injection Context (Fixes NG0203)
        this.regionSub = toObservable(this.selectedRegion).pipe(skip(1)).subscribe(region => {
            this.loadReleases(region);
        });
    }

    ngOnInit() {
        // SEO optimization
        this.seoService.setSeoData(
            this.languageService.get('releases.seo.title'),
            this.languageService.get('releases.seo.desc')
        );

        // Initial Load
        this.loadReleases(this.selectedRegion());

        // Subscribe to player state changes
        this.subscribeToPlayer();
    }

    changeRegion(region: 'CO' | 'US' | 'MX') {
        if (this.selectedRegion() === region) return;
        this.selectedRegion.set(region);
    }

    trackByRegionCode(index: number, region: any): string {
        return region.code;
    }

    private loadReleases(region: string) {
        this.loading.set(true);
        this.musicApi.getNewReleases(region, 29).subscribe({
            next: (data) => {
                this.allReleases = data;
                this.updateVisibleItems();
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading new releases:', err);
                this.loading.set(false);
                this.releases.set([]);
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.updateVisibleItems();
    }

    private updateVisibleItems() {
        if (!isPlatformBrowser(this.platformId)) return;
        const width = window.innerWidth;
        let limit = 29;

        if (width >= 1280) {
            limit = 29;
        } else {
            const target = 28;
            const available = this.allReleases.length;
            if (available >= target) {
                limit = target;
            } else {
                limit = Math.floor(available / 2) * 2;
            }
        }

        if (this.allReleases.length > 0) {
            this.releases.set(this.allReleases.slice(0, limit));
        }
    }

    ngOnDestroy() {
        this.playerSubscription?.unsubscribe();
    }

    private subscribeToPlayer() {
        this.playerSubscription = this.player.currentSong$.subscribe(song => {
            if (song) {
                const index = this.releases().findIndex(r => r.id === song.id);
                if (index !== -1) {
                    this.currentSongIndex.set(index);
                }
            }
        });

        this.player.isPlaying$.subscribe(playing => {
            this.isPlaying.set(playing);
        });
    }

    playSong(song: Song, index?: number) {
        const songIndex = index !== undefined ? index : this.releases().findIndex(r => r.id === song.id);
        this.currentSongIndex.set(songIndex);
        this.player.playSong(song);
        this.isPlaying.set(true);
        this.player.setPlaylist(this.releases(), false, 'new-releases');
    }

    playAll() {
        if (this.releases().length > 0) {
            this.playSong(this.releases()[0], 0);
        }
    }

    handleImageError(event: any, title: string) {
        event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=10b981&color=fff&size=300&font-size=0.33`;
    }

    isCurrentSong(song: Song): boolean {
        const currentId = this.player.currentSong?.id;
        return song.id === currentId;
    }
}
