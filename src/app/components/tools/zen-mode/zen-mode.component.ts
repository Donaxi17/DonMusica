import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-zen-mode',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-zinc-950 flex flex-col items-center p-6 relative">
      <!-- Back -->
      <button (click)="goBack()" class="absolute top-6 left-6 w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors z-20">
        <svg class="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>

      <div class="mt-20 max-w-lg w-full text-center">
         <h1 class="text-3xl font-black text-white mb-2">Zen Zone</h1>
         <p class="text-zinc-500 mb-10">Mezcla sonidos ambientales para relajarte.</p>
         
         <div class="grid grid-cols-1 gap-4">
             <!-- RAIN -->
             <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
                 <div class="flex items-center gap-4">
                     <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4.11 8.32C4.11 8.32 10.45 2 12.02 2c1.55 0 7.89 6.32 7.89 6.32 3 3 1.25 9.09-2.28 10.27l-5.61 1.86-5.61-1.86C2.86 17.41 1.11 11.32 4.11 8.32z"/></svg>
                     </div>
                     <div class="text-left">
                         <h3 class="font-bold text-white">Lluvia Suave</h3>
                         <p class="text-xs text-zinc-500">Ruido Rosa</p>
                     </div>
                 </div>
                 <button (click)="toggleRain()" [class.bg-blue-500]="rainPlaying" [class.text-white]="rainPlaying" class="w-12 h-8 rounded-full bg-zinc-800 transition-colors relative">
                     <div [class.translate-x-4]="rainPlaying" class="w-6 h-6 bg-white rounded-full absolute top-1 left-1 transition-transform transform shadow-sm"></div>
                 </button>
             </div>

             <!-- BROWN NOISE -->
             <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
                 <div class="flex items-center gap-4">
                     <div class="w-12 h-12 rounded-2xl bg-amber-900/20 flex items-center justify-center text-amber-600">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/></svg>
                     </div>
                     <div class="text-left">
                         <h3 class="font-bold text-white">Profundo</h3>
                         <p class="text-xs text-zinc-500">Ruido Marrón</p>
                     </div>
                 </div>
                 <button (click)="toggleBrown()" [class.bg-amber-600]="brownPlaying" [class.text-white]="brownPlaying" class="w-12 h-8 rounded-full bg-zinc-800 transition-colors relative">
                     <div [class.translate-x-4]="brownPlaying" class="w-6 h-6 bg-white rounded-full absolute top-1 left-1 transition-transform transform shadow-sm"></div>
                 </button>
             </div>
             
             <!-- AIR -->
            <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
                 <div class="flex items-center gap-4">
                     <div class="w-12 h-12 rounded-2xl bg-zinc-700/20 flex items-center justify-center text-zinc-400">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01 21.49L2.74 7.85A.515.515 0 0 1 3.17 7h17.65c.22 0 .42.14.49.35.07.21.01.45-.15.61l-9.15 13.53z"/></svg>
                     </div>
                     <div class="text-left">
                         <h3 class="font-bold text-white">Viento / Aire</h3>
                         <p class="text-xs text-zinc-500">Ruido Blanco</p>
                     </div>
                 </div>
                 <button (click)="toggleWhite()" [class.bg-zinc-500]="whitePlaying" [class.text-white]="whitePlaying" class="w-12 h-8 rounded-full bg-zinc-800 transition-colors relative">
                     <div [class.translate-x-4]="whitePlaying" class="w-6 h-6 bg-white rounded-full absolute top-1 left-1 transition-transform transform shadow-sm"></div>
                 </button>
             </div>

         </div>
      </div>
    </div>
  `
})
export class ZenModeComponent implements OnDestroy {
    audioContext: AudioContext | null = null;

    rainPlaying = false;
    rainNode: ScriptProcessorNode | null = null;

    brownPlaying = false;
    brownNode: ScriptProcessorNode | null = null;

    whitePlaying = false;
    whiteNode: ScriptProcessorNode | null = null;

    constructor(private router: Router) { }

    goBack() {
        this.router.navigate(['/tools']);
    }

    getCtx() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    // --- WHITE NOISE ---
    toggleWhite() {
        if (this.whitePlaying) {
            this.whiteNode?.disconnect();
            this.whiteNode = null;
            this.whitePlaying = false;
        } else {
            const ctx = this.getCtx();
            const bufferSize = 4096;
            const whiteNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
            whiteNoise.onaudioprocess = (e) => {
                const output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
            };
            const gain = ctx.createGain();
            gain.gain.value = 0.05; // Bajo volumen
            whiteNoise.connect(gain);
            gain.connect(ctx.destination);
            this.whiteNode = whiteNoise;
            this.whitePlaying = true;
        }
    }

    // --- PINK NOISE (Rain-ish) ---
    toggleRain() {
        if (this.rainPlaying) {
            this.rainNode?.disconnect();
            this.rainNode = null;
            this.rainPlaying = false;
        } else {
            const ctx = this.getCtx();
            const bufferSize = 4096;
            const pinkNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

            pinkNoise.onaudioprocess = (e) => {
                const output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    output[i] *= 0.11; // (roughly) compensate for gain
                    b6 = white * 0.115926;
                }
            };

            const gain = ctx.createGain();
            gain.gain.value = 0.15;
            pinkNoise.connect(gain);
            gain.connect(ctx.destination);
            this.rainNode = pinkNoise;
            this.rainPlaying = true;
        }
    }

    // --- BROWN NOISE (Deep) ---
    toggleBrown() {
        if (this.brownPlaying) {
            this.brownNode?.disconnect();
            this.brownNode = null;
            this.brownPlaying = false;
        } else {
            const ctx = this.getCtx();
            const bufferSize = 4096;
            const brownNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
            let lastOut = 0;

            brownNoise.onaudioprocess = (e) => {
                const output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 3.5; // (roughly) compensate for gain
                }
            };

            const gain = ctx.createGain();
            gain.gain.value = 0.3;
            brownNoise.connect(gain);
            gain.connect(ctx.destination);
            this.brownNode = brownNoise;
            this.brownPlaying = true;
        }
    }

    ngOnDestroy() {
        if (this.audioContext) this.audioContext.close();
    }
}
