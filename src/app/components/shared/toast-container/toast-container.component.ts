import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <!-- Desktop Toast (top-right) -->
    <div class="hidden md:block fixed top-4 right-4 z-[999999] pointer-events-none space-y-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto animate-slide-in-right bg-zinc-900 border rounded-xl shadow-2xl overflow-hidden min-w-[320px] max-w-[420px]"
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

            <!-- Message with HTML support -->
            <div class="flex-1 text-sm text-white font-medium leading-relaxed" [innerHTML]="toast.message"></div>

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

    <!-- Mobile Fullscreen Modal -->
    <div class="md:hidden">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
          <!-- Close Button (Top Right) -->
          <button 
            (click)="toastService.remove(toast.id)"
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-full transition-colors z-10">
            <app-svg-icon name="x" width="24" height="24"></app-svg-icon>
          </button>

          <!-- Content -->
          <div class="w-full max-w-md animate-scale-in">
            <div class="text-white" [innerHTML]="toast.message"></div>
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

    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes scale-in {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }

    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }

    .animate-scale-in {
      animation: scale-in 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
