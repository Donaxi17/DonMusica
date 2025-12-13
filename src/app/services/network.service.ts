import { Injectable, signal, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {
    private toastService = inject(ToastService);
    isOnline = signal(navigator.onLine);

    constructor() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline.set(true);
            console.log('🌐 Connection restored');
            this.toastService.success('✅ Conexión restaurada');

            // Verificar conexión real al servidor
            this.checkRealConnection();
        });

        window.addEventListener('offline', () => {
            this.isOnline.set(false);
            console.log('📡 Connection lost');
            this.toastService.warning('⚠️ Sin conexión a internet');
        });

        // Verificar conexión real al iniciar
        this.checkRealConnection();
    }

    /**
     * Verifica la conexión real haciendo un ping a un servidor confiable
     * Evita falsos positivos de navigator.onLine
     */
    async checkRealConnection(): Promise<boolean> {
        try {
            // Intentar hacer ping a Google (rápido y confiable)
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });

            const hasConnection = true; // Si llegamos aquí, hay conexión
            this.isOnline.set(hasConnection);
            return hasConnection;
        } catch (error) {
            console.warn('Real connection check failed:', error);
            this.isOnline.set(false);
            return false;
        }
    }
}
