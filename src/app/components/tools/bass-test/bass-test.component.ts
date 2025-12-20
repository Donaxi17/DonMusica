import { Component, signal, OnDestroy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SeoService } from '../../../services/seo.service';
import { HapticService } from '../../../services/haptic.service';

@Component({
    selector: 'app-bass-test',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative flex flex-col items-center">
        <!-- Back Navigation -->
        <header class="w-full relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5">
            <button (click)="goBack()" 
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group">
                <svg class="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div class="text-right">
                <h1 class="text-xs font-black text-white tracking-widest uppercase">Audio Studio <span class="text-cyan-500">PRO</span></h1>
                <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Bass Calibration Tool</p>
            </div>
        </header>

        <!-- Main Content -->
        <main class="relative z-10 max-w-lg w-full px-5 md:px-6 py-10 md:py-20 flex flex-col items-center text-center">
            
            <!-- Hero Icon -->
            <div class="relative mb-8 md:mb-10 group lowercase">
                <div class="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full scale-150 group-hover:bg-cyan-500/30 transition-all"></div>
                <div class="relative w-20 h-20 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900 border border-white/10 flex items-center justify-center text-cyan-400 shadow-2xl transition-transform duration-500 group-hover:rotate-12">
                    <svg class="w-10 h-10 md:w-16 md:h-16" [class.animate-pulse]="isBassPlaying()" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                </div>
            </div>

            <h2 class="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 tracking-tighter uppercase leading-none">Bass <span class="text-cyan-500 italic">Test</span></h2>
            <p class="text-zinc-500 text-xs md:text-base mb-10 max-w-sm mx-auto leading-relaxed px-4 md:px-0">
                Prueba la profundidad de tus bajos, limpia tus altavoces y calibra tu equipo de sonido con frecuencias subsónicas.
            </p>

            <!-- Test Controller -->
            <div class="w-full bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-3xl relative overflow-hidden group/card">
                <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                
                <!-- Frequency Display -->
                <div class="mb-8 md:mb-10">
                    <span class="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Audio Pulse</span>
                    <div class="text-5xl md:text-7xl font-black text-white tracking-widest mb-1 flex items-baseline justify-center">
                        {{ frequency() }}<span class="text-cyan-500 text-xl md:text-3xl ml-2 italic">Hz</span>
                    </div>
                </div>

                <!-- Main Power Button -->
                <button (click)="toggleBass()" 
                    class="relative w-full py-6 md:py-8 rounded-xl md:rounded-3xl border-2 transition-all duration-300 overflow-hidden group/play shadow-2xl active:scale-95"
                    [class.bg-cyan-500]="isBassPlaying()" [class.border-cyan-400]="isBassPlaying()" [class.text-black]="isBassPlaying()"
                    [class.bg-zinc-800]="!isBassPlaying()" [class.border-white-10]="!isBassPlaying()" [class.text-white]="!isBassPlaying()">
                    
                    <div class="relative z-10 flex items-center justify-center gap-3">
                        <svg *ngIf="!isBassPlaying()" class="w-6 h-6 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        <svg *ngIf="isBassPlaying()" class="w-6 h-6 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        <span class="text-lg md:text-2xl font-black uppercase tracking-tighter">{{ isBassPlaying() ? 'Detener' : 'Iniciar Test' }}</span>
                    </div>

                    <!-- Speaker Ripple Animation -->
                    <div *ngIf="isBassPlaying()" class="absolute inset-0 opacity-20 pointer-events-none">
                        <div class="absolute inset-0 bg-white/20 animate-ping rounded-full scale-150"></div>
                    </div>
                </button>

                <!-- Frequency Slider -->
                <div class="mt-10 md:mt-12 space-y-5 md:space-y-6 text-left">
                    <div class="flex justify-between items-end">
                        <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Ajuste Manual</span>
                        <span class="text-[10px] font-bold text-cyan-500 uppercase">{{ getFrequencyLabel() }}</span>
                    </div>
                    <input type="range" min="20" max="250" step="1" 
                        [value]="frequency()" 
                        (input)="updateFrequency($event)"
                        class="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500">
                </div>

                <!-- Presets Grid -->
                <div class="mt-10">
                    <span class="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block text-left">Quick Presets</span>
                    <div class="grid grid-cols-2 xs:grid-cols-4 gap-2 md:gap-3">
                        <button *ngFor="let preset of presets" 
                            (click)="setFrequency(preset.val)"
                            [class.bg-cyan-500]="frequency() === preset.val" [class.text-black]="frequency() === preset.val"
                            [class.bg-zinc-800]="frequency() !== preset.val" [class.text-zinc-400]="frequency() !== preset.val"
                            class="py-3 md:py-4 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest border border-white/5 transition-all hover:scale-105 active:scale-95 shadow-lg">
                            {{ preset.label }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Caution Banner -->
            <div class="mt-8 md:mt-12 w-full p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-orange-500/5 border border-orange-500/10 flex items-start gap-4 text-left">
                <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0 mt-1">
                    <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h4 class="text-white font-black text-[10px] md:text-xs uppercase mb-1">Precaución Auditiva</h4>
                    <p class="text-zinc-500 text-[10px] md:text-[11px] leading-relaxed">
                        Niveles altos por periodos prolongados pueden dañar altavoces y oídos.
                    </p>
                </div>
            </div>
        </main>

        <!-- Ambient Decor -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div class="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[150px] rounded-full"></div>
        </div>
    </div>
    `
})
export class BassTestComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private seoService = inject(SeoService);
    private hapticService = inject(HapticService);

    isBassPlaying = signal(false);
    frequency = signal(165);

    private audioContext: AudioContext | null = null;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;

    presets = [
        { label: 'Sub-Bass', val: 30 },
        { label: 'Deep', val: 60 },
        { label: 'Punchy', val: 100 },
        { label: 'Speaker', val: 165 }
    ];

    ngOnInit() {
        this.seoService.setMetaTags({
            title: 'Bass Test Pro | Calibra tu sonido en DonMusica',
            description: 'Prueba la profundidad de tus bajos y limpia tus altavoces con nuestra herramienta de calibración de audio profesional.',
            keywords: 'bass test, subwoofer test, limpiar altavoces, calibración audio, donmusica tools',
            image: '/assets/icons/icon-512x512.png'
        });
    }

    getFrequencyLabel(): string {
        const freq = this.frequency();
        if (freq < 40) return 'Subsónico (Efecto Físico)';
        if (freq < 80) return 'Bajo Profundo (Corazón)';
        if (freq < 150) return 'Bajo Medio (Punch)';
        return 'Limpieza y Desplazamiento';
    }

    goBack() {
        this.hapticService.light();
        this.router.navigate(['/tools']);
    }

    setFrequency(val: number) {
        this.hapticService.medium();
        this.frequency.set(val);
        if (this.oscillator) {
            this.oscillator.frequency.setTargetAtTime(val, this.audioContext!.currentTime, 0.1);
        }
    }

    updateFrequency(event: Event) {
        const val = parseInt((event.target as HTMLInputElement).value);
        this.frequency.set(val);
        if (this.oscillator) {
            this.oscillator.frequency.setTargetAtTime(val, this.audioContext!.currentTime, 0.05);
        }
    }

    toggleBass() {
        this.hapticService.impact();
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

            // Resume context if suspended (browser security)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            this.oscillator = this.audioContext.createOscillator();
            this.gainNode = this.audioContext.createGain();

            this.oscillator.type = 'sine';
            this.oscillator.frequency.value = this.frequency();

            // Soft landing to avoid pop
            this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.1);

            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);

            this.oscillator.start();
            this.isBassPlaying.set(true);
        } catch (e) {
            console.error(e);
        }
    }

    stopBass() {
        if (this.oscillator && this.gainNode && this.audioContext) {
            try {
                // Fade out to avoid pop
                this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
                setTimeout(() => {
                    if (this.oscillator) {
                        this.oscillator.stop();
                        this.oscillator.disconnect();
                        this.oscillator = null;
                    }
                }, 150);
            } catch (e) { }
        }
        this.isBassPlaying.set(false);
    }

    ngOnDestroy() {
        this.stopBass();
        if (this.audioContext) {
            this.audioContext.close().catch(() => { });
        }
    }
}
