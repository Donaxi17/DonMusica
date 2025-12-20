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

        <div class="bg-zinc-900/40 backdrop-blur-2xl p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h1 class="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
            Política de <span class="text-purple-500">Privacidad</span>
          </h1>
          <p class="text-zinc-500 mb-12 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            Última actualización: 19 de Diciembre de 2025
          </p>
          
          <div class="space-y-12 text-sm md:text-base leading-relaxed">
            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">01</span>
                Introducción
              </h2>
              <div class="pl-1 md:pl-11 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>En DonMusica, accesible desde https://www.donmusica.online/, una de nuestras principales prioridades es la privacidad de nuestros visitantes. Este documento de Política de Privacidad contiene tipos de información que DonMusica recopila y registra, y cómo la utilizamos.</p>
                <p class="mt-4">Si tiene preguntas adicionales o requiere más información sobre nuestra Política de Privacidad, no dude en contactarnos.</p>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">02</span>
                Archivos de Registro (Log Files)
              </h2>
              <div class="pl-1 md:pl-11 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>DonMusica sigue un procedimiento estándar de uso de archivos de registro. Estos archivos registran a los visitantes cuando visitan sitios web. Todas las empresas de alojamiento hacen esto y es parte del análisis de los servicios de alojamiento. La información recopilada por los archivos de registro incluye direcciones de protocolo de Internet (IP), tipo de navegador, proveedor de servicios de Internet (ISP), marca de fecha y hora, páginas de referencia/salida y posiblemente el número de clics. Estos no están vinculados a ninguna información que sea personalmente identificable. El propósito de la información es analizar tendencias, administrar el sitio, rastrear el movimiento de los usuarios en el sitio web y recopilar información demográfica.</p>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">03</span>
                Cookies y Web Beacons
              </h2>
              <div class="pl-1 md:pl-11 space-y-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Al igual que cualquier otro sitio web, DonMusica utiliza 'cookies'. Estas cookies se utilizan para almacenar información, incluidas las preferencias de los visitantes y las páginas del sitio web a las que el visitante accedió o visitó. La información se utiliza para optimizar la experiencia de los usuarios al personalizar el contenido de nuestra página web según el tipo de navegador de los visitantes y/u otra información.</p>
                
                <div class="bg-white/5 p-6 rounded-2xl border border-white/5 mt-6">
                  <h3 class="text-white font-bold mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0 1 1 0 002 0zM4.5 5A.5.5 0 004 5.5V11a.5.5 0 00.5.5H5V14a1 1 0 001 1h3a1 1 0 001-1v-2.5h.5a.5.5 0 00.5-.5V5.5a.5.5 0 00-.5-.5h-6z" /></svg>
                    Cookie de Google DoubleClick DART
                  </h3>
                  <p class="text-sm">Google es uno de los proveedores externos en nuestro sitio. También utiliza cookies, conocidas como cookies de DART, para mostrar anuncios a los visitantes de nuestro sitio en función de su visita a www.website.com y otros sitios en Internet. Sin embargo, los visitantes pueden optar por rechazar el uso de cookies de DART visitando la Política de Privacidad de la red de contenido y anuncios de Google en la siguiente URL: <a href="https://policies.google.com/technologies/ads" class="text-purple-400 underline">https://policies.google.com/technologies/ads</a></p>
                </div>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">04</span>
                Políticas de Privacidad de Terceros
              </h2>
              <div class="pl-1 md:pl-11 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>La Política de Privacidad de DonMusica no se aplica a otros anunciantes o sitios web. Por lo tanto, le recomendamos que consulte las Políticas de Privacidad respectivas de estos servidores de anuncios de terceros para obtener información más detallada. Puede incluir sus prácticas e instrucciones sobre cómo inhabilitar ciertas opciones.</p>
                <p class="mt-4">Puede optar por desactivar las cookies a través de las opciones de su navegador individual. Para conocer información más detallada sobre la gestión de cookies con navegadores web específicos, se puede encontrar en los sitios web respectivos de los navegadores.</p>
              </div>
            </section>

            <section class="group">
              <h2 class="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">05</span>
                Información para Niños (COPPA)
              </h2>
              <div class="pl-1 md:pl-11 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                <p>Otra parte de nuestra prioridad es añadir protección para los niños mientras usan Internet. Animamos a los padres y tutores a observar, participar y/o supervisar y guiar su actividad en línea.</p>
                <p class="mt-4">DonMusica no recopila conscientemente ninguna Información de Identificación Personal de niños menores de 13 años. Si cree que su hijo proporcionó este tipo de información en nuestro sitio web, le recomendamos encarecidamente que se ponga en contacto con nosotros inmediatamente y haremos todo lo posible para eliminar rápidamente dicha información de nuestros registros.</p>
              </div>
            </section>

            <section class="group border-t border-white/5 pt-12">
              <h2 class="text-xl font-black text-white mb-4">Consentimiento</h2>
              <p class="mb-6">Al utilizar nuestro sitio web, usted acepta nuestra Política de Privacidad y acepta sus Términos y Condiciones.</p>
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
          Seguridad & Confianza &bull; DonMusica.online
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
