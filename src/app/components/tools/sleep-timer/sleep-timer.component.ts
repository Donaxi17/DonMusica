import { Component, signal, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VideoPlayerService } from '../../../services/video-player.service';

@Component({
    selector: 'app-sleep-timer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative">
      <!-- Back Button -->
      <button (click)="goBack()" class="absolute top-6 left-6 w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors z-20">
        <svg class="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>

      <div class="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
         
         <div class="mb-6 flex justify-center">
             <div class="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                 <svg class="w-10 h-10 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
             </div>
         </div>

         <h1 class="text-3xl font-black text-white mb-2">Sleep Timer</h1>
         <p class="text-zinc-500 mb-8">La música se detendrá automáticamente.</p>

         <!-- Timer Display -->
         <div class="text-6xl font-black font-mono text-white mb-8 tabular-nums tracking-wider">
             {{ formatTime(timeLeft()) }}
         </div>

         <!-- Preset Buttons -->
         <div *ngIf="!isRunning()" class="grid grid-cols-2 gap-3 mb-6 animate-fade-in">
             <button (click)="startTimer(15)" class="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-all hover:scale-105 active:scale-95">15 Min</button>
             <button (click)="startTimer(30)" class="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-all hover:scale-105 active:scale-95">30 Min</button>
             <button (click)="startTimer(45)" class="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-all hover:scale-105 active:scale-95">45 Min</button>
             <button (click)="startTimer(60)" class="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-all hover:scale-105 active:scale-95">60 Min</button>
         </div>

         <!-- Controls -->
         <div *ngIf="isRunning()" class="space-y-4 animate-fade-in">
             <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                 <div class="h-full bg-indigo-500 transition-all duration-1000" [style.width.%]="getProgress()"></div>
             </div>
             
             <button (click)="cancelTimer()" class="w-full py-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all">
                 CANCELAR
             </button>
         </div>
      </div>
    </div>
  `
})
export class SleepTimerComponent implements OnDestroy {
    timeLeft = signal(0); // seconds
    initialTime = 0;
    isRunning = signal(false);
    private timerInterval: any = null;

    videoService = inject(VideoPlayerService);

    constructor(private router: Router) { }

    goBack() {
        this.router.navigate(['/tools']);
    }

    startTimer(minutes: number) {
        this.initialTime = minutes * 60;
        this.timeLeft.set(this.initialTime);
        this.isRunning.set(true);

        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            const current = this.timeLeft();
            if (current <= 1) {
                this.stopMusic();
                this.cancelTimer();
            } else {
                this.timeLeft.set(current - 1);
            }
        }, 1000);
    }

    cancelTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isRunning.set(false);
        this.timeLeft.set(0);
    }

    stopMusic() {
        // Logic to stop the music service
        this.videoService.closeVideo();
        // Optional: Play a soft fade out or just stop
        console.log('Sleep Timer: Music Stopped');
    }

    getProgress() {
        if (this.initialTime === 0) return 0;
        return (this.timeLeft() / this.initialTime) * 100;
    }

    formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    ngOnDestroy() {
        // Don't kill the timer on destroy if we navigate away? 
        // Usually sleep timer should persist in background service, but for this component-based implementation:
        // We will keep it simple: if you leave the page, timer stops. 
        // To make it persist, we'd need a global service.
        this.cancelTimer();
    }
}
