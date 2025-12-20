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
  showModal = signal<boolean>(false);

  // Constants / Limits
  readonly LIMITS = {
    LYRICS: {
      FREE: 20,
      PRO: Infinity // Ilimitado
    },
    UPLOAD_STORAGE: { // En MB
      FREE: 500,
      PRO: 5120   // 5 GB
    },
    OFFLINE_STORAGE: { // En MB
      FREE: 500,
      PRO: 5120   // 5 GB
    }
  };

  constructor() {
    this.restoreStatus();
  }

  // ... (existing methods)

  showUpgradeModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
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
    // console.log('[ProService] Status changed:', this.isPro() ? 'PRO' : 'FREE');
  }

  // Helpers to check specific limits
  canSaveLyric(currentCount: number): boolean {
    if (this.isPro()) return true;
    return currentCount < this.LIMITS.LYRICS.FREE;
  }


  getUploadLimitMB(): number {
    return this.isPro() ? this.LIMITS.UPLOAD_STORAGE.PRO : this.LIMITS.UPLOAD_STORAGE.FREE;
  }

  getOfflineLimitMB(): number {
    return this.isPro() ? this.LIMITS.OFFLINE_STORAGE.PRO : this.LIMITS.OFFLINE_STORAGE.FREE;
  }

  shouldShowAds(): boolean {
    return !this.isPro();
  }
}
