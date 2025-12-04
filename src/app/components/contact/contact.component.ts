import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../services/seo.service';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-zinc-950 text-white py-12 px-4 md:px-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <div class="inline-flex p-4 bg-blue-500/10 rounded-full text-blue-400 mb-6">
            <i class='bx bx-envelope text-4xl'></i>
          </div>
          <h1 class="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-zinc-400 bg-clip-text text-transparent">
            Contáctanos
          </h1>
          <p class="text-xl text-zinc-400 max-w-2xl mx-auto">
            ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ti.
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-12">
          <!-- Contact Form -->
          <div class="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
            <h2 class="text-2xl font-bold text-white mb-6">Envíanos un Mensaje</h2>
            <form (submit)="submitForm(); $event.preventDefault()" class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Nombre Completo *
                </label>
                <input
                  [(ngModel)]="formData.name"
                  name="name"
                  type="text"
                  required
                  placeholder="Tu nombre"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-white placeholder-zinc-600">
              </div>

              <div>
                <label class="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Email *
                </label>
                <input
                  [(ngModel)]="formData.email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu&#64;email.com"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-white placeholder-zinc-600">
              </div>

              <div>
                <label class="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Asunto *
                </label>
                <select
                  [(ngModel)]="formData.subject"
                  name="subject"
                  required
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-white">
                  <option value="">Selecciona un asunto</option>
                  <option value="general">Consulta General</option>
                  <option value="support">Soporte Técnico</option>
                  <option value="artist">Soy Artista</option>
                  <option value="business">Propuesta Comercial</option>
                  <option value="copyright">Derechos de Autor</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Mensaje *
                </label>
                <textarea
                  [(ngModel)]="formData.message"
                  name="message"
                  required
                  rows="6"
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-white placeholder-zinc-600 resize-none"></textarea>
              </div>

              <button
                type="submit"
                class="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                <span>Enviar Mensaje</span>
                <i class='bx bx-send'></i>
              </button>

              <p class="text-xs text-zinc-500 text-center">
                * Todos los campos son obligatorios. Responderemos en un plazo de 24-48 horas.
              </p>
            </form>
          </div>

          <!-- Contact Info -->
          <div class="space-y-6">
            <!-- Contact Cards -->
            <div class="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                  <i class='bx bx-envelope text-2xl'></i>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white mb-2">Email</h3>
                  <p class="text-zinc-400 mb-2">Contáctanos por correo electrónico</p>
                  <a href="mailto:contacto&#64;donmusica.com" class="text-emerald-400 hover:underline">
                    contacto&#64;donmusica.com
                  </a>
                </div>
              </div>
            </div>

            <div class="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400">
                  <i class='bx bxl-whatsapp text-2xl'></i>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white mb-2">WhatsApp</h3>
                  <p class="text-zinc-400 mb-2">Chatea con nosotros</p>
                  <a href="https://wa.me/573001234567" target="_blank" class="text-green-400 hover:underline">
                    +57 300 123 4567
                  </a>
                </div>
              </div>
            </div>

            <div class="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                  <i class='bx bx-map text-2xl'></i>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white mb-2">Ubicación</h3>
                  <p class="text-zinc-400">
                    Bogotá, Colombia<br>
                    América Latina
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                  <i class='bx bx-time-five text-2xl'></i>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white mb-2">Horario de Atención</h3>
                  <p class="text-zinc-400">
                    Lunes a Viernes: 9:00 AM - 6:00 PM (COT)<br>
                    Sábados: 10:00 AM - 2:00 PM (COT)
                  </p>
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div class="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-blue-500/20">
              <h3 class="text-lg font-bold text-white mb-4">Síguenos en Redes Sociales</h3>
              <div class="flex gap-3">
                <a href="#" class="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition-all">
                  <i class='bx bxl-facebook text-2xl'></i>
                </a>
                <a href="#" class="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition-all">
                  <i class='bx bxl-twitter text-2xl'></i>
                </a>
                <a href="#" class="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-pink-400 hover:bg-zinc-800 transition-all">
                  <i class='bx bxl-instagram text-2xl'></i>
                </a>
                <a href="#" class="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all">
                  <i class='bx bxl-youtube text-2xl'></i>
                </a>
              </div>
            </div>

            <!-- FAQ Link -->
            <div class="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 text-center">
              <i class='bx bx-help-circle text-4xl text-yellow-400 mb-3'></i>
              <h3 class="text-lg font-bold text-white mb-2">¿Tienes Preguntas Frecuentes?</h3>
              <p class="text-zinc-400 text-sm mb-4">
                Revisa nuestra sección de preguntas frecuentes antes de contactarnos
              </p>
              <a href="/blog" class="text-emerald-400 hover:underline font-medium">
                Ver Preguntas Frecuentes →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent implements OnInit {
    private seoService = inject(SeoService);

    formData = {
        name: '',
        email: '',
        subject: '',
        message: ''
    };

    ngOnInit() {
        this.seoService.setSeoData(
            'Contacto - DonMusica | Estamos Aquí para Ayudarte',
            'Contáctanos para cualquier consulta, soporte técnico, propuestas comerciales o información sobre DonMusica. Responderemos en 24-48 horas.'
        );
    }

    submitForm() {
        if (!this.formData.name || !this.formData.email || !this.formData.subject || !this.formData.message) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        console.log('Contact form submitted:', this.formData);
        alert('¡Gracias por contactarnos! Recibiremos tu mensaje y te responderemos pronto.');

        // Reset form
        this.formData = {
            name: '',
            email: '',
            subject: '',
            message: ''
        };
    }
}
