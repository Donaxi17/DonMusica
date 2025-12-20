import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SeoService } from '../../../services/seo.service';
import { HapticService } from '../../../services/haptic.service';

@Component({
    selector: 'app-tuner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-orange-500/30 overflow-x-hidden relative flex flex-col items-center">
        <!-- Back Navigation -->
        <header class="w-full relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5">
            <button (click)="goBack()" 
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group">
                <svg class="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div class="text-right">
                <h1 class="text-xs font-black text-white tracking-widest uppercase">Audio Studio <span class="text-orange-500">PRO</span></h1>
                <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Analog Reference Tuner</p>
            </div>
        </header>

        <!-- Main Content -->
        <main class="relative z-10 max-w-2xl w-full px-6 py-12 md:py-20 flex flex-col items-center">
            
            <div class="text-center mb-12">
                <h2 class="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Afinador <span class="text-orange-500 italic">Reference</span></h2>
                <p class="text-zinc-500 text-sm md:text-base max-w-sm mx-auto leading-relaxed">
                    Tonos de referencia balanceados para afinar instrumentos de cuerda con precisión absoluta (A=440Hz).
                </p>
            </div>

            <!-- Instrument Selector -->
            <div class="flex items-center gap-2 mb-10 p-1 bg-zinc-900/50 rounded-2xl border border-white/5 w-full max-w-xs overflow-x-auto scrollbar-hide">
                <button *ngFor="let inst of instruments" 
                    (click)="setInstrument(inst.id)"
                    [class.bg-orange-500]="activeInstrument() === inst.id" [class.text-black]="activeInstrument() === inst.id"
                    [class.text-zinc-500]="activeInstrument() !== inst.id"
                    class="flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">
                    {{ inst.name }}
                </button>
            </div>

            <!-- THE TUNER INTERFACE -->
            <div class="w-full relative px-4 py-12 bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-3xl overflow-hidden group">
                <!-- Inner Light -->
                <div class="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full group-hover:bg-orange-500/15 transition-colors"></div>
                
                <!-- Strings Grid -->
                <div class="relative z-10 grid grid-cols-1 gap-4 max-w-md mx-auto">
                    <button *ngFor="let note of currentStrings()" 
                        (click)="playTone(note.freq, note.name)"
                        [class.border-orange-500]="activeNote() === note.name"
                        [class.bg-orange-500]="activeNote() === note.name"
                        class="relative w-full h-24 rounded-2xl md:rounded-[2rem] border-2 border-white/5 bg-zinc-950/20 flex items-center px-8 transition-all duration-300 group/item active:scale-[0.98] overflow-hidden">
                        
                        <!-- String Aesthetic -->
                        <div class="absolute left-0 right-0 h-px bg-zinc-800 transition-all duration-700"
                            [style.height.px]="note.width"
                            [class.bg-orange-500]="activeNote() === note.name"
                            [class.shadow-[0_0_15px_rgba(249,115,22,0.5)]]="activeNote() === note.name"
                            [class.animate-pulse]="activeNote() === note.name">
                        </div>

                        <!-- Note Circle -->
                        <div class="relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10"
                            [class.bg-orange-500]="activeNote() === note.name"
                            [class.border-orange-400]="activeNote() === note.name"
                            [class.text-black]="activeNote() === note.name"
                            [class.bg-zinc-900]="activeNote() !== note.name"
                            [class.border-zinc-700]="activeNote() !== note.name"
                            [class.text-white]="activeNote() !== note.name">
                            <span class="text-2xl font-black">{{ note.name }}</span>
                        </div>

                        <!-- Info -->
                        <div class="ml-auto text-right z-10">
                            <p class="text-[10px] font-black uppercase tracking-widest" [class.text-orange-500]="activeNote() === note.name" [class.text-zinc-500]="activeNote() !== note.name">
                                {{ getNoteDescription(note.name) }}
                            </p>
                            <p class="text-xl font-mono text-white opacity-40 italic">{{ note.freq }}<span class="text-[10px] ml-1">Hz</span></p>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Additional Help -->
            <div class="mt-12 text-center text-zinc-600">
                <p class="text-[10px] font-black uppercase tracking-[0.4em] mb-4">Consejo de uso</p>
                <p class="text-xs leading-relaxed max-w-xs mx-auto italic">
                    Usa auriculares o un sistema de sonido fiel para percibir mejor los armónicos. El sonido se desvanece gradualmente emulando la acústica de una cuerda real.
                </p>
            </div>
        </main>

        <!-- Ambient Decor -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div class="absolute top-[30%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[150px] rounded-full"></div>
            <div class="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[150px] rounded-full"></div>
        </div>
    </div>
    `
})
export class TunerComponent implements OnInit {
    private router = inject(Router);
    private seoService = inject(SeoService);
    private hapticService = inject(HapticService);

    activeInstrument = signal('guitar');
    activeNote = signal<string | null>(null);

    instruments = [
        { id: 'guitar', name: 'Guitarra' },
        { id: 'bass', name: 'Bajo 4' },
        { id: 'ukulele', name: 'Ukulele' }
    ];

    guitarStrings = [
        { name: 'E2', freq: 82.41, width: 4 },
        { name: 'A2', freq: 110.00, width: 3.5 },
        { name: 'D3', freq: 146.83, width: 3 },
        { name: 'G3', freq: 196.00, width: 2.5 },
        { name: 'B3', freq: 246.94, width: 2 },
        { name: 'E4', freq: 329.63, width: 1.5 }
    ];

    bassStrings = [
        { name: 'E1', freq: 41.20, width: 5 },
        { name: 'A1', freq: 55.00, width: 4.5 },
        { name: 'D2', freq: 73.42, width: 4 },
        { name: 'G2', freq: 98.00, width: 3.5 }
    ];

    ukuleleStrings = [
        { name: 'G4', freq: 392.00, width: 2 },
        { name: 'C4', freq: 261.63, width: 2.5 },
        { name: 'E4', freq: 329.63, width: 2 },
        { name: 'A4', freq: 440.00, width: 1.5 }
    ];

    private audioContext: AudioContext | null = null;
    private timer: any = null;

    ngOnInit() {
        this.seoService.setMetaTags({
            title: 'Afinador Pro | Guitarra, Bajo y Ukulele en DonMusica',
            description: 'Afinador de referencia profesional con tonos precisos para afinar tu guitarra, bajo o ukulele rápidamente.',
            keywords: 'guitar tuner, afinador guitarra, afinador bajo, afinador ukulele, tonos referencia, audio tools',
            image: '/assets/icons/icon-512x512.png'
        });
    }

    currentStrings() {
        switch (this.activeInstrument()) {
            case 'bass': return this.bassStrings;
            case 'ukulele': return this.ukuleleStrings;
            default: return this.guitarStrings;
        }
    }

    getNoteDescription(name: string): string {
        const n = name.charAt(0);
        const map: any = { 'E': 'MI', 'A': 'LA', 'D': 'RE', 'G': 'SOL', 'B': 'SI', 'C': 'DO' };
        return map[n] || '';
    }

    setInstrument(id: string) {
        this.hapticService.light();
        this.activeInstrument.set(id);
        this.activeNote.set(null);
    }

    goBack() {
        this.hapticService.light();
        this.router.navigate(['/tools']);
    }

    playTone(freq: number, name: string) {
        this.hapticService.medium();
        this.activeNote.set(name);

        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.activeNote.set(null), 3000);

        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = this.audioContext;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Complex sound (Sawtooth soft)
        osc.type = 'sawtooth';
        osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.01);

        // Filter to make it less harsh
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 4);
    }
}
