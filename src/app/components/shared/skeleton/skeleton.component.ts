import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [style.width]="width" [style.height]="type === 'card' || type === 'list-item' ? 'auto' : height">
      @if (type === 'card') {
        <div class="bg-zinc-900/40 rounded-2xl overflow-hidden border border-white/5">
          <div class="aspect-square shimmer overflow-hidden"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 shimmer rounded-full w-3/4"></div>
            <div class="h-3 shimmer rounded-full w-1/2"></div>
          </div>
        </div>
      }
      
      @if (type === 'list-item') {
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
          <div class="w-16 h-16 shimmer rounded-xl flex-shrink-0"></div>
          <div class="flex-1 space-y-3">
            <div class="h-4 shimmer rounded-full w-3/4"></div>
            <div class="h-3 shimmer rounded-full w-1/4"></div>
          </div>
        </div>
      }
      
      @if (type === 'text') {
        <div class="h-4 shimmer rounded-full" [style.width]="width"></div>
      }
      
      @if (type === 'circle') {
        <div class="shimmer rounded-full" [style.width]="size" [style.height]="size"></div>
      }
      
      @if (type === 'rectangle') {
        <div class="shimmer rounded-2xl" [style.width]="width" [style.height]="height"></div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container {
      display: block;
    }

    .shimmer {
      background: linear-gradient(
        90deg,
        rgba(39, 39, 42, 0) 0%,
        rgba(63, 63, 70, 0.4) 50%,
        rgba(39, 39, 42, 0) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      background-color: rgba(39, 39, 42, 0.5);
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'card' | 'list-item' | 'text' | 'circle' | 'rectangle' = 'card';
  @Input() width = '100%';
  @Input() height = '100px';
  @Input() size = '50px';
}
