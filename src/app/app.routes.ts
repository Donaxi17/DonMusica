import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { DownloadPageComponent } from './components/download-page/download-page.component';

export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'download', component: DownloadPageComponent },
    { path: '**', redirectTo: '/404', pathMatch: 'full' }
];
