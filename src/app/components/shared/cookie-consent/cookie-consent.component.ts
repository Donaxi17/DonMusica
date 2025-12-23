import { Component, Inject, PLATFORM_ID, signal, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../../services/language.service';
import { ConsentService } from '../../../services/consent.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showBanner()" 
         class="fixed bottom-0 left-0 right-0 z-[9999] p-3 md:p-6 animate-slide-up">
      
      <!-- Container: Compact on Mobile, Spacious on Desktop -->
      <div class="max-w-5xl mx-auto bg-zinc-950 border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl shadow-black p-4 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 relative overflow-hidden">
        
        <!-- Gradient Accents (Desktop only to save mobile performance/space) -->
        <div class="hidden md:block absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="hidden md:block absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Content Wrapper -->
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
            
            <!-- Icon & Text Group -->
            <div class="flex items-start gap-3 md:gap-6 flex-1">
                <!-- Mobile Icon -->
                <span class="text-2xl md:hidden mt-1">🍪</span>
                
                <!-- Desktop Icon -->
                <div class="hidden md:flex flex-shrink-0 w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 items-center justify-center text-3xl">
                  🍪
                </div>

                <div class="flex-1 text-left">
                  <h3 class="text-white font-bold text-base md:text-xl mb-1 md:mb-2">
                    {{ languageService.get('cookies.title') || 'Valoramos tu privacidad' }}
                  </h3>
                  <p class="text-zinc-400 text-xs md:text-sm leading-relaxed">
                    {{ languageService.get('cookies.desc') || 'Usamos cookies para mejorar tu experiencia y mostrar anuncios relevantes. La música y tus funciones favoritas seguirán funcionando igual si decides rechazar.' }}
                    <a href="/privacy" class="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors whitespace-nowrap">{{ languageService.get('cookies.link') || 'Leer Política' }}</a>
                  </p>
                </div>
            </div>

            <!-- Actions: Row on Mobile, Row on Desktop -->
            <div class="flex flex-row gap-2 w-full md:w-auto flex-shrink-0 mt-1 md:mt-0">
              <button (click)="decline()" 
                      class="flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl border border-white/10 bg-zinc-900/50 md:bg-transparent text-zinc-300 font-medium hover:bg-white/5 hover:text-white transition-all text-xs md:text-sm whitespace-nowrap">
                {{ languageService.get('cookies.decline') || 'Solo Esenciales' }}
              </button>
              <button (click)="accept()" 
                      class="flex-1 md:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 text-xs md:text-sm whitespace-nowrap">
                {{ languageService.get('cookies.accept') || 'Aceptar Todo' }}
              </button>
            </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up {
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class CookieConsentComponent {
  showBanner = signal(false);
  private consentService = inject(ConsentService);

  constructor(
    public languageService: LanguageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.checkConsent();
  }

  checkConsent() {
    if (isPlatformBrowser(this.platformId)) {
      const consent = localStorage.getItem('donmusic_cookie_consent');
      if (!consent) {
        // Show after a small delay for smoother UX
        setTimeout(() => this.showBanner.set(true), 2000);
      }
    }
  }

  accept() {
    this.saveConsent('accepted');
  }

  decline() {
    this.saveConsent('declined');
  }

  private saveConsent(status: 'accepted' | 'declined') {
    if (isPlatformBrowser(this.platformId)) {
      this.consentService.setConsent(status);

      // Animate out
      this.showBanner.set(false);

      if (status === 'accepted') {
        console.log('Cookies accepted - Initializing Ads personalization');
      } else {
        console.log('Cookies declined - Running in essential mode');
      }
    }
  }
}

