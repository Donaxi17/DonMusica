import { Component, OnDestroy, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { SeoService } from '../../../services/seo.service';
import { HapticService } from '../../../services/haptic.service';
import { LanguageService } from '../../../services/language.service';

interface Effect {
    id: string;
    name: string;
    emoji: string;
    color: string;
    desc: string;
}

@Component({
    selector: 'app-vocal-fx',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-pink-500/30 overflow-x-hidden relative flex flex-col items-center pb-20">
        <!-- Back Navigation -->
        <header class="w-full relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5">
            <button (click)="goBack()" 
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group">
                <svg class="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div class="text-right">
                <h1 class="text-xs font-black text-white tracking-widest uppercase">{{ languageService.get('vocal_fx.subtitle') }} <span class="text-pink-500">PRO</span></h1>
                <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{{ languageService.get('vocal_fx.subtitle') }}</p>
            </div>
        </header>

        <!-- Main Content -->
        <main class="relative z-10 max-w-xl w-full px-6 py-8 md:py-12 flex flex-col items-center">
            
            <div class="text-center mb-8">
                <h2 class="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">{{ languageService.get('vocal_fx.title') }} <span class="text-pink-500 italic">Master</span></h2>
                <div class="flex items-center justify-center gap-3">
                    <span class="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[9px] font-black text-pink-400 uppercase tracking-widest">DSP High-End</span>
                    <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Privacy First</span>
                </div>
            </div>

            <!-- Mode Selector -->
            <div class="flex p-1 bg-zinc-900/80 border border-white/5 rounded-[1.5rem] mb-8 w-full max-w-sm relative z-20">
                <button (click)="setMode('changer')" 
                    [class.bg-pink-500]="viewMode() === 'changer'" 
                    [class.text-white]="viewMode() === 'changer'"
                    class="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    {{ languageService.get('vocal_fx.mode.changer') }}
                </button>
                <button (click)="setMode('studio')" 
                    [class.bg-indigo-500]="viewMode() === 'studio'" 
                    [class.text-white]="viewMode() === 'studio'"
                    class="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    {{ languageService.get('vocal_fx.mode.studio') }}
                </button>
            </div>

            <!-- RECORDER CONSOLE -->
            <div class="w-full bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 shadow-3xl relative overflow-hidden group mb-6 md:mb-10">
                
                <!-- Status Visualizer / Canvas -->
                <div class="h-32 md:h-40 bg-black/40 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 mb-6 md:mb-8 flex items-center justify-center relative overflow-hidden group/viz ring-1 ring-white/5">
                    <canvas #vfxCanvas class="w-full h-full opacity-60"></canvas>
                    
                    <div *ngIf="!isRecording() && !audioData()" class="absolute inset-0 flex items-center justify-center pointer-events-none px-4 text-center">
                        <div class="text-[8px] md:text-[10px] font-black text-zinc-600 tracking-[0.3em] uppercase">{{ languageService.get('vocal_fx.status.ready') }}</div>
                    </div>
                    
                    <!-- RECOGNITION STATUS -->
                    <div *ngIf="isRecording()" class="absolute top-3 left-4 md:top-4 md:left-6 flex items-center gap-2">
                        <div class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span class="text-[8px] md:text-[9px] font-black text-red-500 uppercase tracking-widest">{{ languageService.get('vocal_fx.status.recording') }}</span>
                    </div>
                </div>

                <!-- Action Controls -->
                <div class="flex gap-3 md:gap-4">
                    <button (click)="toggleRecording()" 
                        [class.bg-red-500]="isRecording()" 
                        [class.bg-white]="!isRecording() && !audioData()"
                        [class.bg-pink-500]="!isRecording() && audioData()"
                        class="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 shadow-2xl relative overflow-hidden group/btn text-zinc-950 font-black uppercase text-[10px] md:text-[11px] tracking-widest">
                        <div *ngIf="isRecording()" class="w-2 md:w-2.5 h-2 md:h-2.5 bg-white rounded-full animate-ping"></div>
                        <span>{{ isRecording() ? languageService.get('vocal_fx.btn.stop') : (audioData() ? languageService.get('vocal_fx.btn.new_take') : languageService.get('vocal_fx.btn.record')) }}</span>
                    </button>

                    <button (click)="clearAudio()" [disabled]="!audioData()"
                        class="w-12 md:w-14 rounded-xl md:rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-95 disabled:opacity-20 shadow-xl">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>

            <!-- CHANGER MODE -->
            <div *ngIf="viewMode() === 'changer'" class="w-full space-y-4 md:space-y-6 animate-fade-in" [class.opacity-30]="!audioData()" [class.pointer-events-none]="!audioData()">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    @for (fx of effects; track fx.id) {
                        <button (click)="playEffect(fx.id)"
                            class="p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-900/40 border border-white/5 text-left hover:border-pink-500/30 transition-all active:scale-95 group/fx relative overflow-hidden">
                            <div class="relative z-10 flex flex-col h-full">
                                <span class="text-2xl md:text-3xl mb-2 md:mb-3 block transform group-hover/fx:scale-110 transition-transform duration-500">{{ fx.emoji }}</span>
                                <h4 class="text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest mb-1">{{ fx.name }}</h4>
                                <p class="text-[7px] md:text-[8px] text-zinc-500 font-bold leading-tight">{{ fx.desc }}</p>
                            </div>
                            <div [class]="'absolute -bottom-2 -right-2 w-16 h-16 blur-2xl opacity-5 group-hover/fx:opacity-20 transition-opacity ' + fx.color"></div>
                        </button>
                    }
                </div>
            </div>

            <!-- STUDIO MODE -->
            <div *ngIf="viewMode() === 'studio'" class="w-full space-y-4 md:space-y-6 animate-fade-in" [class.opacity-30]="!audioData()" [class.pointer-events-none]="!audioData()">
                
                <!-- Rack Presets -->
                <div class="flex items-center justify-between px-3 md:px-4 bg-zinc-900/30 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] border border-white/5">
                    <span class="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest">{{ languageService.get('vocal_fx.presets') }}</span>
                    <div class="flex gap-1.5 md:gap-2">
                         <button *ngFor="let p of ['natural', 'trap', 'radio']" (click)="applyPreset(p)" 
                            [class]="activePreset === p ? (p === 'natural' ? 'bg-white text-black' : p === 'trap' ? 'bg-indigo-500 text-white' : 'bg-zinc-500 text-white') : 'bg-white/5 text-zinc-500'"
                            class="text-[8px] md:text-[9px] font-bold uppercase px-2.5 py-1.5 rounded-lg transition-all relative">
                            {{ p === 'radio' ? languageService.get('vocal_fx.preset.vintage') : p === 'trap' ? languageService.get('vocal_fx.preset.trap') : languageService.get('vocal_fx.preset.natural') }}
                            <div *ngIf="activePreset === p" class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-black animate-pulse"
                                [class]="p === 'natural' ? 'bg-indigo-500' : p === 'trap' ? 'bg-pink-500' : 'bg-white'"></div>
                         </button>
                    </div>
                </div>

                <!-- Processor Matrix -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <!-- Column 1: Core Voice -->
                    <div class="space-y-3 md:space-y-4">
                        <div class="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4 md:space-y-5">
                            <div class="flex items-center justify-between">
                                <span class="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest">{{ languageService.get('vocal_fx.autotune') }}</span>
                                <div (click)="studioConfig.autotune = !studioConfig.autotune; hapticService.light()" class="w-7 h-4 bg-zinc-800 rounded-full relative cursor-pointer">
                                    <div [class.translate-x-3]="studioConfig.autotune" [class.bg-indigo-500]="studioConfig.autotune" class="w-3 h-3 bg-zinc-600 rounded-full absolute top-0.5 left-0.5 transition-all"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-[8px] md:text-[9px] font-black text-pink-400 uppercase tracking-widest">{{ languageService.get('vocal_fx.harmonizer') }}</span>
                                <div (click)="studioConfig.harmonizer = !studioConfig.harmonizer; hapticService.light()" class="w-7 h-4 bg-zinc-800 rounded-full relative cursor-pointer">
                                    <div [class.translate-x-3]="studioConfig.harmonizer" [class.bg-pink-500]="studioConfig.harmonizer" class="w-3 h-3 bg-zinc-600 rounded-full absolute top-0.5 left-0.5 transition-all"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-zinc-900/40 border border-white/5 space-y-3">
                            <span class="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">{{ languageService.get('vocal_fx.ambience') }}</span>
                            <div class="flex items-center gap-3">
                                <input type="range" min="0" max="1" step="0.01" [(ngModel)]="studioConfig.reverb"
                                    class="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                <span class="text-[8px] font-mono text-zinc-600">{{ (studioConfig.reverb * 100).toFixed(0) }}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Column 2: Dynamics & Cleanup -->
                    <div class="space-y-3 md:space-y-4">
                        <div class="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 space-y-4 md:space-y-5">
                            <div class="flex items-center justify-between">
                                <span class="text-[8px] md:text-[9px] font-black text-emerald-400 uppercase tracking-widest">{{ languageService.get('vocal_fx.noise_gate') }}</span>
                                <div (click)="studioConfig.gate = !studioConfig.gate; hapticService.light()" class="w-7 h-4 bg-zinc-800 rounded-full relative cursor-pointer">
                                    <div [class.translate-x-3]="studioConfig.gate" [class.bg-emerald-500]="studioConfig.gate" class="w-3 h-3 bg-zinc-600 rounded-full absolute top-0.5 left-0.5 transition-all"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-[8px] md:text-[9px] font-black text-cyan-400 uppercase tracking-widest">{{ languageService.get('vocal_fx.deesser') }}</span>
                                <div (click)="studioConfig.deesser = !studioConfig.deesser; hapticService.light()" class="w-7 h-4 bg-zinc-800 rounded-full relative cursor-pointer">
                                    <div [class.translate-x-3]="studioConfig.deesser" [class.bg-cyan-500]="studioConfig.deesser" class="w-3 h-3 bg-zinc-600 rounded-full absolute top-0.5 left-0.5 transition-all"></div>
                                </div>
                            </div>
                        </div>

                        <button (click)="studioConfig.clarity = !studioConfig.clarity"
                            [class]="studioConfig.clarity ? 'border-indigo-500/30 bg-indigo-500/10' : 'bg-zinc-900/40 border-white/5'"
                            class="w-full p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] text-left transition-all group border">
                            <h4 class="text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest mb-1">{{ languageService.get('vocal_fx.compressor.title') }}</h4>
                            <p class="text-[7px] md:text-[8px] text-zinc-500 font-bold leading-tight">{{ languageService.get('vocal_fx.compressor.desc') }}</p>
                        </button>
                    </div>
                </div>

                <!-- EQ Master Rack -->
                <div class="p-6 md:p-8 rounded-[1.5rem] md:rounded-[3rem] bg-zinc-900/60 border border-white/5 space-y-6 md:space-y-8 shadow-2xl relative overflow-hidden">
                    <div class="flex items-center gap-3 md:gap-4 mb-1">
                        <div class="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                        </div>
                        <span class="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">{{ languageService.get('vocal_fx.master_eq') }}</span>
                    </div>

                    <div class="grid grid-cols-1 xs:grid-cols-2 gap-6 md:gap-10">
                        <div class="space-y-3">
                            <div class="flex justify-between text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                <span>{{ languageService.get('vocal_fx.bass_pwr') }}</span>
                                <span class="text-white">{{ studioConfig.bass }}dB</span>
                            </div>
                            <input type="range" min="-10" max="20" [(ngModel)]="studioConfig.bass" class="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                <span>{{ languageService.get('vocal_fx.air_shine') }}</span>
                                <span class="text-white">{{ studioConfig.treble }}dB</span>
                            </div>
                            <input type="range" min="-10" max="20" [(ngModel)]="studioConfig.treble" class="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
                        </div>
                    </div>
                </div>

                <!-- Processing Action -->
                <button (click)="playStudio()" class="w-full py-5 md:py-6 rounded-2xl md:rounded-[2.5rem] bg-indigo-500 text-black font-black uppercase text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.4em] shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-95 transition-all hover:bg-indigo-400 flex items-center justify-center gap-2 md:gap-3">
                    <svg class="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    {{ languageService.get('vocal_fx.btn.playback') }}
                </button>
            </div>

            <!-- Download Result -->
            <div *ngIf="audioData()" class="w-full mt-10">
                <button (click)="downloadAudio()"
                    class="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-white/10 uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    {{ languageService.get('vocal_fx.btn.export') }}
                </button>
            </div>

        </main>

        <!-- Ambient Decor -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div [class.bg-pink-500]="viewMode() === 'changer'" [class.bg-indigo-500]="viewMode() === 'studio'" class="absolute top-[20%] right-[-10%] w-[60%] h-[60%] opacity-10 blur-[150px] rounded-full transition-colors duration-1000"></div>
            <div class="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full"></div>
        </div>
    </div>
    `
})
export class VocalFxComponent implements OnInit, OnDestroy {
    @ViewChild('vfxCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    private router = inject(Router);
    private toastService = inject(ToastService);
    private seoService = inject(SeoService);
    public hapticService = inject(HapticService);
    public languageService = inject(LanguageService);

    viewMode = signal<'changer' | 'studio'>('changer');
    isRecording = signal(false);
    audioData = signal<Blob | null>(null);
    activePreset = 'natural';

    studioConfig = {
        autotune: false,
        harmonizer: false,
        deesser: false,
        gate: true,
        clarity: true,
        reverb: 0.2,
        bass: 6,
        treble: 10
    };

    mediaRecorder: MediaRecorder | null = null;
    audioChunks: Blob[] = [];
    audioContext: AudioContext | null = null;
    animationId: number | null = null;
    analyser: AnalyserNode | null = null;

    effects: Effect[] = [
        { id: 'normal', name: this.languageService.get('vocal_fx.effects.normal.name'), emoji: '🎙️', color: 'bg-white', desc: this.languageService.get('vocal_fx.effects.normal.desc') },
        { id: 'vader', name: this.languageService.get('vocal_fx.effects.commander.name'), emoji: '🌌', color: 'bg-red-900', desc: this.languageService.get('vocal_fx.effects.commander.desc') },
        { id: 'robot', name: this.languageService.get('vocal_fx.effects.x_robot.name'), emoji: '🤖', color: 'bg-indigo-500', desc: this.languageService.get('vocal_fx.effects.x_robot.desc') },
        { id: 'chipmunk', name: this.languageService.get('vocal_fx.effects.squirrel.name'), emoji: '🐿️', color: 'bg-orange-500', desc: this.languageService.get('vocal_fx.effects.squirrel.desc') },
        { id: 'deep', name: this.languageService.get('vocal_fx.effects.beast.name'), emoji: '👹', color: 'bg-red-500', desc: this.languageService.get('vocal_fx.effects.beast.desc') },
        { id: 'alien', name: this.languageService.get('vocal_fx.effects.zodiac.name'), emoji: '👽', color: 'bg-emerald-500', desc: this.languageService.get('vocal_fx.effects.zodiac.desc') },
        { id: 'radio', name: this.languageService.get('vocal_fx.effects.retro.name'), emoji: '📻', color: 'bg-zinc-500', desc: this.languageService.get('vocal_fx.effects.retro.desc') },
        { id: 'cave', name: this.languageService.get('vocal_fx.effects.infinity.name'), emoji: '🕳️', color: 'bg-cyan-500', desc: this.languageService.get('vocal_fx.effects.infinity.desc') },
        { id: 'megaphone', name: this.languageService.get('vocal_fx.effects.alert.name'), emoji: '📣', color: 'bg-blue-500', desc: this.languageService.get('vocal_fx.effects.alert.desc') }
    ];

    ngOnInit() {
        this.seoService.setMetaTags({
            title: this.languageService.get('vocal_fx.seo.title'),
            description: this.languageService.get('vocal_fx.seo.desc'),
            keywords: 'vocal processing, autotune, noise gate, studio vocal fx, donmusica tools',
            image: '/assets/icons/icon-512x512.png'
        });
    }

    setMode(mode: 'changer' | 'studio') {
        this.hapticService.medium();
        this.viewMode.set(mode);
    }

    applyPreset(preset: string) {
        this.hapticService.medium();
        this.activePreset = preset;
        if (preset === 'natural') {
            this.studioConfig.autotune = false;
            this.studioConfig.harmonizer = false;
            this.studioConfig.deesser = true;
            this.studioConfig.gate = true;
            this.studioConfig.clarity = true;
            this.studioConfig.reverb = 0.15;
            this.studioConfig.bass = 4;
            this.studioConfig.treble = 8;
        } else if (preset === 'trap') {
            this.studioConfig.autotune = true;
            this.studioConfig.harmonizer = true;
            this.studioConfig.deesser = true;
            this.studioConfig.gate = true;
            this.studioConfig.clarity = true;
            this.studioConfig.reverb = 0.4;
            this.studioConfig.bass = 10;
            this.studioConfig.treble = 14;
        } else if (preset === 'radio') {
            this.studioConfig.autotune = false;
            this.studioConfig.harmonizer = false;
            this.studioConfig.deesser = false;
            this.studioConfig.gate = false;
            this.studioConfig.clarity = true;
            this.studioConfig.reverb = 0.05;
            this.studioConfig.bass = -5;
            this.studioConfig.treble = 15;
        }
    }

    getRandomHeight(): number {
        return Math.floor(Math.random() * (60 - 20 + 1) + 20);
    }

    goBack() {
        this.hapticService.light();
        this.router.navigate(['/tools']);
    }

    getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') this.audioContext.resume();
        return this.audioContext;
    }

    async toggleRecording() {
        this.hapticService.impact();
        if (this.isRecording()) {
            this.mediaRecorder?.stop();
            this.isRecording.set(false);
            if (this.animationId) cancelAnimationFrame(this.animationId);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];

                // Visualizer setup
                const ctx = this.getAudioContext();
                const source = ctx.createMediaStreamSource(stream);
                this.analyser = ctx.createAnalyser();
                this.analyser.fftSize = 256;
                source.connect(this.analyser);
                this.startVisualizer();

                this.mediaRecorder.ondataavailable = (event) => {
                    this.audioChunks.push(event.data);
                };

                this.mediaRecorder.onstop = () => {
                    this.audioData.set(new Blob(this.audioChunks, { type: 'audio/webm' }));
                    stream.getTracks().forEach(t => t.stop());
                };

                this.mediaRecorder.start();
                this.isRecording.set(true);
            } catch (err) {
                this.toastService.error(this.languageService.get('vocal_fx.toast.mic_required'));
            }
        }
    }

    startVisualizer() {
        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx || !this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!this.analyser) return;
            this.animationId = requestAnimationFrame(draw);
            this.analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2;
                const r = this.viewMode() === 'studio' ? 99 : 236;
                const g = this.viewMode() === 'studio' ? 102 : 72;
                const b = this.viewMode() === 'studio' ? 241 : 153;

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };
        draw();
    }

    clearAudio() {
        this.hapticService.light();
        this.audioData.set(null);
        this.audioChunks = [];
        if (this.animationId) cancelAnimationFrame(this.animationId);
        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    playEffect(type: string) {
        const data = this.audioData();
        if (!data) return;

        this.hapticService.medium();
        const url = URL.createObjectURL(data);
        const audio = new Audio(url);
        const ctx = this.getAudioContext();

        try {
            const source = ctx.createMediaElementSource(audio);
            this.analyser = ctx.createAnalyser();
            this.analyser.fftSize = 256;
            this.startVisualizer();

            const output = this.analyser;
            this.analyser.connect(ctx.destination);

            if (type === 'normal') {
                source.connect(output);
            } else if (type === 'chipmunk') {
                audio.playbackRate = 1.4;
                audio.preservesPitch = false;
                source.connect(output);
            } else if (type === 'deep') {
                audio.playbackRate = 0.75;
                audio.preservesPitch = false;
                source.connect(output);
            } else if (type === 'vader') {
                audio.playbackRate = 0.7;
                audio.preservesPitch = false;
                const dist = ctx.createWaveShaper();
                dist.curve = this.makeDistortionCurve(100);
                source.connect(dist);
                dist.connect(output);
            } else if (type === 'robot') {
                const bender = ctx.createOscillator();
                const bGain = ctx.createGain();
                bGain.gain.value = 0.01;
                bender.frequency.value = 50;
                bender.connect(bGain);
                const modulator = ctx.createGain();
                source.connect(modulator);
                bGain.connect(modulator.gain);
                modulator.connect(output);
                bender.start();
            } else if (type === 'radio') {
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 2000;
                filter.Q.value = 1.0;
                source.connect(filter);
                filter.connect(output);
            } else if (type === 'megaphone') {
                const filter = ctx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 800;
                const dist = ctx.createWaveShaper();
                dist.curve = this.makeDistortionCurve(400);
                source.connect(filter);
                filter.connect(dist);
                dist.connect(output);
            } else if (type === 'cave') {
                const delay = ctx.createDelay();
                delay.delayTime.value = 0.4;
                const feedback = ctx.createGain();
                feedback.gain.value = 0.6;
                source.connect(delay);
                delay.connect(feedback);
                feedback.connect(delay);
                source.connect(output);
                delay.connect(output);
            } else if (type === 'alien') {
                const lfo = ctx.createOscillator();
                lfo.frequency.value = 10;
                const lfoGain = ctx.createGain();
                lfoGain.gain.value = 0.8;
                lfo.connect(lfoGain.gain);
                source.connect(lfoGain);
                lfoGain.connect(output);
                lfo.start();
            } else {
                source.connect(output);
            }

            audio.play();
        } catch (e) {
            audio.play();
        }
    }

    playStudio() {
        const data = this.audioData();
        if (!data) return;

        this.hapticService.impact();
        const url = URL.createObjectURL(data);
        const audio = new Audio(url);
        const ctx = this.getAudioContext();

        try {
            const source = ctx.createMediaElementSource(audio);
            this.analyser = ctx.createAnalyser();
            this.analyser.fftSize = 512;
            this.startVisualizer();

            let lastNode: any = source;
            const mainGain = ctx.createGain();
            mainGain.gain.value = 1.0;

            // 1. High-Pass Filter (Low Cut) - Super important to remove rumble/noise
            const hpf = ctx.createBiquadFilter();
            hpf.type = 'highpass';
            hpf.frequency.value = 80; // Cut everything below 80Hz (rumble, hum)
            lastNode.connect(hpf);
            lastNode = hpf;

            // 2. Focused Voice EQ (Boost vocal range, cut boxiness)
            const voiceEq = ctx.createBiquadFilter();
            voiceEq.type = 'peaking';
            voiceEq.frequency.value = 400;
            voiceEq.gain.value = -3; // Reduce "boxiness"
            lastNode.connect(voiceEq);
            lastNode = voiceEq;

            // 3. Noise Gate (Focused Expansion)
            if (this.studioConfig.gate) {
                const gate = ctx.createDynamicsCompressor();
                gate.threshold.setValueAtTime(-40, ctx.currentTime); // Adjusted for better isolation
                gate.knee.setValueAtTime(0, ctx.currentTime);
                gate.ratio.setValueAtTime(20, ctx.currentTime);
                gate.attack.setValueAtTime(0.002, ctx.currentTime);
                gate.release.setValueAtTime(0.1, ctx.currentTime);
                lastNode.connect(gate);
                lastNode = gate;
            }

            // 2. De-Esser (High Shelf attenuation)
            if (this.studioConfig.deesser) {
                const deesser = ctx.createBiquadFilter();
                deesser.type = 'highshelf';
                deesser.frequency.value = 6000;
                deesser.gain.value = -6;
                lastNode.connect(deesser);
                lastNode = deesser;
            }

            // 3. Autotune / Presence (Musical peaking)
            if (this.studioConfig.autotune) {
                const presence = ctx.createBiquadFilter();
                presence.type = 'peaking';
                presence.frequency.value = 3000;
                presence.Q.value = 0.7;
                presence.gain.value = 6;
                lastNode.connect(presence);
                lastNode = presence;

                // Metallic touch
                const highPeak = ctx.createBiquadFilter();
                highPeak.type = 'peaking';
                highPeak.frequency.value = 8000;
                highPeak.Q.value = 10;
                highPeak.gain.value = 4;
                lastNode.connect(highPeak);
                lastNode = highPeak;
            }

            // 4. Harmonizer (Doubler) - Parallel connection
            if (this.studioConfig.harmonizer) {
                const delay = ctx.createDelay();
                delay.delayTime.value = 0.025;
                const hGain = ctx.createGain();
                hGain.gain.value = 0.4;
                lastNode.connect(delay);
                delay.connect(hGain);
                hGain.connect(mainGain);
            }

            // 5. EQ Block
            const bass = ctx.createBiquadFilter();
            bass.type = 'lowshelf';
            bass.frequency.value = 200;
            bass.gain.value = this.studioConfig.bass;
            lastNode.connect(bass);
            lastNode = bass;

            const treble = ctx.createBiquadFilter();
            treble.type = 'highshelf';
            treble.frequency.value = 5000;
            treble.gain.value = this.studioConfig.treble;
            lastNode.connect(treble);
            lastNode = treble;

            // 6. Professional Compressor
            if (this.studioConfig.clarity) {
                const comp = ctx.createDynamicsCompressor();
                comp.threshold.setValueAtTime(-20, ctx.currentTime);
                comp.knee.setValueAtTime(30, ctx.currentTime);
                comp.ratio.setValueAtTime(4, ctx.currentTime);
                comp.attack.setValueAtTime(0.003, ctx.currentTime);
                comp.release.setValueAtTime(0.25, ctx.currentTime);
                lastNode.connect(comp);
                lastNode = comp;
            }

            // 7. Spatial Reverb - Parallel connection
            if (this.studioConfig.reverb > 0) {
                const revDelay = ctx.createDelay();
                revDelay.delayTime.value = 0.06;
                const revGain = ctx.createGain();
                revGain.gain.value = this.studioConfig.reverb * 0.5;
                lastNode.connect(revDelay);
                revDelay.connect(revGain);
                revGain.connect(mainGain);
            }

            // Connect final chain to main gain
            lastNode.connect(mainGain);

            // 8. Output Limiter
            const limiter = ctx.createDynamicsCompressor();
            limiter.threshold.setValueAtTime(-1, ctx.currentTime);
            limiter.knee.setValueAtTime(0, ctx.currentTime);
            limiter.ratio.setValueAtTime(20, ctx.currentTime);
            limiter.attack.setValueAtTime(0.001, ctx.currentTime);
            limiter.release.setValueAtTime(0.1, ctx.currentTime);

            mainGain.connect(limiter);
            limiter.connect(this.analyser);
            this.analyser.connect(ctx.destination);

            audio.play();
        } catch (e) {
            audio.play();
        }
    }

    private makeDistortionCurve(amount: number) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    downloadAudio() {
        const data = this.audioData();
        if (!data) return;
        this.hapticService.light();
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `donmusica-pro-mastering.webm`;
        a.click();
    }

    ngOnDestroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.audioContext) this.audioContext.close().catch(() => { });
    }
}
