import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-ads-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ads-container.component.html',
  styleUrl: './ads-container.component.css' // We will add the CSS rule here later
})
export class AdsContainerComponent implements OnInit, AfterViewInit {
  @Input() index: number = 0; // To generate unique IDs if multiple ads on page
  @Input() forceIframe: boolean = false; // Force iframe version (useful for multiple ads or modals)

  isBrowser: boolean;
  mobileContainerId: string = '';
  desktopContainerId: string = '';

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    const uniqueId = Math.random().toString(36).substr(2, 9);
    this.mobileContainerId = `mobile-ad-${uniqueId}`;
    this.desktopContainerId = `desktop-ad-${uniqueId}`;
  }

  ngOnInit() {
    // Determine IDs
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.renderResponsiveAd();
    }
  }

  private renderResponsiveAd() {
    setTimeout(() => {
      // Usamos el ID del móvil como contenedor genérico (o desktopContainerId si prefieres separar, pero simplificaremos)
      // En el HTML, asegurémonos de tener un contenedor limpio.
      // Por simplicidad, usaremos 'mobileContainerId' como el target dinámico para ambos casos, 
      // ya que el HTML tiene un div genérico.

      const container = document.getElementById(this.mobileContainerId);
      if (container && !container.hasChildNodes()) {
        const width = window.innerWidth;
        const isDesktop = width >= 768;

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
                    <script type="text/javascript">
                        atOptions = {
                            'key' : '384fd7d27e0b8060c76b6c30dcffa0bf',
                            'format' : 'iframe',
                            'height' : 90,
                            'width' : 728,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" src="//www.highperformanceformat.com/384fd7d27e0b8060c76b6c30dcffa0bf/invoke.js"></script>
                </body>
                </html>
            `;
        } else {
          // MOBILE: 320x50
          iframe.style.width = '320px';
          iframe.style.height = '50px';
          adContent = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;">
                    <script type="text/javascript">
                        atOptions = {
                            'key' : '1f663241402f759e860c199f9a9fc0c3',
                            'format' : 'iframe',
                            'height' : 50,
                            'width' : 320,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" src="//www.highperformanceformat.com/1f663241402f759e860c199f9a9fc0c3/invoke.js"></script>
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
        }
      }
    }, Math.min(500 + (Math.abs(this.index) * 100), 2000));
  }
}
