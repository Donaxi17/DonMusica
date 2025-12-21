import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../services/seo.service';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconComponent],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
        <!-- Background Gradients -->
        <div class="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-900/10 via-zinc-950/50 to-zinc-950 pointer-events-none z-0"></div>
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="absolute top-40 -left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
        <!-- Header -->
        <div class="text-center mb-12 md:mb-20">
          <div class="inline-flex p-4 bg-zinc-900/80 border border-zinc-800 rounded-full text-blue-400 mb-6 shadow-xl backdrop-blur-sm">
            <app-svg-icon name="envelope" width="40" height="40" class="text-blue-500"></app-svg-icon>
          </div>
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-zinc-500 bg-clip-text text-transparent tracking-tight">
            {{ languageService.get('contact.title') }}
          </h1>
          <p class="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {{ languageService.get('contact.subtitle') }}
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-8 md:gap-12">
          
          <!-- Contact Form -->
          <div class="bg-zinc-900/60 p-6 md:p-8 rounded-3xl border border-zinc-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">{{ languageService.get('contact.form.title') }}</h2>
            <p class="text-zinc-400 mb-8 text-sm">{{ languageService.get('contact.form.subtitle') }}</p>
            
            <form (submit)="submitForm(); $event.preventDefault()" class="space-y-5">
              <div class="grid md:grid-cols-2 gap-5">
                <div>
                    <label class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{{ languageService.get('contact.form.name') }}</label>
                    <input [(ngModel)]="formData.name" name="name" type="text" required [placeholder]="languageService.get('contact.form.name_placeholder')"
                    class="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-white placeholder-zinc-700">
                </div>
                <div>
                    <label class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                    <input [(ngModel)]="formData.email" name="email" type="email" required placeholder="tu@email.com"
                    class="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-white placeholder-zinc-700">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{{ languageService.get('contact.form.subject') }}</label>
                <select [(ngModel)]="formData.subject" name="subject" required
                  class="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-white">
                  <option value="">{{ languageService.get('contact.form.select_subject') }}</option>
                  <option value="general">Consulta General</option>
                  <option value="support">Soporte Técnico</option>
                  <option value="artist">Soy Artista</option>
                  <option value="business">Propuesta Comercial</option>
                  <option value="copyright">Derechos de Autor</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{{ languageService.get('contact.form.message') }}</label>
                <textarea [(ngModel)]="formData.message" name="message" required rows="5" [placeholder]="languageService.get('contact.form.message_placeholder')"
                  class="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-white placeholder-zinc-700 resize-none"></textarea>
              </div>

              <button type="submit"
                class="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 group-active:scale-[0.98]">
                <span>{{ languageService.get('contact.form.send') }}</span>
                <app-svg-icon name="send" width="20" height="20" class="text-blue-100"></app-svg-icon>
              </button>
            </form>
          </div>

          <!-- Contact Info & Quick Actions -->
          <div class="space-y-6">
            
            <!-- WhatsApp Card (Featured) -->
            <a href="https://wa.me/573017966272" target="_blank" 
               class="block bg-gradient-to-br from-green-900/20 to-zinc-900/60 p-6 rounded-3xl border border-green-500/20 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-900/20 group cursor-pointer relative overflow-hidden">
               <div class="absolute right-[-20px] top-[-20px] bg-green-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              <div class="flex items-center gap-5 relative z-10">
                <div class="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-900/30 group-hover:scale-110 transition-transform">
                  <app-svg-icon name="whatsapp" width="24" height="24" fill="white"></app-svg-icon>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white mb-1 group-hover:text-green-400 transition-colors">{{ languageService.get('contact.whatsapp.title') }}</h3>
                  <p class="text-zinc-400 text-xs">{{ languageService.get('contact.whatsapp.subtitle') }}</p>
                  <span class="text-green-500 font-mono text-xs mt-1 inline-block">+57 301 796 6272</span>
                </div>
                <div class="ml-auto">
                    <app-svg-icon name="chevron-right" class="text-green-500/50 group-hover:translate-x-1 transition-transform"></app-svg-icon>
                </div>
              </div>
            </a>

            <!-- Other Methods Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Location -->
                <div class="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                        <app-svg-icon name="map" class="text-blue-500"></app-svg-icon>
                    </div>
                    <h3 class="font-bold text-white text-sm">{{ languageService.get('contact.location.title') }}</h3>
                    <p class="text-zinc-500 text-xs mt-1">{{ languageService.get('contact.location.value') }}</p>
                </div>

                <!-- Schedule -->
                <div class="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                        <app-svg-icon name="time" class="text-purple-500"></app-svg-icon>
                    </div>
                    <h3 class="font-bold text-white text-sm">{{ languageService.get('contact.schedule.title') }}</h3>
                    <p class="text-zinc-500 text-xs mt-1">{{ languageService.get('contact.schedule.value') }}</p>
                </div>
            </div>

            <!-- Social Media -->
            <div class="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 text-center">
              <h3 class="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-5">{{ languageService.get('contact.follow_us') }}</h3>
              <div class="flex justify-center gap-3 md:gap-4">
                <a href="https://www.facebook.com/profile.php?id=61584603806092" target="_blank" class="w-10 h-10 md:w-12 md:h-12 bg-zinc-950 rounded-full flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-white hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1">
                  <app-svg-icon name="facebook" width="20" height="20" class="md:w-6 md:h-6"></app-svg-icon>
                </a>
                <a href="https://www.instagram.com/donmusica_app/" target="_blank" class="w-10 h-10 md:w-12 md:h-12 bg-zinc-950 rounded-full flex items-center justify-center text-zinc-400 hover:text-pink-500 hover:bg-white hover:shadow-lg hover:shadow-pink-500/20 transition-all transform hover:-translate-y-1">
                  <app-svg-icon name="instagram" width="20" height="20" class="md:w-6 md:h-6"></app-svg-icon>
                </a>
                <a href="https://www.tiktok.com/@naxiweb" target="_blank" class="w-10 h-10 md:w-12 md:h-12 bg-zinc-950 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 transition-all transform hover:-translate-y-1">
                  <app-svg-icon name="tiktok" width="18" height="18" class="md:w-[22px] md:h-[22px]"></app-svg-icon>
                </a>
                <a href="https://naxiweb.vercel.app/" target="_blank" class="w-10 h-10 md:w-12 md:h-12 bg-zinc-950 rounded-full flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-1">
                  <app-svg-icon name="globe" width="18" height="18" class="md:w-[22px] md:h-[22px]"></app-svg-icon>
                </a>
              </div>
            </div>

            <!-- FAQ Link (Clickable Container) -->
            <a href="/faq" class="bg-yellow-500/5 p-3 md:p-4 rounded-2xl border border-yellow-500/10 flex items-center gap-3 md:gap-4 hover:bg-yellow-500/10 transition-colors cursor-pointer group active:scale-[0.98]">
              <div class="shrink-0 text-yellow-500">
                <app-svg-icon name="info-circle" width="20" height="20" class="md:w-6 md:h-6"></app-svg-icon>
              </div>
              <div class="flex-1">
                <p class="text-yellow-200/60 text-[10px] md:text-xs uppercase tracking-wider font-bold mb-0.5">{{ languageService.get('contact.faq.pre') }}</p>
                <div class="text-white font-bold text-xs md:text-sm group-hover:underline flex items-center gap-1">
                    {{ languageService.get('contact.faq.title') }}
                    <app-svg-icon name="chevron-right" width="14" height="14" class="md:w-4 md:h-4 text-yellow-500/50 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all"></app-svg-icon>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
    `
})
export class ContactComponent implements OnInit {
  private seoService = inject(SeoService);
  private toastService = inject(ToastService);
  public languageService = inject(LanguageService);

  // Configuración para envío gratuito
  // Reemplaza esto con tu email real para recibir correos vía mailto
  private readonly MY_EMAIL = 'contacto@donmusica.online';
  private readonly WHATSAPP_NUMBER = '573001234567';

  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  ngOnInit() {
    this.seoService.setSeoData(
      'Contacto | DonMusica',
      'Contáctanos para cualquier consulta, soporte técnico, propuestas comerciales o información sobre DonMusica.'
    );
  }

  submitForm() {
    if (!this.formData.name || !this.formData.email || !this.formData.subject || !this.formData.message) {
      this.toastService.warning(this.languageService.get('contact.toast.fill_all'));
      return;
    }

    // Método 1: Mailto (Gratis, Sin Backend, Abre cliente de correo)
    // Esto garantiza que el correo te llegue, ya que el usuario lo envía desde SU propia cuenta.
    const subject = encodeURIComponent(`[${this.formData.subject.toUpperCase()}] Mensaje de ${this.formData.name}`);
    const body = encodeURIComponent(
      `Hola DonMusica,

Soy ${this.formData.name} (${this.formData.email}).

Asunto: ${this.formData.subject}

Mensaje:
${this.formData.message}

Enviado desde el formulario web.`
    );

    // Abrir cliente de correo
    window.location.href = `mailto:${this.MY_EMAIL}?subject=${subject}&body=${body}`;

    // Reset form
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}
