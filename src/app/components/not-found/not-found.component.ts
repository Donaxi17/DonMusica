import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      
      <!-- Background Effects -->
      <div class="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px] animate-pulse"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <div class="relative z-10 text-center max-w-lg">
        <!-- 404 Glitch Text -->
        <h1 class="text-[150px] md:text-[200px] font-black text-white leading-none tracking-tighter mix-blend-screen opacity-50 select-none">
          404
        </h1>

        <div class="relative -mt-12 md:-mt-20 mb-8">
            <div class="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center mx-auto animate-spin-slow shadow-2xl shadow-purple-500/20">
                <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 border-2 border-zinc-700"></div>
            </div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-red-500/50 rotate-45 blur-sm"></div>
        </div>

        <h2 class="text-2xl md:text-4xl font-bold text-white mb-4">¡Pista no encontrada!</h2>
        <p class="text-zinc-400 text-sm md:text-lg mb-8 leading-relaxed">
          Parece que la canción que buscas fue eliminada de la playlist o nunca existió.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button (click)="goBack()" class="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 text-white font-bold transition-all">
            Volver Atrás
          </button>
          <a routerLink="/" class="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
            Ir al Inicio
          </a>
        </div>
      </div>

    </div>
  `,
    styles: [`
    .animate-spin-slow {
      animation: spin 8s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class NotFoundComponent {
    constructor(private location: Location) { }

    goBack() {
        this.location.back();
    }
}
