import { Component, Input, OnInit, AfterViewInit, OnChanges, OnDestroy, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DonMusicaProService } from '../../../services/don-musica-pro.service';

@Component({
  selector: 'app-ads-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ads-container.component.html',
  styleUrl: './ads-container.component.css'
})
export class AdsContainerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() index: number = 0; // To generate unique IDs if multiple ads on page
  @Input() forceIframe: boolean = false; // Force iframe version (useful for multiple ads or modals)
  @Input() smallOnly: boolean = false; // Force 320x50 format (useful for sidebars/history)
  @Input() noPadding: boolean = false; // Disable default padding
  @Input() region: string = ''; // Input to trigger refresh on country change

  isBrowser: boolean;
  mobileContainerId: string = '';
  desktopContainerId: string = '';
  hasAdContent: boolean = false;
  adFailed: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    public proService: DonMusicaProService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    const uniqueId = Math.random().toString(36).substr(2, 9);
    this.mobileContainerId = `mobile-ad-${uniqueId}`;
    this.desktopContainerId = `desktop-ad-${uniqueId}`;

    if (this.isBrowser) {
      window.addEventListener('message', (event) => {
        if (event.data === 'ad_failed_banner') {
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
        if (this.adFailed) {
          this.adFailed = false;
          setTimeout(() => this.renderResponsiveAd(), 100);
        }
      });
    }
  }

  ngOnInit() {
    // Determine IDs
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isBrowser && changes['region'] && !changes['region'].isFirstChange()) {
      const container = document.getElementById(this.mobileContainerId);
      if (container) {
        container.innerHTML = ''; // Force clear
        setTimeout(() => this.renderResponsiveAd(), 100);
      }
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      if (this.proService.shouldShowAds()) {
        this.renderResponsiveAd();
      }
    }
  }

  ngOnDestroy() {
    // Limpieza si es necesaria
  }

  private renderResponsiveAd() {
    // No mostrar anuncios si no hay internet
    if (this.isBrowser && !navigator.onLine) {
      this.adFailed = true;
      this.hasAdContent = false;
      return;
    }

    setTimeout(() => {
      // Usamos el ID del móvil como contenedor genérico
      const container = document.getElementById(this.mobileContainerId);
      if (container && !container.hasChildNodes()) {
        const width = window.innerWidth;
        const isDesktop = width >= 768 && !this.smallOnly;

        const iframe = document.createElement('iframe');
        iframe.title = 'Anuncio publicitario';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.scrolling = 'no';

        let adContent = '';

        if (isDesktop) {
          // PC: 728x90
          iframe.style.width = '728px';
          iframe.style.height = '90px';
          adContent = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;">
                    <div id="ad-container-desktop"></div>
                    <script type="text/javascript">
                        atOptions = {
                            'key' : '384fd7d27e0b8060c76b6c30dcffa0bf',
                            'format' : 'iframe',
                            'height' : 90,
                            'width' : 728,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" 
                            src="//www.highperformanceformat.com/384fd7d27e0b8060c76b6c30dcffa0bf/invoke.js"
                            onerror="window.parent.postMessage('ad_failed_banner', '*')"></script>
                </body>
                </html>
            `;
        } else {
          // MOBILE: 320x50
          iframe.style.width = '320px';
          iframe.style.height = '50px';
          iframe.style.transform = 'scale(0.95)';
          iframe.style.transformOrigin = 'center';
          adContent = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;">
                    <div id="ad-container-mobile"></div>
                    <script type="text/javascript">
                        atOptions = {
                            'key' : '1f663241402f759e860c199f9a9fc0c3',
                            'format' : 'iframe',
                            'height' : 50,
                            'width' : 320,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" 
                            src="//www.highperformanceformat.com/1f663241402f759e860c199f9a9fc0c3/invoke.js"
                            onerror="window.parent.postMessage('ad_failed_banner', '*')"></script>
                </body>
                </html>
            `;
        }

        container.appendChild(iframe);

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(adContent);
          doc.close();



          // Mostrar el espacio inmediatamente
          this.hasAdContent = true;
        }
      }
    }, Math.min(500 + (Math.abs(this.index) * 100), 2000));
  }
}
