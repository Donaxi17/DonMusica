import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PwaInstallService {
    private platformId = inject(PLATFORM_ID);

    // Signal to track if installation is possible via browser prompt
    showInstallButton = signal(false);

    // Signal to track if the user closed the manual banner
    bannerClosed = signal(false);

    // Track if it's iOS
    isIOS = signal(false);

    // Store the event to trigger it later
    private deferredPrompt: any = null;

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.init();
        }
    }

    private init() {
        const ua = window.navigator.userAgent;
        this.isIOS.set(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

        // Check if app was already marked as installed locally
        const isInstalled = localStorage.getItem('donmusic_pwa_installed') === 'true';
        if (isInstalled) {
            this.showInstallButton.set(false);
            return;
        }

        // Check if banner was already closed
        const closedDate = localStorage.getItem('donmusic_pwa_banner_closed');
        if (closedDate) {
            // Increased to 30 days for better UX
            const lastClosed = new Date(closedDate).getTime();
            const now = new Date().getTime();
            if (now - lastClosed < 30 * 24 * 60 * 60 * 1000) {
                this.bannerClosed.set(true);
            }
        }

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) {
            this.showInstallButton.set(false);
            return;
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            this.deferredPrompt = e;
            // Update UI notify the user they can install the PWA
            this.showInstallButton.set(true);
            console.log('PWA Install Prompt captured');
        });

        window.addEventListener('appinstalled', () => {
            this.showInstallButton.set(false);
            this.deferredPrompt = null;
            localStorage.setItem('donmusic_pwa_installed', 'true');
            console.log('PWA Installed');
        });

        // Set initial manual banner state for iOS
        if (this.isIOS() && !isStandalone) {
            this.showInstallButton.set(true);
        }
    }

    async installApp() {
        if (this.isIOS()) {
            return; // On iOS we just show instructions via toast/UI
        }

        if (!this.deferredPrompt) return;

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, discard it
        this.deferredPrompt = null;
        this.showInstallButton.set(false);
    }

    closeBanner() {
        this.bannerClosed.set(true);
        // Optional: save to localStorage to not show again for some time
        localStorage.setItem('donmusic_pwa_banner_closed', new Date().toISOString());
    }
}

