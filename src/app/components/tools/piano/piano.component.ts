import { Component, inject, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SeoService } from '../../../services/seo.service';
import { HapticService } from '../../../services/haptic.service';

interface PianoKey {
    note: string;
    freq: number;
    type: 'white' | 'black';
    key: string; // PC keyboard mapping
    active?: boolean;
}

@Component({
    selector: 'app-piano',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative flex flex-col items-center">
        <!-- Back Navigation -->
        <header class="w-full relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5">
            <button (click)="goBack()" 
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group">
                <svg class="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div class="text-right">
                <h1 class="text-xs font-black text-white tracking-widest uppercase">Audio Studio <span class="text-emerald-500">PRO</span></h1>
                <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Master Polyphonic Piano</p>
            </div>
        </header>

        <!-- Main Content -->
        <main class="relative z-10 w-full px-6 py-8 md:py-16 flex flex-col items-center">
            
            <div class="text-center mb-8">
                <h2 class="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Piano <span class="text-emerald-500 italic">Pro</span></h2>
                <div class="flex items-center justify-center gap-3">
                    <span class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Polifónico</span>
                    <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Baja Latencia</span>
                </div>
            </div>

            <!-- INSTRUMENT SELECTOR -->
            <div class="flex items-center gap-2 mb-8 p-1 bg-zinc-900/50 rounded-2xl border border-white/5 w-full max-w-sm overflow-x-auto scrollbar-hide">
                @for (type of instrumentTypes; track type.id) {
                    <button (click)="currentInstrument.set(type.id)"
                        [class.bg-emerald-500]="currentInstrument() === type.id"
                        [class.text-black]="currentInstrument() === type.id"
                        class="flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">
                        {{ type.name }}
                    </button>
                }
            </div>

            <!-- KEYBOARD CONTAINER -->
            <div class="w-full max-w-5xl bg-zinc-900/40 backdrop-blur-3xl p-4 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-3xl overflow-x-auto scrollbar-hide touch-none relative group">
                
                <!-- Landscape Hint (Mobile Only) -->
                <div class="flex md:hidden items-center justify-center gap-2 mb-6 opacity-60">
                    <svg class="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11a1 1 0 100-2 1 1 0 000 2zM12 7a1 1 0 110-2 1 1 0 010 2zM12 15a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    <span class="text-[8px] font-black uppercase tracking-widest text-zinc-500">Gira la pantalla para tocar mejor</span>
                </div>

                <!-- Octave Controls -->
                <div class="md:absolute md:top-4 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center gap-4 z-20 mb-8 md:mb-0">
                    <button (click)="changeOctave(-1)" class="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-zinc-700 transition-colors shadow-lg active:scale-90">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div class="text-center">
                        <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest block leading-none">Octava</span>
                        <span class="text-lg font-black text-white leading-none">{{ octave() }}</span>
                    </div>
                    <button (click)="changeOctave(1)" class="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-zinc-700 transition-colors shadow-lg active:scale-90">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                <div class="relative flex justify-center w-full min-w-[320px] h-64 md:h-80 select-none pt-4">
                    
                    <!-- White Keys -->
                    <div class="flex gap-1 md:gap-1.5 w-full justify-center max-w-full">
                        @for (key of getKeys(); track key.note + octave()) {
                            @if (key.type === 'white') {
                                <button 
                                    (mousedown)="playNote(key)" 
                                    (touchstart)="playNote(key); $event.preventDefault()"
                                    [class.bg-emerald-400]="key.active"
                                    [class.translate-y-2]="key.active"
                                    class="flex-1 min-w-[40px] md:min-w-[75px] bg-white rounded-b-xl md:rounded-b-2xl border-x border-zinc-200 shadow-[0_5px_0_#d4d4d8,0_10px_15px_rgba(0,0,0,0.3)] md:shadow-[0_8px_0_#d4d4d8,0_15px_20px_rgba(0,0,0,0.4)] active:translate-y-2 active:shadow-none transition-all flex flex-col justify-end items-center pb-6 md:pb-8 group relative overflow-hidden">
                                    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none"></div>
                                    <span class="relative z-10 text-[8px] md:text-[10px] font-black text-zinc-400 group-active:text-emerald-700 tracking-widest">{{ key.note }}</span>
                                </button>
                            }
                        }
                    </div>

                    <!-- Black Keys Overlay -->
                    <div class="absolute inset-x-0 top-4 flex justify-center pointer-events-none px-[20px] md:px-[37px]">
                        <div class="flex w-full">
                            @for (key of getKeys(); track key.note + octave()) {
                                <div class="flex-1 relative h-full">
                                    @if (shouldShowBlackKey(key.note)) {
                                        <button 
                                            (mousedown)="playNote(getBlackKeyFor(key.note))" 
                                            (touchstart)="playNote(getBlackKeyFor(key.note)); $event.preventDefault()"
                                            [class.active-black]="getBlackKeyFor(key.note).active"
                                            class="absolute left-full -translate-x-1/2 w-7 md:w-11 h-32 md:h-48 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-b-lg md:rounded-b-xl border border-white/10 shadow-3xl pointer-events-auto active:scale-y-95 origin-top transition-all z-10 flex flex-col justify-end items-center pb-4 group">
                                            <div class="absolute inset-0 bg-white/5 pointer-events-none rounded-b-xl"></div>
                                            <span class="text-[7px] md:text-[8px] font-black text-zinc-600 group-active:text-emerald-400 uppercase">{{ getBlackKeyFor(key.note).note }}</span>
                                        </button>
                                    }
                                </div>
                            }
                        </div>
                    </div>

                </div>
            </div>

            <!-- Controls (Sustain) -->
            <div class="mt-8 md:mt-12 flex flex-wrap justify-center gap-3 md:gap-4 w-full max-w-3xl">
                <button (click)="toggleSustain()" 
                    [class]="sustain() ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-zinc-900/50 border-white/5'"
                    class="flex-1 min-w-[160px] md:flex-initial px-6 py-4 md:px-8 md:py-5 rounded-[1.5rem] md:rounded-[2rem] border flex items-center gap-4 transition-all active:scale-95 group">
                    <div [class]="sustain() ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-zinc-700'" class="w-3 h-3 rounded-full transition-all duration-500"></div>
                    <div class="text-left">
                        <span class="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Pedal Sustain</span>
                        <p class="text-white font-black text-xs uppercase leading-none">{{ sustain() ? 'Mantenido' : 'Normal' }}</p>
                    </div>
                </button>

                <div class="flex-1 min-w-[160px] md:flex-initial px-6 py-4 md:px-8 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-900/50 border border-white/5 flex items-center gap-4">
                    <div class="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <svg class="w-5 h-5 md:w-6 md:h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                    </div>
                    <div class="text-left">
                        <span class="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Audio Studio</span>
                        <p class="text-white font-black text-[10px] md:text-xs uppercase leading-none">{{ currentInstrument() }}</p>
                    </div>
                </div>
            </div>

        </main>

        <!-- CSS specific to the piano for the active states -->
        <style>
            .active-black {
                transform: scaleY(0.95);
                filter: brightness(1.5);
                box-shadow: 0 0 25px rgba(16, 185, 129, 0.5);
            }
        </style>

        <!-- Ambient Decor -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div class="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse-slow"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[150px] rounded-full"></div>
        </div>
    </div>
    `
})
export class PianoComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private seoService = inject(SeoService);
    private hapticService = inject(HapticService);

    audioContext: AudioContext | null = null;
    octave = signal(4);
    sustain = signal(false);
    currentInstrument = signal('grand-piano');

    instrumentTypes = [
        { id: 'grand-piano', name: 'Grand Piano' },
        { id: 'electric-piano', name: 'Rhodes' },
        { id: 'strings', name: 'Sintetizador' },
        { id: 'organ', name: 'Órgano' }
    ];

    private keyboardMap: { [key: string]: string } = {
        'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
        't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B', 'k': 'C2'
    };

    activeOscillators: Map<string, { osc: OscillatorNode, gain: GainNode, stopTime?: number }> = new Map();

    ngOnInit() {
        this.seoService.setMetaTags({
            title: 'Piano Studio Pro | Toca y Crea Música en DonMusica',
            description: 'Piano polifónico virtual profesional con múltiples timbres y baja latencia. Toca con el teclado o en tu móvil.',
            keywords: 'piano pro, virtual piano, rhodes, organo, sintetizador online, donmusica tools',
            image: '/assets/icons/icon-512x512.png'
        });
    }

    @HostListener('window:keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (this.keyboardMap[key]) {
            const noteName = this.keyboardMap[key];
            const octaveMod = noteName.includes('2') ? 1 : 0;
            const pureNote = noteName.replace('2', '');
            const freq = this.getFrequency(pureNote, this.octave() + octaveMod);
            this.playNote({ note: noteName, freq, type: noteName.includes('#') ? 'black' : 'white', key });
        }
    }

    getKeys(): PianoKey[] {
        const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const pcKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J'];

        return whiteNotes.map((note, idx) => ({
            note,
            freq: this.getFrequency(note, this.octave()),
            type: 'white',
            key: pcKeys[idx]
        }));
    }

    shouldShowBlackKey(note: string): boolean {
        return ['C', 'D', 'F', 'G', 'A'].includes(note);
    }

    getBlackKeyFor(whiteNote: string): PianoKey {
        const blackNote = whiteNote + '#';
        const keyMap: any = { 'C': 'W', 'D': 'E', 'F': 'T', 'G': 'Y', 'A': 'U' };
        return {
            note: blackNote,
            freq: this.getFrequency(blackNote, this.octave()),
            type: 'black',
            key: keyMap[whiteNote]
        };
    }

    getFrequency(note: string, octave: number): number {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const semitonesValue = notes.indexOf(note);
        // A4 = 440Hz is the 9th note of the 4th octave (0-indexed)
        // Frequency = 440 * 2^((n - 69) / 12)
        // Here we calculate relative to C0
        const n = (octave + 1) * 12 + semitonesValue;
        return 440 * Math.pow(2, (n - 69) / 12);
    }

    changeOctave(delta: number) {
        this.hapticService.light();
        const newOctave = this.octave() + delta;
        if (newOctave >= 1 && newOctave <= 7) {
            this.octave.set(newOctave);
        }
    }

    toggleSustain() {
        this.hapticService.impact();
        this.sustain.set(!this.sustain());
    }

    playNote(key: any) {
        this.hapticService.light();
        key.active = true;
        setTimeout(() => key.active = false, 150);

        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = this.audioContext;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // INSTRUMENT VOICING
        const type = this.currentInstrument();

        if (type === 'grand-piano') {
            osc.type = 'triangle';
            filter.type = 'lowpass';
            filter.frequency.value = 1200;
        } else if (type === 'electric-piano') {
            osc.type = 'sine';
            const harmonic = ctx.createOscillator();
            harmonic.type = 'sine';
            harmonic.frequency.value = key.freq * 2;
            const hGain = ctx.createGain();
            hGain.gain.value = 0.1;
            harmonic.connect(hGain);
            hGain.connect(gain);
            harmonic.start();
            harmonic.stop(ctx.currentTime + 3);
        } else if (type === 'strings') {
            osc.type = 'sawtooth';
            filter.type = 'lowpass';
            filter.frequency.value = 800;
        } else if (type === 'organ') {
            osc.type = 'square';
            filter.type = 'lowpass';
            filter.frequency.value = 1500;
        }

        osc.frequency.setValueAtTime(key.freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);

        const decayTime = this.sustain() ? 4.0 : 1.2;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decayTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + decayTime);
    }

    goBack() {
        this.hapticService.light();
        this.router.navigate(['/tools']);
    }

    ngOnDestroy() {
        if (this.audioContext) {
            this.audioContext.close().catch(() => { });
        }
    }
}
