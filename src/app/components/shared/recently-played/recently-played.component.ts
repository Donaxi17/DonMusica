import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService, HistoryItem } from '../../../services/history.service';
import { PlayerService } from '../../../services/player.service';
import { AdsContainerComponent } from '../ads-container/ads-container.component';
import { ToastService } from '../../../services/toast.service';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
    selector: 'app-recently-played',
    standalone: true,
    imports: [CommonModule, AdsContainerComponent, SkeletonComponent],
    template: `
    <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col justify-end md:justify-end md:flex-row animate-fade-in" (click)="close()">
        
        <!-- Main Panel -->
        <div class="w-full md:max-w-[320px] h-[95vh] md:h-full bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] md:animate-slide-in-right animate-slide-up flex flex-col rounded-t-[2rem] md:rounded-t-none" (click)="$event.stopPropagation()">
            
            <!-- Mobile Drag Handle -->
            <div class="md:hidden flex justify-center py-2.5">
                <div class="w-10 h-1 bg-zinc-800 rounded-full"></div>
            </div>

            <!-- Header -->
            <div class="pt-6 md:pt-8 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5 px-4 pb-4">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-base font-black text-white tracking-tight">Historial</h2>
                            <p class="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Recientes</p>
                        </div>
                    </div>
                    
                    <button (click)="close()" 
                        class="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white rounded-full bg-white/5 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Actions Bar -->
                <div *ngIf="(history$ | async)?.length" class="flex gap-2">
                    <button (click)="clear()" 
                        class="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/10 active:scale-95">
                        Limpiar Historial
                    </button>
                </div>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none">
                @if (loading()) {
                    @for (i of [1,2,3,4,5,6,7,8]; track i) {
                        <app-skeleton type="list-item"></app-skeleton>
                    }
                } @else {
                    <div *ngFor="let song of history$ | async" 
                         class="group flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer border border-white/5 active:scale-[0.98] relative"
                         (click)="play(song)">
                        
                        <div class="relative w-11 h-11 rounded-lg overflow-hidden shadow-xl flex-shrink-0 bg-zinc-900 border border-white/5">
                            <img [src]="song.img" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 6v12l10-6z" />
                                 </svg>
                            </div>
                        </div>
    
                        <div class="flex-1 min-w-0">
                            <h3 class="text-sm font-bold text-white truncate leading-tight">{{ song.title }}</h3>
                            <div class="flex items-center gap-2 mt-0.5">
                                <p class="text-[10px] text-zinc-500 truncate font-medium">{{ song.artist }}</p>
                                <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                                    {{ getTimeAgo(song.timestamp) }}
                                </span>
                            </div>
                        </div>
    
                        <div class="flex items-center">
                            <button (click)="remove(song.id, $event)" 
                                class="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                }

                <!-- Empty State -->
                <div *ngIf="(history$ | async)?.length === 0" class="h-64 flex flex-col items-center justify-center text-zinc-600 px-6 text-center">
                    <div class="w-20 h-20 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-6 relative">
                        <div class="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full"></div>
                        <svg class="w-10 h-10 text-emerald-500/30 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 class="text-lg font-black text-zinc-200 mb-2">Historial vacío</h4>
                    <p class="text-xs text-zinc-500 leading-relaxed font-medium">Tus reproducción aparecerán aquí.</p>
                </div>
            </div>

            <!-- AD SECTION -->
            <div class="mt-auto px-4 pb-4">
                <app-ads-container [smallOnly]="true" [index]="10"></app-ads-container>
            </div>

            <!-- Mobile Footer (Safe Area) -->
            <div class="h-[env(safe-area-inset-bottom,20px)] bg-zinc-950 shrink-0"></div>
        </div>
    </div>
    `
})
export class RecentlyPlayedComponent {
    loading = signal(true);
    history$;

    private historyService = inject(HistoryService);
    private playerService = inject(PlayerService);
    private toastService = inject(ToastService);

    constructor() {
        this.history$ = this.historyService.history$;
        // Short delay for premium feel
        setTimeout(() => this.loading.set(false), 800);
    }

    close() {
        document.dispatchEvent(new CustomEvent('closeHistory'));
    }

    play(item: HistoryItem) {
        this.playerService.playSong({
            id: item.id,
            title: item.title,
            artist: item.artist,
            img: item.img,
            url: item.url || ''
        } as any);
        this.close();
    }

    remove(id: string, event: Event) {
        event.stopPropagation();
        this.historyService.removeFromHistory(id);
        this.toastService.success('Eliminado del historial');
    }

    clear() {
        this.historyService.clearHistory();
        this.toastService.success('Historial limpiado correctamente');
    }

    getTimeAgo(timestamp: number): string {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Ahora';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return '1d+';
    }
}
