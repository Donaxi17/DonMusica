import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RedesSocialesComponent } from './components/redes-sociales/redes-sociales.component';
import { ToastContainerComponent } from './components/shared/toast-container/toast-container.component';
import { ProModalComponent } from './components/shared/pro-modal/pro-modal.component';
import { inject as vercelInject } from '@vercel/analytics';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ToastService } from './services/toast.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ProModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'DonMusica';

  // ==========================================
  // 🚩 BANDERA DE ACTUALIZACIÓN
  // ==========================================
  // true  -> Muestra mensajes de "Nueva versión" y "Actualización exitosa"
  // false -> Las actualizaciones serán silenciosas (ideal para cambios pequeños)
  private readonly SHOW_UPDATE_NOTIFICATIONS = false;
  // ==========================================

  private swUpdate = inject(SwUpdate);
  private toastService = inject(ToastService);

  ngOnInit() {
    vercelInject();
    this.loadAdsterraSocialBar();
    this.trackPwaInstallation();
    this.checkForUpdates();
    this.checkIfJustUpdated();
  }

  private checkIfJustUpdated() {
    if (typeof window !== 'undefined' && localStorage.getItem('donmusic_pending_update') === 'true') {
      // Solo mostrar si la bandera está activa
      if (this.SHOW_UPDATE_NOTIFICATIONS) {
        setTimeout(() => {
          this.toastService.success('¡DonMusica se ha actualizado correctamente!', 5000);
          localStorage.removeItem('donmusic_pending_update');
        }, 3000);
      } else {
        localStorage.removeItem('donmusic_pending_update');
      }
    }
  }

  private checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const message = isMobile
          ? '¡Nueva versión disponible! Toca para actualizar.'
          : '¡Nueva versión disponible! Haz clic para actualizar.';

        localStorage.setItem('donmusic_pending_update', 'true');

        // Activamos la actualización en segundo plano para que el próximo reload sea instantáneo
        this.swUpdate.activateUpdate().then(() => {
          if (this.SHOW_UPDATE_NOTIFICATIONS) {
            this.toastService.info(message, 10000);
          }
        });
      });
    }
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
