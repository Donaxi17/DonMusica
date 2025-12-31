import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { adminGuard } from './guards/admin.guard';


export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
            { path: 'home', redirectTo: '', pathMatch: 'full' },
            { path: 'artists', loadComponent: () => import('./components/artists/artists.component').then(m => m.ArtistsComponent) },
            { path: 'artist/:id', loadComponent: () => import('./components/artist-detail/artist-detail.component').then(m => m.ArtistDetailComponent) },
            { path: 'artist/:id/biography', loadComponent: () => import('./components/artist-biography/artist-biography.component').then(m => m.ArtistBiographyComponent) },
            { path: 'player', loadComponent: () => import('./components/player/player.component').then(m => m.PlayerComponent) },

            { path: 'videos', loadComponent: () => import('./components/videos/videos.component').then(m => m.VideosComponent) },
            { path: 'radio', loadComponent: () => import('./components/radio/radio.component').then(m => m.RadioComponent) },
            { path: 'playlists', loadComponent: () => import('./components/playlists/playlists.component').then(m => m.PlaylistsComponent) },
            {
                path: 'browse',
                loadComponent: () => import('./components/browse/browse.component').then(m => m.BrowseComponent),
                children: [
                    { path: '', redirectTo: 'trends', pathMatch: 'full' },
                    { path: 'trends', loadComponent: () => import('./components/browse/trends/trends.component').then(m => m.TrendsComponent) },
                    { path: 'new-releases', loadComponent: () => import('./components/browse/new-releases/new-releases.component').then(m => m.NewReleasesComponent) },
                    { path: 'charts', loadComponent: () => import('./components/browse/charts/charts.component').then(m => m.ChartsComponent) },

                    { path: 'featured-playlists', loadComponent: () => import('./components/browse/playlists/playlists.component').then(m => m.PlaylistsComponent) },
                    { path: 'lyrics', loadComponent: () => import('./components/browse/lyrics/lyrics.component').then(m => m.LyricsComponent) }
                ]
            },
            { path: 'blog', loadComponent: () => import('./components/blog/blog.component').then(m => m.BlogComponent) },
            { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent) },
            { path: 'contact', loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent) },
            { path: 'faq', loadComponent: () => import('./components/faq/faq.component').then(m => m.FaqComponent) },
            { path: 'saved-lyrics', loadComponent: () => import('./components/saved-lyrics/saved-lyrics.component').then(m => m.SavedLyricsComponent) },
            { path: 'sin-copyright', loadComponent: () => import('./components/free-music/free-music.component').then(m => m.FreeMusicComponent) },
            {
                path: 'admin',
                loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
                canActivate: [adminGuard]
            },

            { path: 'dj-zone', loadComponent: () => import('./components/dj-pad/dj-pad.component').then(m => m.DjPadComponent) },
            {
                path: 'tools',
                children: [
                    { path: '', loadComponent: () => import('./components/tools/tools.component').then(m => m.ToolsComponent) },
                    { path: 'bass-test', loadComponent: () => import('./components/tools/bass-test/bass-test.component').then(m => m.BassTestComponent) },
                    { path: 'tuner', loadComponent: () => import('./components/tools/tuner/tuner.component').then(m => m.TunerComponent) },
                    { path: 'vocal-fx', loadComponent: () => import('./components/tools/vocal-fx/vocal-fx.component').then(m => m.VocalFxComponent) },
                    { path: 'zen-mode', loadComponent: () => import('./components/tools/zen-mode/zen-mode.component').then(m => m.ZenModeComponent) },
                    { path: 'piano', loadComponent: () => import('./components/tools/piano/piano.component').then(m => m.PianoComponent) }
                ]
            },
            { path: 'offline-music', loadComponent: () => import('./components/offline-music/offline-music.component').then(m => m.OfflineMusicComponent) },
            { path: 'smart-shuffle', loadComponent: () => import('./components/smart-shuffle-experience/smart-shuffle-experience.component').then(m => m.SmartShuffleExperienceComponent) },
            { path: 'upload-music', loadComponent: () => import('./components/upload-music/upload-music.component').then(m => m.UploadMusicComponent) },
            { path: 'ads', loadComponent: () => import('./components/don-musica-ads/don-musica-ads.component').then(m => m.DonMusicaAdsComponent) },
            { path: 'games', loadComponent: () => import('./components/games/games.component').then(m => m.GamesComponent) }

        ]
    },
    { path: 'download', loadComponent: () => import('./components/download-page/download-page.component').then(m => m.DownloadPageComponent) },
    { path: 'privacy-policy', loadComponent: () => import('./components/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
    { path: 'privacy', redirectTo: 'privacy-policy', pathMatch: 'full' },
    { path: 'terms', loadComponent: () => import('./components/terms/terms.component').then(m => m.TermsComponent) },
    { path: 'admin-login', loadComponent: () => import('./components/admin-login/admin-login.component').then(m => m.AdminLoginComponent) },
    { path: '**', loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
