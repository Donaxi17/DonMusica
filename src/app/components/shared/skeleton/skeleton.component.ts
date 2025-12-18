import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [style.width]="width">
      
      <!-- Artist/Album Card Skeleton -->
      @if (type === 'card') {
        <div class="bg-zinc-900/40 rounded-3xl overflow-hidden border border-white/5 h-full">
          <div class="aspect-square skeleton-shimmer bg-zinc-800/30"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 skeleton-shimmer bg-zinc-800/30 rounded-full w-3/4"></div>
            <div class="h-3 skeleton-shimmer bg-zinc-800/30 rounded-full w-1/2"></div>
          </div>
        </div>
      }
      
      <!-- Song/Track Item Skeleton -->
      @if (type === 'list-item') {
        <div class="flex items-center gap-4 p-3 rounded-2xl bg-zinc-900/40 border border-white/5">
          <div class="w-12 h-12 md:w-16 md:h-16 skeleton-shimmer bg-zinc-800/30 rounded-xl flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 skeleton-shimmer bg-zinc-800/30 rounded-full w-3/4"></div>
            <div class="h-3 skeleton-shimmer bg-zinc-800/30 rounded-full w-1/4"></div>
          </div>
        </div>
      }
      
      <!-- Hero Section Skeleton -->
      @if (type === 'hero') {
        <div class="w-full h-64 md:h-96 skeleton-shimmer bg-zinc-900/50 rounded-3xl"></div>
      }

      <!-- Track Card (Modern) -->
      @if (type === 'track-card') {
        <div class="flex flex-col gap-3">
            <div class="aspect-square skeleton-shimmer bg-zinc-800/30 rounded-3xl w-full"></div>
            <div class="h-4 skeleton-shimmer bg-zinc-800/30 rounded-full w-3/4 mx-auto"></div>
        </div>
      }
      
      @if (type === 'text') {
        <div class="h-4 skeleton-shimmer bg-zinc-800/30 rounded-full" [style.width]="width"></div>
      }
      
      @if (type === 'circle') {
        <div class="skeleton-shimmer bg-zinc-800/30 rounded-full" [style.width]="size" [style.height]="size"></div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container { display: block; h-full }
  `]
})
export class SkeletonComponent {
  @Input() type: 'card' | 'list-item' | 'text' | 'circle' | 'rectangle' | 'hero' | 'track-card' = 'card';
  @Input() width = '100%';
  @Input() height = '100px';
  @Input() size = '50px';
}
