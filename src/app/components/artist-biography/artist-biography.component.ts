import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { LastFmService, LastFmArtistInfo } from '../../services/lastfm.service';
import { SpotifyService } from '../../services/spotify.service';
// import { ItunesService } from '../../services/itunes.service'; // Optional fallback
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';

import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-artist-biography',
  standalone: true,
  imports: [CommonModule, RouterModule, SvgIconComponent, AdsContainerComponent, SkeletonComponent],
  templateUrl: './artist-biography.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class ArtistBiographyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private dbService = inject(DatabaseService);
  private lastFmService = inject(LastFmService);
  private spotifyService = inject(SpotifyService);

  artistId = signal<string>('');
  artistName = signal<string>('');
  artistImage = signal<string>('/assets/img/default-music.png');
  biography = signal<string>('');
  tags = signal<{ name: string; url: string }[]>([]);
  stats = signal<{ listeners: string; playcount: string } | null>(null);
  loading = signal<boolean>(true);


  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.artistId.set(id);
        this.loadArtistData(id);
      }
    });
  }

  async loadArtistData(id: string) {
    this.loading.set(true);

    // 1. Get Basic Info from DB (to get name)
    this.dbService.getArtists().subscribe(async (artists: any[]) => {
      const found = artists.find((a: any) => a.id === id);

      if (found) {
        this.artistName.set(found.name);
        if (found.image && !found.image.includes('default')) {
          this.artistImage.set(found.image);
        }

        // 2. Fetch specific high-res image from Spotify if needed
        const spotifyStats = await this.spotifyService.getArtistStats(found.name);
        if (spotifyStats && spotifyStats.image) {
          this.artistImage.set(spotifyStats.image);
        }

        // 3. Fetch Full Biography from Last.fm
        this.lastFmService.getArtistInfo(found.name).subscribe(info => {
          if (info) {
            if (info.bio && info.bio.content) {
              // Only use content, remove Last.fm legal links and Creative Commons text
              let cleanBio = info.bio.content;

              // Remove the specific "Read more on Last.fm" link
              cleanBio = cleanBio.replace(/<a href="https:\/\/www\.last\.fm.*?>Read more on Last\.fm<\/a>/g, "");

              // Remove the User-contributed text license notice
              cleanBio = cleanBio.replace(/\.?\s*User-contributed text is available under the Creative Commons By-SA License; additional terms may apply\./g, "");

              this.biography.set(cleanBio);
            }
            if (info.tags && info.tags.tag) {
              this.tags.set(info.tags.tag);
            }
            if (info.stats) {
              this.stats.set({
                listeners: parseInt(info.stats.listeners).toLocaleString(),
                playcount: parseInt(info.stats.playcount).toLocaleString()
              });
            }
          }
          this.loading.set(false);
        });
      } else {
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
