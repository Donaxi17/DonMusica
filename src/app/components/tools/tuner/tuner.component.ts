import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tuner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-zinc-950 flex flex-col items-center p-6 relative">
      <!-- Back Button -->
      <button (click)="goBack()" class="absolute top-6 left-6 w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors z-20">
        <svg class="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>

      <div class="mt-20 max-w-lg w-full">
         <div class="text-center mb-10">
            <h1 class="text-3xl font-black text-white mb-2">Afinador Pro</h1>
            <p class="text-zinc-500">Tonos de referencia precisos (440Hz)</p>
         </div>

         <!-- Guitar Headstock Visual -->
         <div class="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 relative shadow-2xl">
             
             <div class="space-y-4">
                 @for (note of guitarStrings; track note.name) {
                    <button (click)="playTone(note.freq)" 
                        class="w-full h-20 bg-zinc-800 rounded-xl border border-zinc-700 hover:border-orange-500 hover:bg-zinc-700 transition-all flex items-center px-6 relative overflow-hidden group active:scale-[0.98]">
                        
                        <!-- String Line Visual -->
                        <div class="absolute left-0 right-0 h-0.5 bg-zinc-600 top-1/2 -translate-y-1/2 group-hover:bg-orange-500 transition-colors" [style.height.px]="note.width"></div>
                        
                        <!-- Note Badge -->
                        <div class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-600 group-hover:border-orange-500 z-10 flex items-center justify-center font-black text-xl text-white group-hover:text-orange-400 shadow-xl transition-colors">
                            {{ note.name }}
                        </div>

                        <!-- Frequency -->
                        <div class="ml-auto z-10 font-mono text-zinc-500 text-sm group-hover:text-orange-300 transition-colors">
                            {{ note.freq }} Hz
                        </div>
                    </button>
                 }
             </div>

         </div>

         <p class="mt-8 text-center text-xs text-zinc-600">
            Afinación Estándar: E A D G B e
         </p>
      </div>
    </div>
  `
})
export class TunerComponent {
    guitarStrings = [
        { name: 'E', freq: 82.41, width: 4 },
        { name: 'A', freq: 110.00, width: 3.5 },
        { name: 'D', freq: 146.83, width: 3 },
        { name: 'G', freq: 196.00, width: 2.5 },
        { name: 'B', freq: 246.94, width: 2 },
        { name: 'e', freq: 329.63, width: 1.5 }
    ];

    private audioContext: AudioContext | null = null;

    constructor(private router: Router) { }

    goBack() {
        this.router.navigate(['/tools']);
    }

    playTone(freq: number) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 3);
    }
}
