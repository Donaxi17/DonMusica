import { Injectable, signal, effect, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
    providedIn: 'root'
})
export class DonMusicaProService {
    private readonly STORAGE_KEY = 'donmusic_is_pro_user';
    private toastService = inject(ToastService);

    // Signals
    isPro = signal<boolean>(false);

    // Constants / Limits
    readonly LIMITS = {
        LYRICS: {
            FREE: 20,
            PRO: Infinity // Ilimitado
        },
        UPLOAD_STORAGE: { // En MB
            FREE: 1024, // 1 GB
            PRO: 5120   // 5 GB
        },
        OFFLINE_SONGS: {
            FREE: 20,
            PRO: Infinity
        }
    };

    constructor() {
        this.restoreStatus();
    }

    // ... (existing methods)

    showUpgradeModal() {
        // Create a premium, responsive toast
        const message = `
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 16px; border-radius: 12px; position: relative; overflow: hidden;">
            <!-- Animated gradient overlay -->
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24); background-size: 200% 100%; animation: shimmer 2s infinite;"></div>
            
            <!-- Crown Icon Header -->
            <div style="text-align: center; margin-bottom: 12px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 10px; border-radius: 50%; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);">
                <span style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></span>
              </div>
            </div>
            
            <!-- Title -->
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="font-size: 18px; font-weight: 800; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 4px; letter-spacing: 0.5px;">
                PLAN PRO
              </div>
              <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">
                Próximamente disponible
              </div>
            </div>
            
            <!-- Benefits Section -->
            <div style="background: rgba(30, 41, 59, 0.5); border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid rgba(251, 191, 36, 0.1);">
              <div style="font-size: 12px; font-weight: 700; color: #fbbf24; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 14px;"></span>
                <span>Beneficios Exclusivos</span>
              </div>
              
              <div style="display: grid; gap: 8px;">
                <!-- Benefit 1: Uploads -->
                <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(16, 185, 129, 0.05); border-radius: 6px; border-left: 3px solid #10b981;">
                  <span style="font-size: 14px; flex-shrink: 0;"></span>
                  <div style="font-size: 12px; line-height: 1.4;">
                    <strong style="color: #10b981;">5 GB</strong> <span style="color: #cbd5e1;">para Subir Música</span>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">vs 1 GB en plan FREE</div>
                  </div>
                </div>
                
                <!-- Benefit 2: Offline -->
                <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(59, 130, 246, 0.05); border-radius: 6px; border-left: 3px solid #3b82f6;">
                  <span style="font-size: 14px; flex-shrink: 0;"></span>
                  <div style="font-size: 12px; line-height: 1.4;">
                    <strong style="color: #3b82f6;">5 GB</strong> <span style="color: #cbd5e1;">para Modo Offline</span>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">vs 20 canciones en plan FREE</div>
                  </div>
                </div>
                
                <!-- Benefit 3: Lyrics -->
                <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(236, 72, 153, 0.05); border-radius: 6px; border-left: 3px solid #ec4899;">
                  <span style="font-size: 14px; flex-shrink: 0;"></span>
                  <div style="font-size: 12px; line-height: 1.4;">
                    <strong style="color: #ec4899;">Letras Ilimitadas</strong>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">vs 20 en plan FREE</div>
                  </div>
                </div>
    
                <!-- Benefit 4: No Ads -->
                <div style="display: flex; align-items: start; gap: 8px; padding: 6px; background: rgba(168, 85, 247, 0.05); border-radius: 6px; border-left: 3px solid #a855f7;">
                  <span style="font-size: 14px; flex-shrink: 0;"></span>
                  <div style="font-size: 12px; line-height: 1.4; color: #cbd5e1;">
                    <strong style="color: #a855f7;">Sin anuncios</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding-top: 10px; border-top: 1px solid rgba(148, 163, 184, 0.1);">
              <div style="font-size: 10px; color: #64748b; line-height: 1.5;">
                 Te notificaremos cuando esté disponible
              </div>
            </div>
          </div>
          
          <style>
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          </style>
        `;

        this.toastService.showHtml(message, 'info', 15000); // 10 seconds
    }

    // Restore status from LocalStorage on init
    private restoreStatus() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        this.isPro.set(stored === 'true');
    }

    // Toggle Status (For Dev or Purchase Flow)
    togglePro() {
        this.isPro.update(v => !v);
        this.persist();
    }

    enablePro() {
        this.isPro.set(true);
        this.persist();
    }

    disablePro() {
        this.isPro.set(false);
        this.persist();
    }

    private persist() {
        localStorage.setItem(this.STORAGE_KEY, String(this.isPro()));
        // Force page reload or deep refresh might be needed for some components if they don't use signals,
        // but we will update components to be reactive.
        console.log('[ProService] Status changed:', this.isPro() ? 'PRO' : 'FREE');
    }

    // Helpers to check specific limits
    canSaveLyric(currentCount: number): boolean {
        if (this.isPro()) return true;
        return currentCount < this.LIMITS.LYRICS.FREE;
    }

    canDownloadSong(currentCount: number): boolean {
        if (this.isPro()) return true;
        return currentCount < this.LIMITS.OFFLINE_SONGS.FREE;
    }

    getStorageLimitMB(): number {
        return this.isPro() ? this.LIMITS.UPLOAD_STORAGE.PRO : this.LIMITS.UPLOAD_STORAGE.FREE;
    }

    shouldShowAds(): boolean {
        return !this.isPro();
    }
}
