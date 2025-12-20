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

        <div class="bg-zinc-900/40 backdrop-blur-2xl p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h1 class="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
            Términos <span class="text-emerald-500">&</span> Condiciones
          </h1>
          <p class="text-zinc-500 mb-12 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Última actualización: 19 de Diciembre de 2025
          </p>
          
          <div class="space-y-12 text-sm md:text-base leading-relaxed">
            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">01</span>
                Aceptación de Términos
              </h2>
              <div class="pl-1 md:pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Al acceder a este sitio web, accesible desde https://www.donmusica.online/, usted acepta estar sujeto a estos Términos y Condiciones de uso del sitio web y acepta que es responsable del acuerdo con cualquier ley local aplicable. Si no está de acuerdo con alguno de estos términos, tiene prohibido acceder a este sitio.</p>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">02</span>
                Licencia de Uso
              </h2>
              <div class="pl-1 md:pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Se concede permiso para descargar temporalmente una copia de los materiales en el sitio web de DonMusica solo para visualización transitoria personal y no comercial. Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia usted no puede:</p>
                <ul class="space-y-2 mt-4 list-disc list-inside">
                  <li>Modificar o copiar los materiales;</li>
                  <li>Usar los materiales para cualquier propósito comercial;</li>
                  <li>Intentar descompilar o realizar ingeniería inversa de cualquier software contenido en DonMusica;</li>
                  <li>Eliminar cualquier derecho de autor u otras notaciones de propiedad de los materiales.</li>
                </ul>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">03</span>
                DMCA / Derechos de Autor
              </h2>
              <div class="pl-1 md:pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>DonMusica actúa como un motor de búsqueda y agregador de contenido multimedia. No alojamos ningún archivo de audio o video en nuestros propios servidores. Todo el contenido es proporcionado por servicios de terceros como YouTube, Spotify, Jamendo, etc.</p>
                <div class="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl">
                  <p class="text-emerald-400 font-bold mb-2">Aviso a los titulares de derechos:</p>
                  <p class="text-sm">Si usted es el propietario de un contenido que aparece en DonMusica y no ha autorizado su uso, puede solicitar la retirada del enlace enviando un correo a <span class="text-white">contacto&#64;donmusica.online</span>. Procesaremos su solicitud en un plazo de 24-48 horas hábiles.</p>
                </div>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">04</span>
                Limitación de Responsabilidad
              </h2>
              <div class="pl-1 md:pl-11 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Todos los materiales en el sitio web de DonMusica se proporcionan "tal cual". DonMusica no ofrece garantías, ya sean expresas o implícitas, y por lo tanto niega todas las demás garantías. Además, DonMusica no hace ninguna representación con respecto a la exactitud o fiabilidad del uso de los materiales en su sitio web o de otro modo en relación con tales materiales o cualquier sitio vinculado a este sitio web.</p>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">05</span>
                Revisiones y Erratas
              </h2>
              <div class="pl-1 md:pl-11 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Los materiales que aparecen en el sitio web de DonMusica podrían incluir errores técnicos, tipográficos o fotográficos. DonMusica no promete que ninguno de los materiales en este sitio web sea exacto, completo o actual. DonMusica puede cambiar los materiales contenidos en su sitio web en cualquier momento sin previo aviso.</p>
              </div>
            </section>

            <section class="group border-t border-white/5 pt-12">
              <h2 class="text-xl font-black text-white mb-4">Contacto</h2>
              <p class="mb-6">Si tiene alguna pregunta sobre estos Términos, por favor contáctenos:</p>
              <a href="mailto:contacto&#64;donmusica.online" 
                class="inline-flex items-center gap-3 bg-emerald-500 text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 w-full md:w-auto overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 flex-shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span class="break-all text-xs md:text-sm">contacto&#64;donmusica.online</span>
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
