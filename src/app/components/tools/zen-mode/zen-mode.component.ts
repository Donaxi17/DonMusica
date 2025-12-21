import { Component, OnDestroy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../../services/seo.service';
import { HapticService } from '../../../services/haptic.service';
import { LanguageService } from '../../../services/language.service';

interface ZenSound {
    id: string;
    name: string;
    category: string;
    icon: string;
    color: string;
    playing: boolean;
    volume: number;
    url?: string; // For Ultra Mode
    audio?: HTMLAudioElement; // For Ultra Mode
    node?: ScriptProcessorNode | null; // For Eco Mode
    gainNode?: GainNode | null; // For Eco Mode
}

@Component({
    selector: 'app-zen-mode',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative flex flex-col items-center">
        <!-- Back Navigation -->
        <header class="w-full relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5">
            <button (click)="goBack()" 
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group">
                <svg class="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div class="text-right">
                <h1 class="text-xs font-black text-white tracking-widest uppercase">Audio Studio <span class="text-indigo-500">PRO</span></h1>
                <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{{ languageService.get('zen.tool_name') }}</p>
            </div>
        </header>

        <!-- Main Content -->
        <main class="relative z-10 max-w-xl w-full px-5 md:px-6 py-10 md:py-20 flex flex-col items-center">
            
            <div class="text-center mb-6 md:mb-8">
                <h2 class="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 tracking-tighter uppercase leading-none">Zen <span class="text-indigo-500 italic">Zone</span></h2>
                <p class="text-zinc-500 text-xs md:text-base max-w-sm mx-auto leading-relaxed px-4 md:px-0">
                    {{ languageService.get('zen.description') }}
                </p>
            </div>

            <!-- Source Selector -->
            <div class="flex p-1 bg-zinc-900/80 border border-white/5 rounded-xl md:rounded-2xl mb-8 md:mb-12 w-full max-w-xs relative z-20 shadow-xl">
                <button (click)="setMode('ultra')" 
                    [class.bg-indigo-500]="audioMode() === 'ultra'" 
                    [class.text-white]="audioMode() === 'ultra'"
                    class="flex-1 py-3 px-4 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all">
                    {{ languageService.get('zen.mode.hd') }}
                </button>
                <button (click)="setMode('eco')" 
                    [class.bg-indigo-500]="audioMode() === 'eco'" 
                    [class.text-white]="audioMode() === 'eco'"
                    class="flex-1 py-3 px-4 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all">
                    {{ languageService.get('zen.mode.eco') }}
                </button>
            </div>

            <!-- MIXER SECTION -->
            <div class="w-full space-y-3 md:space-y-4 relative">
                @for (sound of currentSounds(); track sound.id) {
                    <div [class.border-indigo-500]="sound.playing"
                        class="group relative bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 hover:border-white/10">
                        
                        <div class="flex items-center justify-between" [class.mb-4]="sound.playing" [class.mb-0]="!sound.playing">
                            <div class="flex items-center gap-3 md:gap-4">
                                <div [class]="'w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 ' + (sound.playing ? sound.color : 'bg-zinc-800 text-zinc-500 text-lg md:text-2xl')">
                                    <span [innerHTML]="sound.icon"></span>
                                </div>
                                <div class="text-left">
                                    <h3 class="font-black text-white text-base md:text-lg tracking-tight leading-none mb-1">{{ getSoundName(sound.id) }}</h3>
                                    <p class="text-[8px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest">{{ getSoundCategory(sound.id) }}</p>
                                </div>
                            </div>

                            <!-- Toggle Switch -->
                            <button (click)="toggleSound(sound)" 
                                [class]="'w-12 h-7 md:w-14 md:h-8 rounded-full transition-all relative ' + (sound.playing ? 'bg-indigo-500' : 'bg-zinc-800')">
                                <div [class]="'w-5 h-5 md:w-6 md:h-6 bg-white rounded-full absolute top-1 left-1 transition-transform ' + (sound.playing ? (isMobile() ? 'translate-x-5' : 'translate-x-6') : 'translate-x-0')"></div>
                            </button>
                        </div>

                        <!-- Volume Control -->
                        <div [class.h-0]="!sound.playing" [class.opacity-0]="!sound.playing" [class.mt-0]="!sound.playing"
                            class="space-y-3 transition-all duration-500 overflow-hidden opacity-100">
                            <div class="flex justify-between items-center text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                <span>{{ languageService.get('zen.ambient') }}</span>
                                <span class="text-indigo-400">{{ (sound.volume * 100).toFixed(0) }}%</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.01" 
                                [disabled]="!sound.playing"
                                [(ngModel)]="sound.volume"
                                (input)="updateVolume(sound)"
                                class="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                        </div>

                        <!-- Active Glow -->
                        @if (sound.playing) {
                            <div class="absolute -inset-0.5 bg-indigo-500/5 blur-xl -z-10 rounded-[1.5rem] md:rounded-[2.5rem] animate-pulse"></div>
                        }
                    </div>
                }
            </div>

            <!-- Global Control -->
            <div class="mt-8 md:mt-12 w-full p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 text-center relative overflow-hidden">
                <div class="relative z-10">
                    <button (click)="stopAll()" 
                        class="text-[9px] md:text-[10px] font-black text-white hover:text-indigo-400 uppercase tracking-[0.3em] transition-colors flex items-center justify-center gap-2 mx-auto active:scale-95">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18h12V6H6v12z"/></svg>
                        {{ languageService.get('zen.stop_all') }}
                    </button>
                </div>
            </div>
        </main>

        <!-- Immersive Background Orbs -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-black">
            <div class="absolute top-[10%] left-[5%] w-96 h-96 bg-indigo-500/10 blur-[150px] rounded-full animate-pulse-slow"></div>
            <div class="absolute bottom-[10%] right-[5%] w-96 h-96 bg-purple-500/10 blur-[150px] rounded-full animate-pulse-slow"></div>
        </div>
    </div>
    `
})
export class ZenModeComponent implements OnInit, OnDestroy {
    public languageService = inject(LanguageService);
    private router = inject(Router);
    private seoService = inject(SeoService);
    private hapticService = inject(HapticService);

    audioMode = signal<'ultra' | 'eco'>('ultra');
    audioContext: AudioContext | null = null;
    isMobile = signal(window.innerWidth < 768);

    ultraSounds: ZenSound[] = [
        {
            id: 'rain-u', name: 'Lluvia Real', category: 'HD | Grabación',
            icon: '🌧️', color: 'bg-indigo-500/20 text-indigo-400',
            playing: false, volume: 0.5, url: 'https://www.gstatic.com/voice_delight/sounds/long/rain.mp3'
        },
        {
            id: 'ocean-u', name: 'Océano HD', category: 'HD | Grabación',
            icon: '🌊', color: 'bg-blue-500/20 text-blue-400',
            playing: false, volume: 0.4, url: 'https://www.gstatic.com/voice_delight/sounds/long/ocean.mp3'
        },
        {
            id: 'fire-u', name: 'Leña Real', category: 'HD | Grabación',
            icon: '🔥', color: 'bg-orange-500/20 text-orange-400',
            playing: false, volume: 0.5, url: 'https://www.gstatic.com/voice_delight/sounds/long/fireplace.mp3'
        },
        {
            id: 'forest-u', name: 'Bosque Real', category: 'HD | Grabación',
            icon: '🐦', color: 'bg-emerald-500/20 text-emerald-400',
            playing: false, volume: 0.3, url: 'https://www.gstatic.com/voice_delight/sounds/long/forest.mp3'
        },
        {
            id: 'river-u', name: 'Río de Cristal', category: 'HD | Grabación',
            icon: '💧', color: 'bg-cyan-500/20 text-cyan-400',
            playing: false, volume: 0.4, url: 'https://www.gstatic.com/voice_delight/sounds/long/river.mp3'
        },
        {
            id: 'storm-u', name: 'Tormenta', category: 'HD | Grabación',
            icon: '⚡', color: 'bg-purple-500/20 text-purple-400',
            playing: false, volume: 0.3, url: 'https://www.gstatic.com/voice_delight/sounds/long/thunder.mp3'
        }
    ];

    ecoSounds: ZenSound[] = [
        {
            id: 'rain-e', name: 'Lluvia Digital', category: 'Eco | Síntesis',
            icon: '☔', color: 'bg-indigo-500/20 text-indigo-400',
            playing: false, volume: 0.15
        },
        {
            id: 'ocean-e', name: 'Océano Eco', category: 'Eco | Síntesis',
            icon: '🏖️', color: 'bg-fuchsia-500/20 text-fuchsia-400',
            playing: false, volume: 0.3
        },
        {
            id: 'fire-e', name: 'Hoguera Eco', category: 'Eco | Síntesis',
            icon: '🕯️', color: 'bg-orange-500/20 text-orange-400',
            playing: false, volume: 0.2
        },
        {
            id: 'forest-e', name: 'Bosque Eco', category: 'Eco | Síntesis',
            icon: '🍃', color: 'bg-emerald-500/20 text-emerald-400',
            playing: false, volume: 0.1
        },
        {
            id: 'bowl-e', name: 'Cuenco Zen', category: 'Eco | Síntesis',
            icon: '🧘', color: 'bg-purple-500/20 text-purple-400',
            playing: false, volume: 0.1
        }
    ];

    ngOnInit() {
        this.seoService.setMetaTags({
            title: this.languageService.get('zen.seo.title'),
            description: this.languageService.get('zen.seo.desc'),
            keywords: 'zen zone, sonidos para dormir, offline sounds, naturaleza hd, ruido blanco',
            image: '/assets/icons/icon-512x512.png'
        });
    }

    getSoundName(id: string): string {
        const map: any = {
            'rain-u': this.languageService.get('zen.sounds.rain_real'),
            'ocean-u': this.languageService.get('zen.sounds.ocean_real'),
            'fire-u': this.languageService.get('zen.sounds.fire_real'),
            'forest-u': this.languageService.get('zen.sounds.forest_real'),
            'river-u': this.languageService.get('zen.sounds.river_real'),
            'storm-u': this.languageService.get('zen.sounds.storm_real'),
            'rain-e': this.languageService.get('zen.sounds.rain_eco'),
            'ocean-e': this.languageService.get('zen.sounds.ocean_eco'),
            'fire-e': this.languageService.get('zen.sounds.fire_eco'),
            'forest-e': this.languageService.get('zen.sounds.forest_eco'),
            'bowl-e': this.languageService.get('zen.sounds.bowl_eco')
        };
        return map[id] || id;
    }

    getSoundCategory(id: string): string {
        return id.endsWith('-u') ? this.languageService.get('zen.cat.hd') : this.languageService.get('zen.cat.eco');
    }

    currentSounds() {
        return this.audioMode() === 'ultra' ? this.ultraSounds : this.ecoSounds;
    }

    setMode(mode: 'ultra' | 'eco') {
        this.hapticService.light();
        this.stopAll();
        this.audioMode.set(mode);
    }

    goBack() {
        this.hapticService.light();
        this.router.navigate(['/tools']);
    }

    getCtx() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') this.audioContext.resume();
        return this.audioContext;
    }

    toggleSound(sound: ZenSound) {
        this.hapticService.medium();
        if (sound.playing) {
            this.stopSound(sound);
        } else {
            this.startSound(sound);
        }
    }

    startSound(sound: ZenSound) {
        if (this.audioMode() === 'ultra') {
            this.startUltraSound(sound);
        } else {
            this.startEcoSound(sound);
        }
    }

    private startUltraSound(sound: ZenSound) {
        if (!sound.audio) {
            sound.audio = new Audio(sound.url);
            sound.audio.loop = true;
        }
        sound.audio.volume = sound.volume;
        sound.audio.play().catch(err => {
            console.error(`Error al reproducir ${sound.name}:`, err);
        });
        sound.playing = true;
    }

    private startEcoSound(sound: ZenSound) {
        const ctx = this.getCtx();
        const bufferSize = 4096;
        const node = ctx.createScriptProcessor(bufferSize, 1, 1);
        const gainNode = ctx.createGain();

        // ALGORITMOS DE SÍNTESIS MEJORADOS
        if (sound.id === 'rain-e') { // Pink Noise Improved
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            node.onaudioprocess = (e) => {
                const out = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                    b6 = white * 0.115926;
                }
            };
        } else if (sound.id === 'ocean-e') { // Brown Noise LFO
            let lastOut = 0;
            node.onaudioprocess = (e) => {
                const out = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    const brown = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = brown;
                    // LFO para las olas
                    const wave = 0.5 + 0.5 * Math.sin(ctx.currentTime * 0.2);
                    out[i] = brown * wave * 4;
                }
            };
        } else if (sound.id === 'fire-e') { // Crackle synth
            let lastOut = 0;
            node.onaudioprocess = (e) => {
                const out = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    const brown = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = brown;
                    const crackle = Math.random() > 0.9997 ? (Math.random() * 0.8) : 0;
                    out[i] = (brown * 2) + crackle;
                }
            };
        } else if (sound.id === 'forest-e') { // Birds / Wind synth
            let phase = 0;
            node.onaudioprocess = (e) => {
                const out = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const bg = (Math.random() * 2 - 1) * 0.02;
                    let bird = 0;
                    if (Math.random() > 0.999) phase = 0; // Trigger "chirp"
                    if (phase < 100) {
                        bird = Math.sin(phase * 0.5) * 0.05;
                        phase++;
                    }
                    out[i] = bg + bird;
                }
            };
        } else if (sound.id === 'bowl-e') { // Deep Sine Bowl
            node.onaudioprocess = (e) => {
                const out = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    out[i] = Math.sin(ctx.currentTime * 110 * 2 * Math.PI) * 0.2;
                }
            };
        }

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(sound.volume, ctx.currentTime + 1);
        node.connect(gainNode);
        gainNode.connect(ctx.destination);
        sound.node = node;
        sound.gainNode = gainNode;
        sound.playing = true;
    }

    stopSound(sound: ZenSound) {
        if (sound.audio) {
            sound.audio.pause();
        }
        if (sound.gainNode && this.audioContext) {
            const ctx = this.audioContext;
            sound.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
            setTimeout(() => {
                if (sound.node) {
                    sound.node.disconnect();
                    sound.node = null;
                }
            }, 600);
        }
        sound.playing = false;
    }

    updateVolume(sound: ZenSound) {
        if (sound.audio) sound.audio.volume = sound.volume;
        if (sound.gainNode && this.audioContext) {
            sound.gainNode.gain.setTargetAtTime(sound.volume, this.audioContext.currentTime, 0.1);
        }
    }

    stopAll() {
        this.hapticService.impact();
        this.ultraSounds.forEach(s => this.stopSound(s));
        this.ecoSounds.forEach(s => this.stopSound(s));
    }

    ngOnDestroy() {
        this.stopAll();
        if (this.audioContext) this.audioContext.close();
    }
}
