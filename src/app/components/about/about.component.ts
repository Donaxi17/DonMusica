import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-zinc-950 text-white py-12 px-4 md:px-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <div class="inline-flex p-4 bg-emerald-500/10 rounded-full text-emerald-400 mb-6">
            <i class='bx bx-music text-4xl'></i>
          </div>
          <h1 class="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-100 to-zinc-400 bg-clip-text text-transparent">
            Sobre DonMusica
          </h1>
          <p class="text-xl text-zinc-400 max-w-2xl mx-auto">
            Tu plataforma de música sin límites, creada para conectar artistas y oyentes en todo el mundo.
          </p>
        </div>

        <!-- Mission -->
        <section class="mb-16 p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <i class='bx bx-target-lock text-2xl'></i>
            </div>
            <h2 class="text-3xl font-bold text-white">Nuestra Misión</h2>
          </div>
          <p class="text-zinc-300 text-lg leading-relaxed mb-4">
            DonMusica nació con la visión de democratizar el acceso a la música de calidad. Creemos que la música es un lenguaje universal que conecta culturas, emociones y personas sin importar fronteras.
          </p>
          <p class="text-zinc-300 text-lg leading-relaxed">
            Nuestra misión es proporcionar una plataforma donde artistas emergentes y establecidos puedan compartir su talento con el mundo, mientras los oyentes descubren nueva música sin restricciones geográficas ni barreras económicas.
          </p>
        </section>

        <!-- What We Offer -->
        <section class="mb-16">
          <h2 class="text-3xl font-bold text-white mb-8 text-center">¿Qué Ofrecemos?</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition-all">
              <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                <i class='bx bx-library text-2xl'></i>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Catálogo Extenso</h3>
              <p class="text-zinc-400">
                Acceso a millones de canciones de todos los géneros: desde reggaetón hasta música clásica, pasando por pop, rock, electrónica y más.
              </p>
            </div>

            <div class="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition-all">
              <div class="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4">
                <i class='bx bx-trending-up text-2xl'></i>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Tendencias en Tiempo Real</h3>
              <p class="text-zinc-400">
                Mantente al día con las canciones más populares del momento a nivel global y local. Descubre qué está sonando en Colombia y el mundo.
              </p>
            </div>

            <div class="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition-all">
              <div class="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
                <i class='bx bx-headphone text-2xl'></i>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Alta Calidad de Audio</h3>
              <p class="text-zinc-400">
                Disfruta de streaming de alta fidelidad con soporte para formatos de audio premium. Tu música merece el mejor sonido.
              </p>
            </div>

            <div class="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition-all">
              <div class="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400 mb-4">
                <i class='bx bx-shield-alt-2 text-2xl'></i>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Música Sin Copyright</h3>
              <p class="text-zinc-400">
                Biblioteca especial para creadores de contenido con música libre de derechos para usar en videos, streams y proyectos.
              </p>
            </div>
          </div>
        </section>

        <!-- Values -->
        <section class="mb-16 p-8 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20">
          <h2 class="text-3xl font-bold text-white mb-8 text-center">Nuestros Valores</h2>
          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <i class='bx bx-check text-white text-2xl'></i>
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white mb-2">Accesibilidad</h3>
                <p class="text-zinc-300">Creemos que todos merecen acceso a música de calidad, sin importar su ubicación o situación económica.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <i class='bx bx-check text-white text-2xl'></i>
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white mb-2">Apoyo a Artistas</h3>
                <p class="text-zinc-300">Estamos desarrollando programas de patrocinio para ayudar a artistas a monetizar su contenido y crecer su audiencia.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <i class='bx bx-check text-white text-2xl'></i>
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white mb-2">Innovación Continua</h3>
                <p class="text-zinc-300">Constantemente mejoramos nuestra plataforma con nuevas características y tecnologías para ofrecer la mejor experiencia.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Team/Community -->
        <section class="text-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <h2 class="text-3xl font-bold text-white mb-6">Únete a Nuestra Comunidad</h2>
          <p class="text-zinc-300 text-lg mb-8 max-w-2xl mx-auto">
            DonMusica es más que una plataforma de streaming. Somos una comunidad de amantes de la música, artistas, creadores y oyentes que comparten la pasión por descubrir y compartir grandes canciones.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <a href="#" class="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all">
              Empezar a Escuchar
            </a>
            <a href="/contact" class="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-full border border-zinc-700 transition-all">
              Contáctanos
            </a>
          </div>
        </section>

        <!-- Stats -->
        <section class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <p class="text-4xl font-black text-emerald-400 mb-2">2024</p>
            <p class="text-zinc-400 text-sm">Año de Fundación</p>
          </div>
          <div class="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <p class="text-4xl font-black text-blue-400 mb-2">10k+</p>
            <p class="text-zinc-400 text-sm">Artistas</p>
          </div>
          <div class="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <p class="text-4xl font-black text-purple-400 mb-2">5M+</p>
            <p class="text-zinc-400 text-sm">Canciones</p>
          </div>
          <div class="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <p class="text-4xl font-black text-yellow-400 mb-2">24/7</p>
            <p class="text-zinc-400 text-sm">Disponible</p>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AboutComponent implements OnInit {
    private seoService = inject(SeoService);

    ngOnInit() {
        this.seoService.setSeoData(
            'Sobre Nosotros - DonMusica | Plataforma de Música Sin Límites',
            'Conoce la historia de DonMusica, nuestra misión de democratizar el acceso a la música de calidad y cómo estamos ayudando a artistas y oyentes a conectar en todo el mundo.'
        );
    }
}
