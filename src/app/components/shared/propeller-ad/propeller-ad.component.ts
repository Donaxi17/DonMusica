import { Component, Input, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-propeller-ad',
    standalone: true,
    template: `
    <div [id]="adId" class="propeller-ad-container"></div>
  `,
    styles: [`
    .propeller-ad-container {
      min-height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px 0;
    }
  `]
})
export class PropellerAdComponent implements AfterViewInit {
    @Input() adId: string = 'propeller-ad-' + Math.random().toString(36).substring(7);
    @Input() zoneId: string = ''; // Lo obtendrás después del registro

    private platformId = inject(PLATFORM_ID);

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId) && this.zoneId) {
            this.loadPropellerAd();
        }
    }

    private loadPropellerAd() {
        // Script se cargará cuando tengas el zone ID de PropellerAds
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = `//www.profitabledisplaynetwork.com/${this.zoneId}/invoke.js`;

        const container = document.getElementById(this.adId);
        if (container) {
            container.appendChild(script);
        }
    }
}
