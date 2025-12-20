import { Injectable, signal, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface Toast {
    id: number;
    message: string | SafeHtml;
    originalMessage?: string; // Para comparar duplicados
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    isHtml?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private sanitizer = inject(DomSanitizer);
    toasts = signal<Toast[]>([]);
    private nextId = 0;

    show(message: string, type: Toast['type'] = 'info', duration = 3000) {
        const id = this.nextId++;
        const toast: Toast = { id, message, originalMessage: message, type, duration, isHtml: false };

        this.toasts.update(() => {
            // Only keep the latest toast
            return [toast];
        });

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    showHtml(htmlMessage: string, type: Toast['type'] = 'info', duration = 3000) {
        const id = this.nextId++;
        const safeHtml = this.sanitizer.bypassSecurityTrustHtml(htmlMessage);
        const toast: Toast = { id, message: safeHtml, originalMessage: htmlMessage, type, duration, isHtml: true };

        this.toasts.update(() => {
            // Only keep the latest toast
            return [toast];
        });

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(message: string, duration = 5000) {
        this.show(message, 'success', duration);
    }

    error(message: string, duration = 5000) {
        this.show(message, 'error', duration);
    }

    info(message: string, duration = 6000) {
        this.show(message, 'info', duration);
    }

    warning(message: string, duration = 6000) {
        this.show(message, 'warning', duration);
    }

    remove(id: number) {
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }
}
