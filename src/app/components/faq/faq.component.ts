import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
  category: 'general' | 'legal' | 'tecnico' | 'artistas';
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <!-- Background Gradients -->
      <div class="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-900/10 via-zinc-950/50 to-zinc-950 pointer-events-none z-0"></div>
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute top-40 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
        <!-- Header -->
        <div class="text-center mb-12 md:mb-16">
          <div class="inline-flex p-4 bg-zinc-900/80 border border-zinc-800 rounded-full text-yellow-400 mb-6 shadow-xl backdrop-blur-sm">
            <app-svg-icon name="info-circle" width="40" height="40" class="text-yellow-500"></app-svg-icon>
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-white via-yellow-100 to-zinc-500 bg-clip-text text-transparent tracking-tight">
            Preguntas Frecuentes
          </h1>
          <p class="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Resolvemos tus dudas sobre DonMusica, derechos de autor y funcionamiento de la plataforma.
          </p>
        </div>

        <!-- Filters (Optional, keeping it simple for now or adding basic tabs if needed) -->
        
        <!-- FAQ Grid -->
        <div class="space-y-3 md:space-y-4">
          @for (item of faqs(); track item.id) {
            <div class="bg-zinc-900/40 border border-zinc-800/50 rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50"
                 [class.bg-zinc-900]="item.isOpen">
              
              <button (click)="toggleFaq(item.id)" 
                      class="w-full flex items-center justify-between p-4 md:p-6 text-left focus:outline-none group active:bg-zinc-800/50 transition-colors">
                <span class="text-sm md:text-lg font-bold text-zinc-200 group-hover:text-white transition-colors pr-3 md:pr-4 leading-tight">
                  {{ item.question }}
                </span>
                <div class="shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-zinc-800 flex items-center justify-center transition-transform duration-300"
                     [class.rotate-180]="item.isOpen"
                     [class.bg-yellow-500]="item.isOpen"
                     [class.text-black]="item.isOpen">
                  <app-svg-icon name="chevron-right" width="14" height="14" class="md:w-5 md:h-5 transition-transform" 
                                [class.rotate-90]="item.isOpen"></app-svg-icon>
                </div>
              </button>

              <div class="grid transition-all duration-300 ease-in-out"
                   [class.grid-rows-[1fr]]="item.isOpen"
                   [class.grid-rows-[0fr]]="!item.isOpen">
                <div class="overflow-hidden">
                  <div class="p-4 md:p-6 pt-0 text-gray-400 text-xs md:text-base leading-relaxed border-t border-zinc-800/50 mt-1 md:mt-2">
                    <p [innerHTML]="item.answer"></p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Contact CTA -->
        <div class="mt-16 text-center bg-gradient-to-br from-blue-900/20 to-zinc-900 p-8 rounded-3xl border border-blue-500/10">
          <h3 class="text-2xl font-bold text-white mb-2">¿No encontraste lo que buscabas?</h3>
          <p class="text-zinc-400 mb-6">Nuestro equipo de soporte está listo para ayudarte con cualquier duda específica.</p>
          <a href="/contact" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-600/20">
            <span>Contáctanos</span>
            <app-svg-icon name="arrow-back" width="20" height="20" class="rotate-180"></app-svg-icon>
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FaqComponent implements OnInit {
  private seoService = inject(SeoService);

  faqs = signal<FaqItem[]>([
    {
      id: 1,
      category: 'general',
      question: '¿Qué es DonMusica?',
      answer: 'DonMusica es una plataforma de streaming y descarga de música gratuita. Nos enfocamos en ofrecer un catálogo diverso de música sin copyright (Royalty Free) ideal para creadores de contenido, streamers y cualquier persona que necesite música de calidad sin preocupaciones legales.',
      isOpen: true
    },
    {
      id: 2,
      category: 'legal',
      question: '¿La música es realmente gratis y sin copyright?',
      answer: 'Sí. La sección de "Música Sin Copyright" contiene pistas que puedes usar gratuitamente en tus videos de YouTube, streams de Twitch, podcasts y redes sociales. Solo pedimos (aunque no siempre es obligatorio, es buena práctica) dar crédito al artista en la descripción de tu contenido.',
      isOpen: false
    },
    {
      id: 3,
      category: 'tecnico',
      question: '¿Cómo puedo descargar una canción?',
      answer: 'Es muy sencillo. Solo busca la canción que te gusta, haz clic en ella para abrir el reproductor y verás un botón de descarga (icono de flecha hacia abajo). Al hacer clic, la descarga comenzará automáticamente o se te darán opciones según el formato disponible.',
      isOpen: false
    },
    {
      id: 4,
      category: 'artistas',
      question: 'Soy artista, ¿puedo subir mi música?',
      answer: '¡Por supuesto! Nos encanta apoyar el talento nuevo. Ve a la sección de "Contacto" y selecciona el asunto "Soy Artista". Envíanos un enlace a tu demo o portafolio. Si tu música cumple con nuestros estándares de calidad, nos pondremos en contacto contigo para agregarla a la plataforma.',
      isOpen: false
    },
    {
      id: 5,
      category: 'tecnico',
      question: 'La música no se reproduce, ¿qué hago?',
      answer: 'Primero, verifica tu conexión a internet. Si usas un bloqueador de anuncios agresivo, intenta desactivarlo ya que algunos servicios de audio pueden verse afectados. Si el problema persiste, intenta recargar la página o borrar la caché de tu navegador. Si nada funciona, contáctanos reportando el problema.',
      isOpen: false
    },
    {
      id: 6,
      category: 'general',
      question: '¿Tienen aplicación móvil?',
      answer: 'DonMusica funciona como una PWA (Aplicación Web Progresiva). Esto significa que puedes instalarla directamente desde tu navegador (Chrome, Safari, Edge) en tu celular o PC sin necesidad de ir a una tienda de aplicaciones. Simplemente abre el menú de tu navegador y selecciona "Instalar aplicación" o "Agregar a pantalla de inicio".',
      isOpen: false
    }
  ]);

  ngOnInit() {
    this.seoService.setSeoData(
      'Preguntas Frecuentes (FAQ) - DonMusica',
      'Respuestas a las preguntas más comunes sobre DonMusica. Aprende sobre descargas, derechos de autor, cómo subir tu música y más.'
    );
  }

  toggleFaq(id: number) {
    this.faqs.update(items =>
      items.map(item =>
        item.id === id ? { ...item, isOpen: !item.isOpen } : { ...item, isOpen: false } // Close others (accordion style)
      )
    );
  }
}
