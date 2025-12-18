import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-black text-zinc-300 py-12 px-4 md:px-8 relative selection:bg-purple-500/30">
      <!-- Background Ambient Glow -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full"></div>
        <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div class="max-w-4xl mx-auto relative z-10">
        <!-- Back Button -->
        <button (click)="goBack()" 
          class="group flex items-center gap-2 mb-8 text-zinc-500 hover:text-white transition-all duration-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span class="text-sm font-bold uppercase tracking-widest">Regresar</span>
        </button>

        <div class="bg-zinc-900/40 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h1 class="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
            Política de <span class="text-purple-500">Privacidad</span>
          </h1>
          <p class="text-zinc-500 mb-12 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            Última actualización: 11 de Diciembre de 2025
          </p>
          
          <div class="space-y-12 text-sm md:text-base leading-relaxed">
            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">01</span>
                Introducción
              </h2>
              <div class="pl-11 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Bienvenido a DonMusica. Respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta política le informará sobre cómo cuidamos sus datos cuando visita nuestro sitio.</p>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">02</span>
                Información que Recopilamos
              </h2>
              <div class="pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Podemos recopilar los siguientes tipos de datos:</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span class="text-purple-400 font-bold block mb-1">Técnicos</span>
                    IP, navegador, sistema operativo.
                  </div>
                  <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span class="text-purple-400 font-bold block mb-1">De Uso</span>
                    Páginas visitadas, tiempo de sesión.
                  </div>
                </div>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">03</span>
                Google AdSense
              </h2>
              <div class="pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Google utiliza cookies para mostrar anuncios basados en sus visitas a este u otros sitios. Puede inhabilitar la publicidad personalizada en su cuenta de Google.</p>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">04</span>
                Seguridad
              </h2>
              <div class="pl-11 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Implementamos medidas de seguridad avanzadas para proteger su información contra pérdida, uso indebido o acceso no autorizado.</p>
              </div>
            </section>

            <section class="group border-t border-white/5 pt-12">
              <h2 class="text-xl font-black text-white mb-4">Preguntas de Privacidad</h2>
              <p class="mb-6">Para cualquier solicitud relacionada con sus datos personales:</p>
              <a href="mailto:contacto&#64;donmusica.online" 
                class="inline-flex items-center gap-4 bg-purple-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Privacidad DonMusica
              </a>
            </section>
          </div>
        </div>

        <div class="mt-12 text-center text-zinc-600 text-sm font-medium">
          Confianza & Transparencia &bull; DonMusica
        </div>
      </div>
    </div>
  `
})
export class PrivacyPolicyComponent {
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
