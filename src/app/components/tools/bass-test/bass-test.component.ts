import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-bass-test',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative">
      <!-- Back Button -->
      <button (click)="goBack()" class="absolute top-6 left-6 w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors z-20">
        <svg class="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>

      <div class="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
        <!-- Decoration -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

        <div class="w-20 h-20 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <svg class="w-10 h-10 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
        </div>

        <h1 class="text-3xl font-black text-white mb-2">Bass Test</h1>
        <p class="text-zinc-500 mb-8">Frecuencia de 165Hz para probar subwoofers y limpiar altavoces.</p>

        <!-- Big Button -->
        <button (click)="toggleBass()" 
            [class.scale-105]="isBassPlaying()"
            [class.shadow-[0_0_50px_rgba(6,182,212,0.3)]]="isBassPlaying()"
            class="w-full aspect-square max-h-64 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-4 border-zinc-800 flex flex-col items-center justify-center transition-all duration-300 group hover:border-cyan-500/30 active:scale-95 relative overflow-hidden">
            
            <div *ngIf="isBassPlaying()" class="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
            
            <!-- Speaker Cone Animation -->
            <div [class.animate-ping]="isBassPlaying()" class="absolute w-32 h-32 rounded-full border border-cyan-500/20 opacity-0" style="animation-duration: 2s"></div>
            <div [class.animate-ping]="isBassPlaying()" class="absolute w-48 h-48 rounded-full border border-cyan-500/10 opacity-0" style="animation-delay: 0.5s; animation-duration: 2s"></div>

            <svg *ngIf="!isBassPlaying()" class="w-16 h-16 text-zinc-500 group-hover:text-cyan-400 transition-colors mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg *ngIf="isBassPlaying()" class="w-16 h-16 text-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            
            <span class="font-bold tracking-widest text-sm" [class.text-cyan-400]="isBassPlaying()" [class.text-zinc-500]="!isBassPlaying()">
                {{ isBassPlaying() ? 'DETENER' : 'INICIAR TEST' }}
            </span>
        </button>

        <p class="mt-8 text-xs text-zinc-600 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800/50">
            ⚠️ <strong>Precaución:</strong> No uses el volumen máximo por períodos prolongados.
        </p>
      </div>
    </div>
  `
})
export class BassTestComponent implements OnDestroy {
    isBassPlaying = signal(false);
    private audioContext: AudioContext | null = null;
    private oscillator: OscillatorNode | null = null;

    constructor(private router: Router) { }

    goBack() {
        this.router.navigate(['/tools']);
    }

    toggleBass() {
        if (this.isBassPlaying()) {
            this.stopBass();
        } else {
            this.playBass();
        }
    }

    playBass() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            this.oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            this.oscillator.type = 'sine';
            this.oscillator.frequency.value = 165;
            gainNode.gain.value = 0.5;

            this.oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            this.oscillator.start();
            this.isBassPlaying.set(true);
        } catch (e) { console.error(e); }
    }

    stopBass() {
        if (this.oscillator) {
            try {
                this.oscillator.stop();
                this.oscillator.disconnect();
            } catch (e) { }
            this.oscillator = null;
        }
        this.isBassPlaying.set(false);
    }

    ngOnDestroy() {
        this.stopBass();
        if (this.audioContext) this.audioContext.close();
    }
}
