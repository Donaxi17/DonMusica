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
  }
}
