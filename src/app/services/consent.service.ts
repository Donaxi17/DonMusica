import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ConsentService {
    private platformId = inject(PLATFORM_ID);

    cookieConsentHandled = signal(false);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.checkConsent();
        }
    }

    checkConsent() {
        if (isPlatformBrowser(this.platformId)) {
            const consent = localStorage.getItem('donmusic_cookie_consent');
            this.cookieConsentHandled.set(!!consent);
        }
    }

    setConsent(status: 'accepted' | 'declined') {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('donmusic_cookie_consent', status);
            localStorage.setItem('donmusic_cookie_date', new Date().toISOString());
            this.cookieConsentHandled.set(true);
        }
    }
}
