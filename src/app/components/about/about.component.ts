import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      <!-- Ambient Background Effects -->
      <div class="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/05 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/05 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
        
        <!-- Header Section -->
        <div class="text-center mb-20 animate-fade-in-up">
          <!-- Logo -->
          <div class="relative inline-block mb-8">
            <div class="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
            <img src="/assets/icons/icon-512x512.png" alt="DonMusica Logo" 
                 class="relative w-28 h-28 object-cover rounded-full shadow-2xl animate-float mx-auto border-4 border-zinc-900 ring-2 ring-emerald-500/30">
          </div>
          
          <h1 class="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
            Don<span class="text-emerald-400">Musica</span>
          </h1>
          
          <p class="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
            Conectando pasiones, una canción a la vez.
          </p>
        </div>

        <!-- Misión & Visión Section -->
        <section class="mb-20 animate-fade-in-up animation-delay-100">
          <div class="grid md:grid-cols-2 gap-6 mb-10">
            <!-- Misión -->
            <div class="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-colors relative overflow-hidden group">
               <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
               </div>
               <div class="relative z-10">
                 <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                   <span class="w-8 h-1 bg-emerald-500 rounded-full"></span>
                   Misión
                 </h2>
                 <p class="text-zinc-300 leading-relaxed text-justify">
                   Democratizar el acceso a la música de alta calidad, proporcionando una plataforma intuitiva y poderosa donde artistas emergentes puedan ser escuchados y los oyentes disfruten sin límites.
                 </p>
               </div>
            </div>

            <!-- Visión -->
            <div class="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-colors relative overflow-hidden group">
               <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
               </div>
               <div class="relative z-10">
                 <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                   <span class="w-8 h-1 bg-blue-500 rounded-full"></span>
                   Visión
                 </h2>
                 <p class="text-zinc-300 leading-relaxed text-justify">
                   Ser la plataforma de referencia en Latinoamérica para la música independiente y comercial, reconocida por nuestra innovación tecnológica y compromiso inquebrantable con la comunidad artística.
                 </p>
               </div>
            </div>
          </div>
          
          <!-- Texto Explicativo Extra -->
          <div class="p-8 md:p-12 bg-gradient-to-r from-zinc-900 to-zinc-800/50 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
             <!-- Decorative -->
             <div class="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
             
             <div class="relative z-10 max-w-4xl mx-auto text-center md:text-left space-y-6">
                <h3 class="text-3xl font-bold text-white mb-6">Nuestro Compromiso</h3>
                
                <p class="text-zinc-300 text-lg leading-relaxed">
                    En un mundo digital saturado de algoritmos invasivos y suscripciones complejas, <strong>DonMusica</strong> nace como una respuesta honesta: volver a lo esencial. No creemos en cajas negras que deciden tu gusto musical por ti; creemos en herramientas transparentes que te empoderan para <strong>explorar, curar y redescubrir</strong> tu propia banda sonora personal.
                </p>

                <p class="text-zinc-300 text-lg leading-relaxed">
                    Más allá de ser solo un reproductor, nos comprometemos a ofrecer una experiencia libre de distracciones, donde la calidad de audio no sea un lujo reservado para pocos, sino el estándar para todos. Desde la capacidad de llevar tu biblioteca a cualquier rincón del mundo <strong>sin conexión</strong>, hasta utilidades profesionales pensadas para músicos, cada función está diseñada con un propósito claro: libertad absoluta.
                </p>

                <p class="text-zinc-300 text-lg leading-relaxed">
                    Defendemos firmemente que la tecnología debe ser un puente, no una barrera, entre el artista y su audiencia. Trabajamos incansablemente para eliminar la fricción técnica, asegurando que lo único que importe sea la emoción pura de la próxima canción. Porque en DonMusica, entendemos que la música no es solo contenido de fondo; es la banda sonora de tu vida, y merece ser vivida bajo tus propios términos.
                </p>
             </div>
          </div>
        </section>

        <!-- Features Grid -->
        <section class="mb-20">
          <div class="text-center mb-10">
            <h2 class="text-2xl font-bold text-white">¿Por qué DonMusica?</h2>
          </div>
          
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Offline -->
            <div routerLink="/offline-music" class="p-6 bg-zinc-900/20 rounded-2xl border border-white/5 text-center select-none cursor-pointer hover:bg-zinc-800/40 hover:border-emerald-500/30 transition-all group">
              <div class="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-emerald-400 mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 class="font-bold text-white mb-2">Modo Offline</h3>
              <p class="text-sm text-zinc-400">Lleva tu música a donde vayas.</p>
            </div>

            <!-- Tools -->
            <div routerLink="/tools" class="p-6 bg-zinc-900/20 rounded-2xl border border-white/5 text-center select-none cursor-pointer hover:bg-zinc-800/40 hover:border-purple-500/30 transition-all group">
              <div class="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-purple-400 mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                   <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
              </div>
              <h3 class="font-bold text-white mb-2">Herramientas</h3>
              <p class="text-sm text-zinc-400">Utilidades para músicos.</p>
            </div>

            <!-- Lyrics -->
            <div routerLink="/browse/lyrics" class="p-6 bg-zinc-900/20 rounded-2xl border border-white/5 text-center select-none cursor-pointer hover:bg-zinc-800/40 hover:border-blue-500/30 transition-all group">
              <div class="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-blue-400 mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="font-bold text-white mb-2">Letras</h3>
              <p class="text-sm text-zinc-400">Canta en tiempo real.</p>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <div class="text-center">
             <a routerLink="/" class="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
                <span>Comenzar ahora</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
             </a>
        </div>

        <div class="mt-16 text-center text-zinc-600 text-xs">
           <p>&copy; 2025 DonMusica. Todos los derechos reservados.</p>
        </div>

      </div>
    </div>
    
    <style>
      .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
        opacity: 0;
      }
      .animation-delay-100 {
        animation-delay: 0.1s;
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      .animate-float {
        animation: float 5s ease-in-out infinite;
      }
    </style>
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
