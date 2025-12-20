import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
    selector: 'app-don-musica-ads',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      <!-- Hero Section / Background Effects -->
      <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        <!-- Floating Beta Badge -->
        <div class="flex justify-center mb-8">
          <div class="bg-purple-500/10 border border-purple-500/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 animate-bounce">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span class="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Beta En Desarrollo</span>
          </div>
        </div>

        <!-- Main Header -->
        <div class="text-center mb-16 md:mb-20 animate-fade-in-up">
          <h1 class="text-5xl md:text-8xl font-bold mb-4 md:mb-6 tracking-tight">
            DonMusica <span class="bg-gradient-to-r from-purple-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Ads</span>
          </h1>
          <p class="max-w-xl mx-auto text-zinc-400 text-base md:text-xl leading-relaxed px-4">
            Lleva tu música al siguiente nivel. Conecta con miles de oyentes a través de campañas publicitarias inteligentes y personalizadas.
          </p>
        </div>

        <!-- Action Card -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-24 md:mb-32">
          <div class="space-y-6 md:space-y-8 animate-fade-in-left px-2">
            <h2 class="text-2xl md:text-5xl font-bold leading-tight">
              Diseñado para <span class="text-emerald-400">el nuevo artista.</span>
            </h2>
            <div class="space-y-5">
              <div class="flex gap-4 group">
                <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all shrink-0">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg md:text-xl font-bold mb-1">Crecimiento Real</h3>
                  <p class="text-zinc-500 text-xs md:text-base">Segmentación precisa para llegar a tu audiencia ideal.</p>
                </div>
              </div>
              <div class="flex gap-4 group">
                <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all shrink-0">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg md:text-xl font-bold mb-1">Analíticas Live</h3>
                  <p class="text-zinc-500 text-xs md:text-base">Visualiza el impacto de cada anuncio al instante.</p>
                </div>
              </div>
              <div class="flex gap-4 group">
                <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all shrink-0">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg md:text-xl font-bold mb-1">Control de Inversión</h3>
                  <p class="text-zinc-500 text-xs md:text-base">Tú decides el presupuesto diario de tus campañas.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="relative animate-fade-in-right px-2 lg:px-0">
            <div class="absolute inset-x-0 top-0 h-64 bg-purple-500/10 blur-[80px] rounded-full-mobile"></div>
            <div class="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div class="flex items-center gap-4 mb-8 md:mb-10">
                <div class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 p-2 flex items-center justify-center border border-white/10">
                  <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 animate-spin-slow"></div>
                </div>
                <div>
                    <h4 class="font-bold text-base md:text-lg leading-none mb-1 md:mb-2">Ads Manager</h4>
                    <span class="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-2 py-0.5 border border-zinc-800 rounded">Development</span>
                </div>
              </div>

              <!-- Mockup elements -->
              <div class="space-y-4">
                <div class="h-6 w-3/4 bg-white/5 rounded-lg animate-pulse"></div>
                <div class="h-32 w-full bg-gradient-to-r from-purple-500/10 to-transparent rounded-2xl border border-white/5 flex items-center justify-center">
                   <span class="text-xs font-mono text-purple-400/50">DATA_REPRESENTATION_MODULE.JS</span>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <div class="h-16 bg-white/5 rounded-xl border border-white/5"></div>
                  <div class="h-16 bg-white/5 rounded-xl border border-white/5"></div>
                  <div class="h-16 bg-white/5 rounded-xl border border-white/5"></div>
                </div>
              </div>

              <div class="mt-10">
                <button class="w-full py-4 text-xs md:text-base bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all active:scale-95">
                  Unirse a la lista de espera
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Development Info Section -->
        <div class="bg-gradient-to-b from-zinc-900/50 to-transparent border border-white/5 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-center animate-fade-in-up">
           <svg class="w-10 h-10 md:w-16 md:h-16 text-zinc-600 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <h3 class="text-xl md:text-3xl font-bold mb-4">Estamos construyendo el futuro.</h3>
           <p class="text-zinc-500 text-sm md:text-xl max-w-xl mx-auto mb-10 px-2 lg:px-0">
             Nuestro equipo de ingeniería está trabajando activamente en herramientas de promoción de alto impacto. DonMusica Ads permitirá a los artistas pagar por espacios publicitarios estratégicos dentro de la plataforma para destacar su talento ante miles de oyentes.
           </p>
           <div class="flex flex-wrap justify-center gap-6">
              <div class="px-6 py-3 bg-zinc-800/50 rounded-2xl border border-white/5 flex items-center gap-3">
                 <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span class="text-sm font-bold text-zinc-300">Algoritmo de Segmentación v0.9</span>
              </div>
              <div class="px-6 py-3 bg-zinc-800/50 rounded-2xl border border-white/5 flex items-center gap-3">
                 <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                 <span class="text-sm font-bold text-zinc-300">Integración de Pagos</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in-left {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fade-in-right {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    .animate-fade-in-left { animation: fade-in-left 0.8s ease-out forwards; }
    .animate-fade-in-right { animation: fade-in-right 0.8s ease-out forwards; }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  `]
})
export class DonMusicaAdsComponent implements OnInit {
    private seoService = inject(SeoService);

    ngOnInit() {
        this.seoService.setSeoData(
            'DonMusica Ads - Promoción para Artistas Independientes',
            'DonMusica Ads es la nueva plataforma publicitaria diseñada para artistas. Promociona tu música, llega a nuevos oyentes y escala tu carrera musical con analíticas avanzadas. Próximamente en DonMusica.'
        );
    }
}
