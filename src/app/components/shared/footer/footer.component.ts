import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, SvgIconComponent],
  template: `
    <footer class="bg-black border-t border-zinc-900 pt-10 pb-24 md:pb-8 px-6 md:px-12 mt-auto">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          <!-- Brand -->
          <div class="col-span-1 md:col-span-1 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <app-svg-icon name="music" width="20" height="20" class="text-white"></app-svg-icon>
              </div>
              <span class="text-xl font-bold text-white tracking-tight">DonMusica</span>
            </div>
            <p class="text-zinc-500 text-xs md:text-sm leading-relaxed mb-6">
              {{ languageService.get('footer.description') }}
            </p>
            <div class="flex gap-4 justify-center md:justify-start">
              <a href="https://www.facebook.com/profile.php?id=61584603806092" target="_blank" 
                 class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-white hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1">
                <app-svg-icon name="facebook" width="20" height="20"></app-svg-icon>
              </a>
              <a href="https://www.instagram.com/donmusica_app/" target="_blank" 
                 class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-pink-500 hover:bg-white hover:shadow-lg hover:shadow-pink-500/20 transition-all transform hover:-translate-y-1">
                <app-svg-icon name="instagram" width="20" height="20"></app-svg-icon>
              </a>
              <a href="https://www.tiktok.com/@naxiweb" target="_blank" 
                 class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 transition-all transform hover:-translate-y-1">
                <app-svg-icon name="tiktok" width="18" height="18"></app-svg-icon>
              </a>
              <a href="https://naxiweb.vercel.app/" target="_blank" 
                 class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-1">
                <app-svg-icon name="globe" width="18" height="18"></app-svg-icon>
              </a>
            </div>
          </div>

          <!-- Links 1 -->
          <div class="text-center md:text-left">
            <h4 class="text-white font-bold mb-4 md:mb-6">{{ languageService.get('footer.discover') }}</h4>
            <ul class="space-y-2 md:space-y-3 text-xs md:text-sm text-zinc-500">
              <li><a routerLink="/browse/trends" class="hover:text-emerald-400 transition-colors">{{ languageService.get('home.section.trends') }}</a></li>
              <li><a routerLink="/browse/new-releases" class="hover:text-emerald-400 transition-colors">{{ languageService.get('common.new') }}</a></li>
              <li><a routerLink="/browse/charts" class="hover:text-emerald-400 transition-colors">{{ languageService.get('footer.rankings') }}</a></li>
              <li><a routerLink="/artists" class="hover:text-emerald-400 transition-colors">{{ languageService.get('nav.artists') }}</a></li>
            </ul>
          </div>

          <!-- Links 2 -->
          <div class="text-center md:text-left">
            <h4 class="text-white font-bold mb-4 md:mb-6">{{ languageService.get('footer.community') }}</h4>
            <ul class="space-y-2 md:space-y-3 text-xs md:text-sm text-zinc-500">
              <li><a routerLink="/blog" class="hover:text-emerald-400 transition-colors">{{ languageService.get('home.blog_detailed.title_part1') }}</a></li>
              <li><a routerLink="/about" class="hover:text-emerald-400 transition-colors">{{ languageService.get('footer.about') }}</a></li>
              <li><a routerLink="/contact" class="hover:text-emerald-400 transition-colors">{{ languageService.get('home.contact.title') }}</a></li>
              <li><a routerLink="/ads" class="hover:text-emerald-400 transition-colors">Ads</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div class="text-center md:text-left">
            <h4 class="text-white font-bold mb-4 md:mb-6">{{ languageService.get('footer.legal') }}</h4>
            <ul class="space-y-2 md:space-y-3 text-xs md:text-sm text-zinc-500">
              <li><a routerLink="/privacy" class="hover:text-emerald-400 transition-colors">{{ languageService.get('footer.privacy') }}</a></li>
              <li><a routerLink="/terms" class="hover:text-emerald-400 transition-colors">{{ languageService.get('footer.terms') }}</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p class="text-zinc-600 text-xs md:text-sm">
            {{ languageService.get('footer.rights') }}
          </p>
          <div class="flex items-center gap-2 text-zinc-600 text-xs md:text-sm">
            <span>{{ languageService.get('footer.made_with') }}</span>
            <a routerLink="/games" class="hover:scale-125 transition-transform">
              <app-svg-icon name="heart-filled" width="16" height="16" class="text-red-500"></app-svg-icon>
            </a>
            <span>{{ languageService.get('footer.in_colombia') }}</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  languageService = inject(LanguageService);
}
