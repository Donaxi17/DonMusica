import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-no-connection',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col items-center justify-center py-16 px-4">
      <!-- Icon -->
      <div class="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border-2 border-zinc-800 relative">
        <!-- WiFi Icon with X -->
        <svg class="w-10 h-10 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 6c3.537 0 6.837 1.353 9.293 3.809l1.414-1.414C19.874 5.561 16.071 4 12 4c-4.071.001-7.874 1.561-10.707 4.395l1.414 1.414C5.163 7.353 8.463 6 12 6zm5.671 8.307c-3.074-3.074-8.268-3.074-11.342 0l1.414 1.414c2.307-2.307 6.207-2.307 8.514 0l1.414-1.414z"/>
          <path d="M20.437 11.293c-4.572-4.574-12.301-4.574-16.873 0l1.414 1.414c3.807-3.807 10.238-3.807 14.045 0l1.414-1.414z"/>
        </svg>
        <!-- Red X overlay -->
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
      </div>
      
      <!-- Title -->
      <h3 class="text-xl font-bold text-zinc-300 mb-2">Sin conexión a internet</h3>
      
      <!-- Message -->
      <p class="text-sm text-zinc-500 text-center max-w-md mb-6">
        Necesitas conexión a internet para ver este contenido. 
        Por favor, verifica tu WiFi o datos móviles.
      </p>
      
      <!-- Retry Button -->
      <button 
        (click)="retry()"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z"/>
        </svg>
        Reintentar
      </button>
    </div>
  `
})
export class NoConnectionComponent {
    retry() {
        window.location.reload();
    }
}
