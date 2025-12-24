import { Component, Input, OnInit, AfterViewInit, OnChanges, SimpleChanges, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DonMusicaProService } from '../../../services/don-musica-pro.service';

@Component({
  selector: 'app-native-ads',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full flex justify-center items-center"
         [class.py-8]="!noPadding" 
         [style.height]="height"
         role="complementary">
      
      <div class="w-full h-full flex justify-center overflow-hidden rounded-2xl bg-zinc-900/30 border border-white/5">
        <iframe #adFrame
                title="Publicidad"
                class="w-full h-full border-none"
                style="background: transparent;"
                scrolling="no">
        </iframe>
      </div>
      
    </div>
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

  @ViewChild('adFrame') adFrame!: ElementRef<HTMLIFrameElement>;

  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private proService: DonMusicaProService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
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
    if (this.isBrowser && this.proService.shouldShowAds()) {
      setTimeout(() => this.injectAd(), 100);
    }
  }

  private injectAd() {
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
            <script async="async" data-cfasync="false" src="https://pl28211149.effectivegatecpm.com/e4e25c107fdc96e794b513ea7c8e2e97/invoke.js"></script>
          </body>
        </html>
      `;

      doc.open();
      doc.write(adHtml);
      doc.close();
    }
  }
}
