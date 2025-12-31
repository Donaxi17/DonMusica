import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redes-sociales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './redes-sociales.component.html',
  styleUrl: './redes-sociales.component.css'
})
export class RedesSocialesComponent {
  router = inject(Router);

  isTunerRoute(): boolean {
    return this.router.url.includes('/tuner');
  }
}
