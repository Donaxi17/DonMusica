import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { ArtistsComponent } from './components/artists/artists.component';
import { PlayerComponent } from './components/player/player.component';
import { DownloadPageComponent } from './components/download-page/download-page.component';
import { adminGuard } from './guards/admin.guard';


export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'home', redirectTo: '', pathMatch: 'full' },
            { path: 'artists', component: ArtistsComponent },
            { path: 'player', component: PlayerComponent },

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
                    { path: 'search', loadComponent: () => import('./components/browse/search/search.component').then(m => m.SearchComponent) }
                ]
            },
            { path: 'blog', loadComponent: () => import('./components/blog/blog.component').then(m => m.BlogComponent) },
            { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent) },
            { path: 'contact', loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent) },
            { path: 'saved-lyrics', loadComponent: () => import('./components/saved-lyrics/saved-lyrics.component').then(m => m.SavedLyricsComponent) },
            { path: 'sin-copyright', loadComponent: () => import('./components/free-music/free-music.component').then(m => m.FreeMusicComponent) },
            {
                path: 'admin',
                loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
                canActivate: [adminGuard]
            }
        ]
    },
    { path: 'download', component: DownloadPageComponent },
    { path: 'privacy', loadComponent: () => import('./components/legal/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
    { path: 'terms', loadComponent: () => import('./components/legal/terms.component').then(m => m.TermsComponent) },
    { path: 'admin-login', loadComponent: () => import('./components/admin-login/admin-login.component').then(m => m.AdminLoginComponent) },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
