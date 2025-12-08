import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-black border-t border-zinc-900 pt-10 pb-24 md:pb-8 px-6 md:px-12 mt-auto">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          <!-- Brand -->
          <div class="col-span-1 md:col-span-1 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18.573c2.206 0 4-1.794 4-4V4.428L19 7.7v7.43a3.953 3.953 0 0 0-2-.557c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4V7a.998.998 0 0 0-.658-.939l-11-4A.999.999 0 0 0 8 3v8.13a3.953 3.953 0 0 0-2-.557c-2.206 0-4 1.794-4 4s1.794 4 4 4z"/>
                </svg>
              </div>
              <span class="text-xl font-bold text-white tracking-tight">DonMusica</span>
            </div>
            <p class="text-zinc-500 text-xs md:text-sm leading-relaxed mb-6">
              La plataforma de streaming definitiva. Descubre, escucha y comparte la mejor música sin límites.
            </p>
            <div class="flex gap-4 justify-center md:justify-start">
              <a href="#" class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-white transition-all">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-white transition-all">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"/>
                </svg>
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-white transition-all">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Links 1 -->
          <div class="text-center md:text-left">
            <h4 class="text-white font-bold mb-4 md:mb-6">Descubrir</h4>
            <ul class="space-y-2 md:space-y-3 text-xs md:text-sm text-zinc-500">
              <li><a routerLink="/browse/trends" class="hover:text-emerald-400 transition-colors">Tendencias</a></li>
              <li><a routerLink="/browse/new-releases" class="hover:text-emerald-400 transition-colors">Novedades</a></li>
              <li><a routerLink="/browse/charts" class="hover:text-emerald-400 transition-colors">Rankings</a></li>
              <li><a routerLink="/artists" class="hover:text-emerald-400 transition-colors">Artistas</a></li>
            </ul>
          </div>

          <!-- Links 2 -->
          <div class="text-center md:text-left">
            <h4 class="text-white font-bold mb-4 md:mb-6">Comunidad</h4>
            <ul class="space-y-2 md:space-y-3 text-xs md:text-sm text-zinc-500">
              <li><a routerLink="/blog" class="hover:text-emerald-400 transition-colors">Blog</a></li>
              <li><a routerLink="/about" class="hover:text-emerald-400 transition-colors">Sobre Nosotros</a></li>
              <li><a routerLink="/contact" class="hover:text-emerald-400 transition-colors">Contacto</a></li>
              <li><a href="#" class="hover:text-emerald-400 transition-colors">Para Artistas</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div class="text-center md:text-left">
            <h4 class="text-white font-bold mb-4 md:mb-6">Legal</h4>
            <ul class="space-y-2 md:space-y-3 text-xs md:text-sm text-zinc-500">
              <li><a routerLink="/privacy" class="hover:text-emerald-400 transition-colors">Política de Privacidad</a></li>
              <li><a routerLink="/terms" class="hover:text-emerald-400 transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" class="hover:text-emerald-400 transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p class="text-zinc-600 text-xs md:text-sm">
            © 2025 DonMusica. Todos los derechos reservados.
          </p>
          <div class="flex items-center gap-2 text-zinc-600 text-xs md:text-sm">
            <span>Hecho con</span>
            <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.205 4.791a5.938 5.938 0 0 0-4.209-1.754A5.906 5.906 0 0 0 12 4.595a5.904 5.904 0 0 0-3.996-1.558 5.942 5.942 0 0 0-4.213 1.758c-2.353 2.363-2.352 6.059.002 8.412L12 21.414l8.207-8.207c2.354-2.353 2.355-6.049-.002-8.416z"/>
            </svg>
            <span>en Colombia</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent { }
