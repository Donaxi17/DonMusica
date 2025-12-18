import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-black text-zinc-300 py-12 px-4 md:px-8 relative selection:bg-emerald-500/30">
      <!-- Background Ambient Glow -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full"></div>
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
            Términos <span class="text-emerald-500">&</span> Condiciones
          </h1>
          <p class="text-zinc-500 mb-12 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Última actualización: 11 de Diciembre de 2025
          </p>
          
          <div class="space-y-12 text-sm md:text-base leading-relaxed">
            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">01</span>
                Aceptación de los Términos
              </h2>
              <div class="pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Al acceder y utilizar DonMusica ("el Sitio", "nosotros", "nuestro"), usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.</p>
                <p>El uso continuado del Sitio constituye su aceptación de estos términos y de cualquier modificación futura.</p>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">02</span>
                Descripción del Servicio
              </h2>
              <div class="pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>DonMusica es una plataforma de streaming de música que:</p>
                <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <li class="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2"></div>
                    Proporciona acceso a contenido mediante enlaces a servicios de terceros.
                  </li>
                  <li class="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2"></div>
                    NO aloja archivos de música o video en nuestros servidores.
                  </li>
                </ul>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">03</span>
                Derechos de Autor
              </h2>
              <div class="pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Todo el contenido musical mostrado en DonMusica es propiedad de sus respectivos dueños y está protegido por leyes internacionales de derechos de autor.</p>
                <div class="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400">
                  <strong>Aviso Importante:</strong> Respetamos la propiedad intelectual. Si considera que su contenido es usado indebidamente, contáctenos para su retiro inmediato.
                </div>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">04</span>
                Uso Aceptable
              </h2>
              <div class="pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Usted se compromete a no utilizar el Sitio para actividades ilegales, distribución de malware o infracción de derechos de autor.</p>
              </div>
            </section>

            <section class="group border-t border-white/5 pt-12">
              <h2 class="text-xl font-black text-white mb-4">Contacto Directo</h2>
              <p class="mb-6">Si tiene alguna pregunta sobre estos Términos o desea reportar una infracción:</p>
              <a href="mailto:contacto&#64;donmusica.online" 
                class="inline-flex items-center gap-4 bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                contacto&#64;donmusica.online
              </a>
            </section>
          </div>
        </div>

        <div class="mt-12 text-center text-zinc-600 text-sm font-medium">
          &copy; 2025 DonMusica Premium. Todos los derechos reservados.
        </div>
      </div>
    </div>
  `
})
export class TermsComponent {
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
