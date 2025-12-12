import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RedesSocialesComponent } from './components/redes-sociales/redes-sociales.component';
import { ToastContainerComponent } from './components/shared/toast-container/toast-container.component';
import { inject } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'DonMusica';

  ngOnInit() {
    inject();
    this.loadAdsterraSocialBar();
  }

  private loadAdsterraSocialBar() {
    // Delay 20 seconds for everyone on entry
    setTimeout(() => {
      try {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//pl28232772.effectivegatecpm.com/bf/3b/e2/bf3be2c66537a0c5cca838fe602a1be1.js';
        script.defer = true;
        document.head.appendChild(script);
        console.log('✅ Adsterra Social Bar loaded after 20s delay');
      } catch (e) {
        console.error('Error loading Adsterra script', e);
      }
    }, 20000); // 20 seconds
  }
}
