import { Component, Inject, PLATFORM_ID, signal, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../../services/language.service';
import { PwaInstallService } from '../../../services/pwa-install.service';
import { ConsentService } from '../../../services/consent.service';
import { HapticService } from '../../../services/haptic.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-pwa-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="shouldShow()" 
         class="fixed bottom-0 left-0 right-0 z-[9998] p-3 md:p-6 animate-slide-up">
      
      <div class="max-w-5xl mx-auto bg-zinc-950 border border-emerald-500/20 rounded-2xl md:rounded-3xl shadow-2xl shadow-black p-4 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 relative overflow-hidden">
        
        <!-- Luxury Accents -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Content Wrapper -->
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4 w-full relative z-10">
            
            <!-- Icon & Text Group -->
            <div class="flex items-start gap-3 md:gap-6 flex-1">
                <div class="flex-shrink-0 w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-zinc-900 border border-emerald-500/10 flex items-center justify-center p-2 shadow-inner">
                  <img src="assets/icons/icon-192x192.png" 
                       class="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                       alt="App Icon">
                </div>

                <div class="flex-1 text-left">
                  <h3 class="text-white font-bold text-base md:text-2xl mb-1 md:mb-2 flex items-center gap-2">
                    {{ languageService.get('home.install.title') }}
                    <span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest hidden md:inline-block">PWA</span>
                  </h3>
                  <p class="text-zinc-400 text-xs md:text-base leading-relaxed max-w-xl">
                    {{ languageService.get('home.install.desc') }}
                  </p>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-row gap-2 w-full md:w-auto flex-shrink-0 mt-2 md:mt-0">
              <button (click)="close()" 
                      class="flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-4 rounded-lg md:rounded-2xl border border-white/5 bg-white/5 text-zinc-400 font-medium hover:bg-white/10 hover:text-white transition-all text-xs md:text-sm">
                {{ languageService.get('layout.close') }}
              </button>
              <button (click)="install()" 
                      class="flex-1 md:flex-none px-6 md:px-10 py-2.5 md:py-4 rounded-lg md:rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-black hover:from-emerald-400 hover:to-green-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 text-xs md:text-base uppercase tracking-tight">
                {{ languageService.get('home.install.btn') }}
              </button>
            </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up {
      animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class PwaBannerComponent {
  public languageService = inject(LanguageService);
  public pwaInstallService = inject(PwaInstallService);
  private consentService = inject(ConsentService);
  private hapticService = inject(HapticService);
  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);

  shouldShow(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    // Show only if:
    // 1. Installation is possible
    // 2. Banner hasn't been closed manually
    // 3. Cookie consent has been handled (to avoid overlapping)
    return this.pwaInstallService.showInstallButton() &&
      !this.pwaInstallService.bannerClosed() &&
      this.consentService.cookieConsentHandled();
  }

  install() {
    this.hapticService.success();

    if (this.pwaInstallService.isIOS()) {
      this.toastService.info(this.languageService.get('home.toast.install_instructions'));
      return;
    }

    this.pwaInstallService.installApp();
  }

  close() {
    this.hapticService.light();
    this.pwaInstallService.closeBanner();
  }
}
