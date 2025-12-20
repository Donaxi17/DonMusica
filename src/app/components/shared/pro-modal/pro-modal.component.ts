import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonMusicaProService } from '../../../services/don-musica-pro.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
    selector: 'app-pro-modal',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    template: `
    @if (proService.showModal()) {
      <div class="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div 
            class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            (click)="close()">
        </div>

        <!-- Modal Content -->
        <div class="relative w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-amber-500/20 shadow-2xl overflow-hidden animate-bounce-in">
            
            <!-- Shimmer Effect Top Border -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 w-[200%] animate-shimmer"></div>

            <!-- Close Button -->
            <button (click)="close()" class="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors z-10">
                <app-svg-icon name="x" width="20" height="20"></app-svg-icon>
            </button>

            <div class="p-6 text-center relative">
                <!-- Icon Crown -->
                <div class="inline-flex mb-4 p-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_4px_20px_rgba(251,191,36,0.4)] relative z-10">
                   <app-svg-icon name="check-circle" class="text-white" width="32" height="32"></app-svg-icon>
                </div>

                <!-- Title -->
                <div class="mb-5">
                    <h2 class="text-2xl font-black bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 bg-clip-text text-transparent tracking-wide mb-1">
                        PLAN PRO
                    </h2>
                    <p class="text-xs text-slate-400 font-medium uppercase tracking-widest">Próximamente disponible</p>
                </div>

                <!-- Benefits -->
                <div class="bg-slate-800/50 rounded-xl p-4 border border-amber-500/10 mb-5 space-y-3 text-left">
                    <h3 class="text-xs font-bold text-amber-400 uppercase mb-3 flex items-center gap-2">
                        <app-svg-icon name="star" width="12" height="12"></app-svg-icon>
                        Beneficios Exclusivos
                    </h3>

                    <!-- Item 1 -->
                    <div class="flex items-start gap-3 p-2 rounded-lg bg-emerald-500/5 border-l-2 border-emerald-500">
                        <div class="flex-1">
                            <p class="text-xs leading-relaxed text-slate-300">
                                <strong class="text-emerald-400 text-sm">5 GB</strong> para Subir Música
                            </p>
                            <p class="text-[10px] text-slate-500 mt-0.5">vs 500 MB en plan FREE</p>
                        </div>
                    </div>

                    <!-- Item 2 -->
                    <div class="flex items-start gap-3 p-2 rounded-lg bg-blue-500/5 border-l-2 border-blue-500">
                         <div class="flex-1">
                            <p class="text-xs leading-relaxed text-slate-300">
                                <strong class="text-blue-400 text-sm">5 GB</strong> para Modo Offline
                            </p>
                            <p class="text-[10px] text-slate-500 mt-0.5">vs 500 MB en plan FREE</p>
                        </div>
                    </div>

                    <!-- Item 3 -->
                    <div class="flex items-start gap-3 p-2 rounded-lg bg-pink-500/5 border-l-2 border-pink-500">
                        <div class="flex-1">
                            <p class="text-xs leading-relaxed text-slate-300">
                                <strong class="text-pink-400 text-sm">Letras Ilimitadas</strong>
                            </p>
                            <p class="text-[10px] text-slate-500 mt-0.5">vs 20 en plan FREE</p>
                        </div>
                    </div>

                    <!-- Item 4 -->
                    <div class="flex items-start gap-3 p-2 rounded-lg bg-purple-500/5 border-l-2 border-purple-500">
                        <div class="flex-1">
                            <p class="text-sm font-bold text-purple-400">Sin anuncios</p>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                 <p class="text-[10px] text-slate-500">Te notificaremos cuando esté disponible</p>
            </div>
        </div>
      </div>
    }
  `,
    styles: [`
    @keyframes shimmer {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0%); }
    }
    .animate-shimmer {
      animation: shimmer 2s linear infinite;
    }
    @keyframes bounce-in {
        0% { transform: scale(0.9); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    .animate-bounce-in {
        animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
  `]
})
export class ProModalComponent {
    proService = inject(DonMusicaProService);

    close() {
        this.proService.closeModal();
    }
}
