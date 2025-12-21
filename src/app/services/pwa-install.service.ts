import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PwaInstallService {
    // Signal to track if installation is possible
    showInstallButton = signal(false);

    // Store the event to trigger it later
    private deferredPrompt: any = null;

    constructor() {
        this.init();
    }

    private init() {
        if (typeof window === 'undefined') return;

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
            console.log('PWA Installed');
        });
    }

    async installApp() {
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
}
