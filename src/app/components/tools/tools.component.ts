import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div class="min-h-screen bg-zinc-950 pb-32 text-white">
      <!-- Header Premium -->
      <div class="relative pt-8 pb-6 px-6 bg-gradient-to-b from-indigo-900/20 to-zinc-950 border-b border-white/5">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Herramientas Pro
          </h1>
          <p class="text-zinc-400 text-sm">Estudio de utilidades sonoras avanzadas.</p>
        </div>
      </div>

      <div class="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- 1. DJ ZONE -->
        <button (click)="navigateTo('/dj-zone')" 
          class="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-left hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 active:scale-[0.98]">
          <div class="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
            <app-svg-icon name="disc" class="text-purple-500 w-24 h-24 -mr-8 -mt-8 rotate-12"></app-svg-icon>
          </div>
          <div class="relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <svg class="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-1">DJ Zone</h3>
            <p class="text-zinc-500 text-sm">Mezcladora virtual profesional.</p>
          </div>
        </button>

        <!-- 2. BASS TEST -->
        <button (click)="navigateTo('/tools/bass-test')" 
          class="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-left hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/20 active:scale-[0.98]">
          <div class="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
            <svg class="w-24 h-24 text-cyan-500 opacity-20 -mr-8 -mt-8 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
          </div>
          <div class="relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
              <svg class="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-1">Bass Test</h3>
            <p class="text-zinc-500 text-sm">Limpiador y prueba de bajos.</p>
          </div>
        </button>

        <!-- 3. GUITAR TUNER -->
        <button (click)="navigateTo('/tools/tuner')" 
          class="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-left hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-900/20 active:scale-[0.98]">
           <div class="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
             <svg class="w-24 h-24 text-orange-500 opacity-20 -mr-8 -mt-8 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 12H6v-2h5c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H6V6h5c1.66 0 3 1.34 3 3v2c0 1.66-1.34 3-3 3z"/></svg>
           </div>
           <div class="relative z-10">
             <div class="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
               <svg class="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 12H6v-2h5c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H6V6h5c1.66 0 3 1.34 3 3v2c0 1.66-1.34 3-3 3z"/></svg>
             </div>
             <h3 class="text-xl font-bold text-white mb-1">Afinador</h3>
             <p class="text-zinc-500 text-sm">Tonos de referencia precisos.</p>
           </div>
        </button>

        <!-- 4.1 SLEEP TIMER (New) -->
        <button (click)="navigateTo('/tools/sleep-timer')" 
          class="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-left hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/20 active:scale-[0.98]">
           <div class="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
             <svg class="w-24 h-24 text-indigo-500 opacity-20 -mr-8 -mt-8 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
           </div>
           <div class="relative z-10">
             <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
               <svg class="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
             </div>
             <h3 class="text-xl font-bold text-white mb-1">Sleep Timer</h3>
             <p class="text-zinc-500 text-sm">Apagado automático.</p>
           </div>
        </button>

        <!-- 4.2 ZEN ZONE (New) -->
        <button (click)="navigateTo('/tools/zen-mode')" 
          class="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-left hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 active:scale-[0.98]">
           <div class="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
             <svg class="w-24 h-24 text-emerald-500 opacity-20 -mr-8 -mt-8 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9-4.03-9-9-4.97 0-9 4.03-9 9 0 4.97 4.03 9 9 9zm6-6l-2 1v2h-1v-2l-2-1v-2h-2v2l-2 1v2H8v-2l-2-1v-4h4V6h2v6h2v-2l2-1v-2h2v2z"/></svg>
           </div>
           <div class="relative z-10">
             <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
               <svg class="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1H8v-1h2c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h2v1H9c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h-2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1zm5-4h2v-1h-2v1zm0-3h2V9h-2v1zm5 6h2v-2c0-.55-.45-1-1-1h-2v2c0 .55.45 1 1 1zm0-4h2V9c0-.55-.45-1-1-1h-2v2c0 .55.45 1 1 1z"/></svg>
             </div>
             <h3 class="text-xl font-bold text-white mb-1">Zen Zone</h3>
             <p class="text-zinc-500 text-sm">Sonidos relajantes de ambiente.</p>
           </div>
        </button>

        <!-- 4.3 PIANO (New) -->
        <button (click)="navigateTo('/tools/piano')" 
          class="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-left hover:border-gray-100/30 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/20 active:scale-[0.98]">
           <div class="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
             <svg class="w-24 h-24 text-white opacity-10 -mr-8 -mt-8 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 2h2.5v12h-2.5V4zm-7 0h2.5v12H5V4zm14 0h-2.5v12H19V4zm-7 16H4v-2h8v2zm8 0h-8v-2h8v2z"/></svg>
           </div>
           <div class="relative z-10">
             <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
               <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-8-2h2v-9h-2v9zm-4 0h2v-9H9v9H5v-9h2v9zm12 0h-2v-9h2v9z"/></svg>
             </div>
             <h3 class="text-xl font-bold text-white mb-1">Piano</h3>
             <p class="text-zinc-500 text-sm">Teclado de bolsillo.</p>
           </div>
        </button>

        <!-- 4. VOCAL FX -->
        <button (click)="navigateTo('/tools/vocal-fx')" 
          class="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-left hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-900/20 active:scale-[0.98]">
           <div class="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
             <svg class="w-24 h-24 text-pink-500 opacity-20 -mr-8 -mt-8 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
           </div>
           <div class="relative z-10">
             <div class="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
               <svg class="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
             </div>
             <h3 class="text-xl font-bold text-white mb-1">Vocal FX</h3>
             <p class="text-zinc-500 text-sm">Grabadora con efectos de voz.</p>
           </div>
        </button>

      </div>
    </div>
  `
})
export class ToolsComponent {
  constructor(private router: Router) { }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
