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

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.mobileContainerId = `mobile-ad-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnInit() {
    // Determine IDs
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.loadDesktopScript(); // Ensure global script is loaded
      this.renderMobileAd();    // Render local mobile ad
    }
  }

  private loadDesktopScript() {
    // Force re-execution for SPA: Remove existing script first
    const existingScript = document.getElementById('adsterra-native-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'adsterra-native-script';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl28211149.effectivegatecpm.com/e4e25c107fdc96e794b513ea7c8e2e97/invoke.js';
    document.body.appendChild(script);
  }

  private renderMobileAd() {
    setTimeout(() => {
      const container = document.getElementById(this.mobileContainerId);
      if (container && !container.hasChildNodes()) {
        const iframe = document.createElement('iframe');
        iframe.style.width = '300px';
        iframe.style.height = '250px';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.scrolling = 'no';

        container.appendChild(iframe);

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;">
                <script type="text/javascript">
                    atOptions = {
                        'key' : '86a458b43e1e497bc27895c8fcc41c3a',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                    };
                </script>
                <script type="text/javascript" src="//www.highperformanceformat.com/86a458b43e1e497bc27895c8fcc41c3a/invoke.js"></script>
            </body>
            </html>
          `);
          doc.close();
        }
      }
    }, 1000 + (this.index * 500)); // Stagger loading if multiple ads
  }
}
