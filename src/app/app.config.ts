import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withFetch, withJsonpSupport } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules), // Preload all lazy-loaded routes
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(withFetch(), withJsonpSupport()), // Use fetch API and JSONP for iTunes API
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyAjK5OdUD8HMdlzRfsxDqRQ0dwOMzTvuKE",
      authDomain: "donmusica-final.firebaseapp.com",
      projectId: "donmusica-final",
      storageBucket: "donmusica-final.firebasestorage.app",
      messagingSenderId: "816803516200",
      appId: "1:816803516200:web:2c6220c0455c4ad80d8a1d",
      measurementId: "G-0ERFXF46YN"
    })),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
};
