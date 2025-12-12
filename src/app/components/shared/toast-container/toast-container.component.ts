import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div class="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-[999999] flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto animate-slide-in-right bg-zinc-900 border rounded-xl shadow-2xl overflow-hidden w-full md:w-96 md:min-w-[320px] mx-auto"
          [class.border-emerald-500]="toast.type === 'success'"
          [class.border-red-500]="toast.type === 'error'"
          [class.border-blue-500]="toast.type === 'info'"
          [class.border-yellow-500]="toast.type === 'warning'">
          
          <div class="flex items-start gap-3 p-4">
            <!-- Icon -->
            <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              @if (toast.type === 'success') {
                <app-svg-icon name="check-circle" class="text-emerald-500" width="24" height="24"></app-svg-icon>
              }
              @if (toast.type === 'error') {
                <app-svg-icon name="info-circle" class="text-red-500" width="24" height="24"></app-svg-icon>
              }
              @if (toast.type === 'info') {
                <app-svg-icon name="info-circle" class="text-blue-500" width="24" height="24"></app-svg-icon>
              }
              @if (toast.type === 'warning') {
                <app-svg-icon name="info-circle" class="text-yellow-500" width="24" height="24"></app-svg-icon>
              }
            </div>

            <!-- Message -->
            <p class="flex-1 text-sm text-white font-medium leading-relaxed">
              {{ toast.message }}
            </p>

            <!-- Close Button -->
            <button 
              (click)="toastService.remove(toast.id)"
              class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
              <app-svg-icon name="x" width="20" height="20"></app-svg-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
