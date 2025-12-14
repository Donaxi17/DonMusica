import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { ToastService } from './toast.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {
    private toastService = inject(ToastService);
    private platformId = inject(PLATFORM_ID);

    // Initialize signal
    isOnline = signal<boolean>(true);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            // Initial monitor setup
            this.initNetworkMonitoring();
        }
    }

    private initNetworkMonitoring() {
        // Set initial state based on navigator
        this.isOnline.set(navigator.onLine);

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.checkRealConnection();
        });

        window.addEventListener('offline', () => {
            this.updateOnlineStatus(false);
        });

        // Initial real check
        this.checkRealConnection();

        // Poll every 5 seconds to detect "soft" offline states (connected to WiFi but no data)
        setInterval(() => {
            if (navigator.onLine) {
                this.checkRealConnection();
            }
        }, 5000);
    }

    private updateOnlineStatus(status: boolean) {
        // Only update and notify if status CHANGED
        if (this.isOnline() !== status) {
            this.isOnline.set(status);

            if (status) {
                console.log('🌐 Connection restored');
                this.toastService.success('✅ Conexión restaurada');
            } else {
                console.log('📡 Connection lost');
                this.toastService.warning('⚠️ Sin conexión a internet');
            }
        }
    }

    /**
     * Verifica la conexión real haciendo un ping a un servidor confiable
     * Evita falsos positivos de navigator.onLine
     */
    async checkRealConnection(): Promise<boolean> {
        // If navigator says we are offline, trust it immediately
        if (!navigator.onLine) {
            this.updateOnlineStatus(false);
            return false;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();

            // Ping a local asset (reliable and no CORS issues)
            await fetch(`/assets/icons/icon-72x72.png?_=${timestamp}`, {
                method: 'HEAD',
                cache: 'no-cache',
                // Add a short timeout to fail fast
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // If we get here, the request didn't throw (or timeout), so we have connectivity
            this.updateOnlineStatus(true);
            return true;
        } catch (error) {
            clearTimeout(timeoutId);
            console.warn('Real connection check failed:', error);
            this.updateOnlineStatus(false);
            return false;
        }
    }
}
