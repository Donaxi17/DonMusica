import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RedesSocialesComponent } from './components/redes-sociales/redes-sociales.component';
import { ToastContainerComponent } from './components/shared/toast-container/toast-container.component';
import { ProModalComponent } from './components/shared/pro-modal/pro-modal.component';
import { inject } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ProModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'DonMusica';

  ngOnInit() {
    inject();
    this.loadAdsterraSocialBar();
    this.trackPwaInstallation();
  }

  private trackPwaInstallation() {
    if (typeof window === 'undefined') return;

    // Track when the install prompt appears
    window.addEventListener('beforeinstallprompt', (e) => {
      // @ts-ignore
      window.gtag?.('event', 'pwa_install_available', {
        event_category: 'PWA',
        event_label: 'Prompt shown'
      });
    });

    // Track when the app is successfully installed
    window.addEventListener('appinstalled', (e) => {
      // @ts-ignore
      window.gtag?.('event', 'app_installed', {
        event_category: 'PWA',
        event_label: 'Installation successful',
        value: 1
      });
      console.log('DonMusic was installed');
    });
  }

  private loadAdsterraSocialBar() {
    // Delay 20 seconds for everyone on entry
    // setTimeout(() => {
    //   try {
    //     const script = document.createElement('script');
    //     script.type = 'text/javascript';
    //     script.src = '//pl28232772.effectivegatecpm.com/bf/3b/e2/bf3be2c66537a0c5cca838fe602a1be1.js';
    //     script.defer = true;
    //     document.head.appendChild(script);
    //   } catch (e) {
    //     console.error('Error loading Adsterra script', e);
    //   }
    // }, 40000); // 40 seconds
  }
}
