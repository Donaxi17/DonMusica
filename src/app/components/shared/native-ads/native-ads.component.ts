import { Component, Input, OnInit, AfterViewInit, OnChanges, SimpleChanges, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DonMusicaProService } from '../../../services/don-musica-pro.service';

@Component({
  selector: 'app-native-ads',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (proService.shouldShowAds()) {
      <div class="w-full flex justify-center items-center overflow-hidden"
           [class.py-8]="!noPadding && hasAdContent && !adFailed" 
           [style.height]="(hasAdContent && !adFailed) ? height : '0'"
           [style.opacity]="(hasAdContent && !adFailed) ? '1' : '0'"
           [style.transition]="'all 0.5s ease-in-out'"
           [style.margin]="(hasAdContent && !adFailed) ? '' : '0'"
           [style.padding]="(hasAdContent && !adFailed) ? '' : '0'"
           role="complementary">
        
        <div class="w-full h-full flex justify-center">
          <iframe #adFrame
                  title="Publicidad"
                  class="w-full h-full border-none"
                  style="background: transparent;"
                  scrolling="no">
          </iframe>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.8s ease-out forwards;
    }
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class NativeAdsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() noPadding: boolean = true;
  @Input() height: string = 'auto';
  @Input() region: string = '';

  @ViewChild('adFrame') set adFrameSetter(content: ElementRef<HTMLIFrameElement>) {
    if (content && this.isBrowser) {
      this.adFrame = content;
      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => this.injectAd(), 150);
    }
  }
  adFrame!: ElementRef<HTMLIFrameElement>;

  isBrowser: boolean;
  hasAdContent: boolean = false;
  adFailed: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    public proService: DonMusicaProService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Listen for messages from the iframe
    if (this.isBrowser) {
      window.addEventListener('message', (event) => {
        if (event.data === 'ad_failed_native') {
          this.adFailed = true;
          this.hasAdContent = false;
        }
      });

      // Detectar cuando se pierde/recupera la conexión
      window.addEventListener('offline', () => {
        this.adFailed = true;
        this.hasAdContent = false;
      });

      window.addEventListener('online', () => {
        // Reintentar cargar el anuncio si vuelve la conexión
        if (this.adFailed && this.adFrame) {
          this.adFailed = false;
          setTimeout(() => this.injectAd(), 100);
        }
      });
    }
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isBrowser && changes['region'] && !changes['region'].isFirstChange()) {
      if (this.proService.shouldShowAds()) {
        setTimeout(() => this.injectAd(), 100);
      }
    }
  }

  ngAfterViewInit() {
    // La inyección se maneja ahora por el setter de ViewChild
  }

  ngOnDestroy() {
    // Limpieza si es necesaria
  }

  private injectAd() {
    // No mostrar anuncios si no hay internet
    if (this.isBrowser && !navigator.onLine) {
      this.adFailed = true;
      this.hasAdContent = false;
      return;
    }

    const iframe = this.adFrame.nativeElement;
    const doc = iframe.contentWindow?.document || iframe.contentDocument;

    if (doc) {
      const adHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                overflow: hidden; 
                background: transparent !important; 
                width: 100%;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white !important;
                font-family: sans-serif;
              }
              #container-e4e25c107fdc96e794b513ea7c8e2e97 { 
                width: 100% !important; 
              }
              /* Force white text but be careful with backgrounds to not hide images */
              body {
                background-color: #09090b !important;
              }
              * { 
                color: white !important; 
                border-color: rgba(255,255,255,0.1) !important;
              }
              /* Target only common card/container classes for dark background */
              .ad-unit, .ads-container, [class*="ad"], .card, .container, .main, .content-wrapper {
                background-color: #09090b !important;
              }
              img {
                background-color: transparent !important;
              }
            </style>
          </head>
          <body>
            <div id="container-e4e25c107fdc96e794b513ea7c8e2e97"></div>
            <script async="async" data-cfasync="false" 
                    src="https://pl28211149.effectivegatecpm.com/e4e25c107fdc96e794b513ea7c8e2e97/invoke.js"
                    onerror="window.parent.postMessage('ad_failed_native', '*')"></script>
          </body>
        </html>
      `;

      doc.open();
      doc.write(adHtml);
      doc.close();

      // Mostrar el espacio inmediatamente
      this.hasAdContent = true;
    }
  }
}
