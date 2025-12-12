import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-piano',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <!-- Back -->
      <button (click)="goBack()" class="absolute top-6 left-6 w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors z-20">
        <svg class="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>

      <div class="text-center mb-8 relative z-10">
          <h1 class="text-3xl font-black text-white mb-2">Piano de Bolsillo</h1>
          <p class="text-zinc-500">Toca melodías rápidas.</p>
      </div>

      <!-- Piano Keys -->
      <div class="relative bg-zinc-900 p-4 rounded-3xl border border-zinc-800 shadow-2xl flex justify-center gap-1 select-none">
          
          <!-- White Keys -->
          @for (key of whiteKeys; track key.note) {
              <button (mousedown)="playNote(key.freq)" (touchstart)="playNote(key.freq); $event.preventDefault()"
                class="w-10 sm:w-14 h-40 sm:h-56 bg-white rounded-b-lg active:bg-zinc-200 active:scale-y-95 origin-top transition-transform relative z-0 flex items-end justify-center pb-4 shadow-lg">
                  <span class="text-zinc-400 font-bold text-xs">{{ key.note }}</span>
              </button>
          }

          <!-- Black Keys (Positioned absolute) -->
          <div class="absolute top-4 left-4 right-4 h-0 flex justify-center gap-1 pointer-events-none">
               <!-- Spacer for C -->
               <div class="w-10 sm:w-14"></div>
               
               <!-- C# -->
               <button (mousedown)="playNote(277.18)" (touchstart)="playNote(277.18); $event.preventDefault()" 
                    class="w-8 sm:w-10 h-24 sm:h-32 bg-black rounded-b-lg border border-zinc-800 active:bg-zinc-800 active:scale-y-95 origin-top transition-transform pointer-events-auto shadow-xl z-10 -ml-4 sm:-ml-5"></button>
               
               <!-- Spacer for D -->
               <div class="w-2 sm:w-4"></div>

               <!-- D# -->
               <button (mousedown)="playNote(311.13)" (touchstart)="playNote(311.13); $event.preventDefault()"
                    class="w-8 sm:w-10 h-24 sm:h-32 bg-black rounded-b-lg border border-zinc-800 active:bg-zinc-800 active:scale-y-95 origin-top transition-transform pointer-events-auto shadow-xl z-10 -ml-4 sm:-ml-5"></button>

               <!-- Spacer for E (No black key) -->
               <div class="w-10 sm:w-14"></div>
               <!-- Spacer for F -->
               <div class="w-2 sm:w-2"></div>

               <!-- F# -->
               <button (mousedown)="playNote(369.99)" (touchstart)="playNote(369.99); $event.preventDefault()"
                    class="w-8 sm:w-10 h-24 sm:h-32 bg-black rounded-b-lg border border-zinc-800 active:bg-zinc-800 active:scale-y-95 origin-top transition-transform pointer-events-auto shadow-xl z-10 -ml-4 sm:-ml-5"></button>

               <!-- Spacer for G -->
               <div class="w-2 sm:w-4"></div>

               <!-- G# -->
               <button (mousedown)="playNote(415.30)" (touchstart)="playNote(415.30); $event.preventDefault()"
                    class="w-8 sm:w-10 h-24 sm:h-32 bg-black rounded-b-lg border border-zinc-800 active:bg-zinc-800 active:scale-y-95 origin-top transition-transform pointer-events-auto shadow-xl z-10 -ml-4 sm:-ml-5"></button>

               <!-- Spacer for A -->
               <div class="w-2 sm:w-4"></div>

               <!-- A# -->
               <button (mousedown)="playNote(466.16)" (touchstart)="playNote(466.16); $event.preventDefault()"
                    class="w-8 sm:w-10 h-24 sm:h-32 bg-black rounded-b-lg border border-zinc-800 active:bg-zinc-800 active:scale-y-95 origin-top transition-transform pointer-events-auto shadow-xl z-10 -ml-4 sm:-ml-5"></button>
                    
               <!-- Spacer for B -->
               <div class="w-10 sm:w-14"></div>
               <!-- Spacer for C (High) -->
          </div>
      </div>
    </div>
  `
})
export class PianoComponent {
    audioContext: AudioContext | null = null;

    whiteKeys = [
        { note: 'C', freq: 261.63 },
        { note: 'D', freq: 293.66 },
        { note: 'E', freq: 329.63 },
        { note: 'F', freq: 349.23 },
        { note: 'G', freq: 392.00 },
        { note: 'A', freq: 440.00 },
        { note: 'B', freq: 493.88 },
        { note: 'C', freq: 523.25 }
    ];

    constructor(private router: Router) { }

    goBack() {
        this.router.navigate(['/tools']);
    }

    playNote(freq: number) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Suave tipo piano eléctrico
        osc.frequency.value = freq;

        // ADSR simple
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.02); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Decay/Release

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.5);
    }
}
