import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div class="min-h-screen bg-zinc-950 pb-32 text-white selection:bg-indigo-500/30">
      <!-- Header Premium -->
      <div class="relative pt-8 md:pt-12 pb-8 md:pb-10 px-5 md:px-6 overflow-hidden">
        <!-- Decoration Background -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(79,70,229,0.15),transparent_70%)]"></div>
        <div class="absolute -top-12 md:-top-24 -left-12 md:-left-24 w-64 md:w-96 h-64 md:h-96 bg-indigo-500/10 blur-[80px] md:blur-[100px] rounded-full"></div>
        <div class="absolute -top-12 md:-top-24 -right-12 md:-right-24 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 blur-[80px] md:blur-[100px] rounded-full"></div>
        
        <div class="max-w-6xl mx-auto relative z-10 text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 md:mb-6 animate-fade-in transition-all">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">Audio Studio PRO</span>
          </div>
          
          <h1 class="text-3xl md:text-6xl font-black mb-3 md:mb-4 tracking-tighter uppercase leading-none">
            Herramientas <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic">Pro</span>
          </h1>
          <p class="text-zinc-500 text-xs md:text-lg max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
            Potencia tu sonido con utilidades de estudio profesional.
          </p>
        </div>
      </div>

      <div class="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

        <!-- 1. DJ ZONE -->
        <button (click)="navigateTo('/dj-zone')" 
          class="group relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-left hover:border-indigo-500/30 transition-all duration-500 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-95">
          <div class="absolute -right-6 -top-6 md:-right-8 md:-top-8 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
            <app-svg-icon name="disc" class="text-indigo-500/10 w-32 h-32 md:w-40 md:h-40"></app-svg-icon>
          </div>
          
          <div class="relative z-10">
            <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
              <svg class="w-6 h-6 md:w-7 md:h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.856.12-1.685.344-2.469" />
              </svg>
            </div>
            <h3 class="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-indigo-300 transition-colors uppercase tracking-tight">DJ Zone</h3>
            <p class="text-zinc-500 text-[10px] md:text-sm leading-relaxed mb-4">Mezcladora virtual profesional con efectos en tiempo real.</p>
            <div class="flex items-center gap-2 text-indigo-400 text-[9px] font-black uppercase tracking-wider transition-all translate-x-[-5px] group-hover:translate-x-0">
              Explorar Estudio <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </div>
          </div>
        </button>

        <!-- 2. BASS TEST -->
        <button (click)="navigateTo('/tools/bass-test')" 
          class="group relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-left hover:border-cyan-500/30 transition-all duration-500 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 active:scale-95">
          <div class="absolute -right-6 -top-6 md:-right-8 md:-top-8 transition-transform duration-700 group-hover:scale-125">
             <svg class="w-32 h-32 md:w-40 md:h-40 text-cyan-500/10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
          </div>
          
          <div class="relative z-10">
            <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-cyan-500/20 transition-all duration-500">
              <svg class="w-6 h-6 md:w-7 md:h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303A2.25 2.25 0 017.368 17.72l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66A2.25 2.25 0 009 11.813V9z" />
              </svg>
            </div>
            <h3 class="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-cyan-300 transition-colors uppercase tracking-tight">Bass Test</h3>
            <p class="text-zinc-500 text-[10px] md:text-sm leading-relaxed mb-4">Limpia altavoces y prueba bajos con frecuencias subsónicas.</p>
            <div class="flex items-center gap-2 text-cyan-400 text-[9px] font-black uppercase tracking-wider transition-all translate-x-[-5px] group-hover:translate-x-0">
              Calibrar Audio <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </div>
          </div>
        </button>

        <!-- 3. GUITAR TUNER -->
        <button (click)="navigateTo('/tools/tuner')" 
          class="group relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-left hover:border-orange-500/30 transition-all duration-500 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10 active:scale-95">
           <div class="absolute -right-6 -top-6 md:-right-8 md:-top-8 transition-transform duration-700 group-hover:rotate-[-10deg]">
             <svg class="w-32 h-32 md:w-40 md:h-40 text-orange-500/10" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 12H6v-2h5c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H6V6h5c1.66 0 3 1.34 3 3v2c0 1.66-1.34 3-3 3z"/></svg>
           </div>
           
           <div class="relative z-10">
             <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-orange-500/20 transition-all duration-500">
               <svg class="w-6 h-6 md:w-7 md:h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                 <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5L21 3" />
               </svg>
             </div>
             <h3 class="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-orange-300 transition-colors uppercase tracking-tight">Afinador</h3>
             <p class="text-zinc-500 text-[10px] md:text-sm leading-relaxed mb-4">Referencia de tonos precisos para cualquier instrumento.</p>
             <div class="flex items-center gap-2 text-orange-400 text-[9px] font-black uppercase tracking-wider transition-all translate-x-[-5px] group-hover:translate-x-0">
               Afinar Ahora <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
             </div>
           </div>
        </button>

        <!-- 4. ZEN ZONE -->
        <button (click)="navigateTo('/tools/zen-mode')" 
          class="group relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-left hover:border-emerald-500/30 transition-all duration-500 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 active:scale-95">
           <div class="absolute -right-6 -top-6 md:-right-8 md:-top-8 transition-transform duration-1000 group-hover:scale-150 opacity-10">
             <svg class="w-32 h-32 md:w-40 md:h-40 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9-4.03-9-9-4.97 0-9 4.03-9 9 0 4.97 4.03 9 9 9z"/></svg>
           </div>
           
           <div class="relative z-10">
             <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-emerald-500/20 transition-all duration-500">
               <svg class="w-6 h-6 md:w-7 md:h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
               </svg>
             </div>
             <h3 class="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-emerald-300 transition-colors uppercase tracking-tight">Zen Zone</h3>
             <p class="text-zinc-500 text-[10px] md:text-sm leading-relaxed mb-4">Atmósfera de relax con paisajes sonoros de alta fidelidad.</p>
             <div class="flex items-center gap-2 text-emerald-400 text-[9px] font-black uppercase tracking-wider transition-all translate-x-[-5px] group-hover:translate-x-0">
               Relajarse <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
             </div>
           </div>
        </button>

        <!-- 5. PIANO -->
        <button (click)="navigateTo('/tools/piano')" 
          class="group relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-left hover:border-white/20 transition-all duration-500 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/5 active:scale-95">
           <div class="absolute -right-6 -top-6 md:-right-8 md:-top-8 transition-transform duration-700 opacity-5 group-hover:translate-x-4">
             <svg class="w-32 h-32 md:w-40 md:h-40 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-8-2h2v-9h-2v9zm-4 0h2v-9H9v9H5v-9h2v9zm12 0h-2v-9h2v9z"/></svg>
           </div>
           
           <div class="relative z-10">
             <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-white/10 transition-all duration-500">
               <svg class="w-6 h-6 md:w-7 md:h-7 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
               </svg>
             </div>
             <h3 class="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-white/90 transition-colors uppercase tracking-tight">Piano</h3>
             <p class="text-zinc-500 text-[10px] md:text-sm leading-relaxed mb-4">Compón melodías rápidas con este sintetizador polifónico.</p>
             <div class="flex items-center gap-2 text-white/60 text-[9px] font-black uppercase tracking-wider transition-all translate-x-[-5px] group-hover:translate-x-0">
               Tocar Piano <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
             </div>
           </div>
        </button>

        <!-- 6. VOCAL FX -->
        <button (click)="navigateTo('/tools/vocal-fx')" 
          class="group relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-left hover:border-pink-500/30 transition-all duration-500 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/10 active:scale-95">
           <div class="absolute -right-6 -top-6 md:-right-8 md:-top-8 transition-transform duration-700 opacity-10 group-hover:translate-y-4">
             <svg class="w-32 h-32 md:w-40 md:h-40 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
           </div>
           
           <div class="relative z-10">
             <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-pink-500/20 transition-all duration-500">
               <svg class="w-6 h-6 md:w-7 md:h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
               </svg>
             </div>
             <h3 class="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-pink-300 transition-colors uppercase tracking-tight">Vocal Master</h3>
             <p class="text-zinc-500 text-[10px] md:text-sm leading-relaxed mb-4">Aplica efectos de estudio y autotune a tu voz en tiempo real.</p>
             <div class="flex items-center gap-2 text-pink-400 text-[9px] font-black uppercase tracking-wider transition-all translate-x-[-5px] group-hover:translate-x-0">
               Grabar Voz <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
             </div>
           </div>
        </button>

      </div>
    </div>
  `
})
export class ToolsComponent implements OnInit {
  private router = inject(Router);
  private meta = inject(Meta);
  private title = inject(Title);

  ngOnInit() {
    this.updateSeo();
  }

  updateSeo() {
    this.title.setTitle('Herramientas Pro Studio - DonMusica');
    this.meta.updateTag({ name: 'description', content: 'Estudio de utilidades sonoras avanzadas: DJ Zone, Bass Test, Afinador, Zen Mode y Piano. Optimiza tu experiencia musical.' });
    this.meta.updateTag({ property: 'og:title', content: 'Herramientas Pro de DonMusica' });
    this.meta.updateTag({ property: 'og:description', content: 'Utilidades de audio profesionales gratuitas en tu navegador.' });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
