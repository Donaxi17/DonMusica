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

    <!-- Mobile Toast (Floating Top) -->
    <div class="md:hidden fixed top-2 left-0 right-0 z-[999999] pointer-events-none px-3 flex flex-col gap-2 items-center">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto w-full max-w-[400px] animate-slide-in-top bg-zinc-900/95 backdrop-blur-md border rounded-xl shadow-2xl overflow-hidden"
          [class.border-emerald-500]="toast.type === 'success'"
          [class.border-red-500]="toast.type === 'error'"
          [class.border-blue-500]="toast.type === 'info'"
          [class.border-yellow-500]="toast.type === 'warning'">
          
          <div class="flex items-start gap-3 p-3">
            <!-- Icon -->
            <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5">
              @if (toast.type === 'success') {
                <app-svg-icon name="check-circle" class="text-emerald-500" width="20" height="20"></app-svg-icon>
              }
              @if (toast.type === 'error') {
                <app-svg-icon name="info-circle" class="text-red-500" width="20" height="20"></app-svg-icon>
              }
              @if (toast.type === 'info') {
                <app-svg-icon name="info-circle" class="text-blue-500" width="20" height="20"></app-svg-icon>
              }
              @if (toast.type === 'warning') {
                <app-svg-icon name="info-circle" class="text-yellow-500" width="20" height="20"></app-svg-icon>
              }
            </div>

            <!-- Message -->
            <div class="flex-1 text-xs text-white font-medium leading-relaxed" [innerHTML]="toast.message"></div>

            <!-- Close Button -->
            <button 
              (click)="toastService.remove(toast.id)"
              class="flex-shrink-0 w-8 h-8 -mr-1 -mt-1 flex items-center justify-center text-zinc-400 hover:text-white transition-colors active:bg-zinc-800 rounded-lg">
              <app-svg-icon name="x" width="16" height="16"></app-svg-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in-top {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .animate-slide-in-top { animation: slide-in-top 0.3s ease-out; }
    .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
