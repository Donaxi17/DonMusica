import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SeoService } from '../../../services/seo.service';
import { HapticService } from '../../../services/haptic.service';

interface TunerString {
  name: string;
  freq: number;
  label: string;
  octave: number;
  width: number;
}

interface Instrument {
  id: string;
  name: string;
  type: '3-3' | '2-2';
  woodBase: string;    // Core wood color
  woodSide: string;    // Shadow wood color
  pegType: 'chrome' | 'ebony' | 'bass-gear' | 'classical';
  nutWidth: number;
  shape: string;       // Headstock SVG path
  strings: TunerString[];
}

@Component({
  selector: 'app-tuner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[9999] bg-[#0a0a0a] text-white font-sans flex flex-col overflow-hidden select-none h-[100dvh]">
      
      <!-- Ambient Background -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div class="absolute inset-0 opacity-[0.02]" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 30px 30px;"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-10"
             [style.background]="'radial-gradient(circle, ' + (isLocked() ? '#10b981' : '#333') + ' 0%, transparent 70%)'">
        </div>
      </div>

      <!-- Header -->
      <div class="w-full relative z-50 shrink-0 h-14 md:h-16 flex items-center justify-between px-4 pt-safe-top backdrop-blur-md bg-black/20 border-b border-white/5">
        <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-zinc-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button (click)="toggleMic()" 
                class="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 transition-all font-bold tracking-widest text-[10px] md:text-xs"
                [class.bg-emerald-500]="isListening()"
                [class.text-white]="isListening()"
                [class.bg-zinc-900]="!isListening()">
          <div class="w-2 h-2 rounded-full bg-current transition-all" [class.animate-pulse]="isListening()"></div>
          {{ isListening() ? 'SINTONIZANDO' : 'MANUAL' }}
        </button>
        
        <div class="w-10"></div> <!-- Spacer -->
      </div>

      <!-- Main Content Container -->
      <div class="flex-1 relative flex flex-col w-full max-w-lg mx-auto md:max-w-4xl overflow-hidden">
        
        <!-- Pitch Display Area (Top) -->
        <div class="relative w-full flex flex-col items-center justify-end z-40 shrink-0 h-[35vh] min-h-[220px]">
          
          <!-- Guidance Message -->
          <div class="absolute top-4 transition-all duration-300 z-50" *ngIf="currentNote()">
            <div class="flex items-center gap-2 py-2 px-4 rounded-full bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl">
              <svg *ngIf="isFlat()" class="w-4 h-4 text-orange-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7 7-7" /></svg>
              <span class="text-xl md:text-3xl font-black italic tracking-tighter" 
                    [ngClass]="isLocked() ? 'text-emerald-400' : (isFlat() ? 'text-orange-400' : 'text-rose-500')">
                {{ isLocked() ? 'PERFECTO' : (isFlat() ? 'SUBIR' : 'BAJAR') }}
              </span>
              <svg *ngIf="isSharp()" class="w-4 h-4 text-rose-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7-7-7" /></svg>
            </div>
          </div>

          <!-- Meter & Note -->
          <div class="relative flex flex-col items-center justify-center mb-24">
            <!-- Central Needle -->
            <div class="absolute top-[-30px] left-1/2 -translate-x-1/2 w-[2px] h-[140px] z-10"
                 [ngClass]="isLocked() ? 'bg-emerald-400 shadow-[0_0_15px_#10b981]' : 'bg-white/10'"></div>

            <!-- Note Ball -->
            <div class="relative transition-transform duration-200 ease-out z-20"
                 [style.transform]="'translateX(' + meterOffset() + 'px)'">
              <div class="w-16 h-16 md:w-24 md:h-24 rounded-full border-[4px] md:border-[6px] flex flex-col items-center justify-center bg-[#0d0d0d] shadow-2xl transition-all duration-300 overflow-hidden"
                   [ngClass]="{
                     'border-zinc-800 text-zinc-700': !currentNote(),
                     'border-emerald-500 bg-emerald-500 text-white scale-110 shadow-[0_0_50px_#10b98188]': isLocked(),
                     'border-orange-500 text-orange-400': isFlat(),
                     'border-rose-500 text-rose-500': isSharp()
                   }">
                <!-- Gloss removed for cleaner look -->
                <span class="text-3xl md:text-5xl font-black italic tracking-tighter">{{ currentNote()?.note || activeString.label }}</span>
                <span class="text-[10px] font-bold opacity-60 uppercase">{{ currentNote()?.octave ?? activeString.octave }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Instrument Area (Center/Bottom) -->
        <div class="relative flex-1 w-full flex flex-col items-center justify-end">
            
            <!-- Mobile Controls container (Positioned absolutely over the instrument) -->
            <div class="flex md:hidden w-full px-4 justify-between absolute bottom-12 z-50 pointer-events-none">
                <!-- Left Strings -->
                <div class="flex gap-4 flex-col-reverse justify-end pointer-events-auto">
                    <button *ngFor="let s of leftStrings()" (click)="selectString(s)" 
                            class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black transition-all active:scale-95 shadow-lg backdrop-blur-md border border-white/10"
                            [ngClass]="activeString.name === s.name ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/40 scale-110' : 'bg-zinc-900/80 text-zinc-400'">
                        {{ s.label }}
                    </button>
                </div>
                <!-- Right Strings -->
                 <div class="flex gap-4 flex-col-reverse justify-end pointer-events-auto">
                    <button *ngFor="let s of rightStrings()" (click)="selectString(s)" 
                            class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black transition-all active:scale-95 shadow-lg backdrop-blur-md border border-white/10"
                            [ngClass]="activeString.name === s.name ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/40 scale-110' : 'bg-zinc-900/80 text-zinc-400'">
                        {{ s.label }}
                    </button>
                </div>
            </div>

            <!-- Desktop Controls -->
             <div class="hidden md:flex absolute left-10 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
                <button *ngFor="let s of leftStrings()" (click)="selectString(s)" 
                      class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all hover:scale-110 active:scale-95 shadow-xl backdrop-blur-md border border-white/5"
                      [ngClass]="activeString.name === s.name ? 'bg-emerald-500 text-white shadow-emerald-500/50' : 'bg-zinc-900/60 text-zinc-500 hover:bg-zinc-800'">
                {{ s.label }}
               </button>
             </div>
             <div class="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
                <button *ngFor="let s of rightStrings()" (click)="selectString(s)" 
                        class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all hover:scale-110 active:scale-95 shadow-xl backdrop-blur-md border border-white/5"
                        [ngClass]="activeString.name === s.name ? 'bg-emerald-500 text-white shadow-emerald-500/50' : 'bg-zinc-900/60 text-zinc-500 hover:bg-zinc-800'">
                {{ s.label }}
                </button>
             </div>


            <!-- THE INSTRUMENT SVG -->
            <!-- Using absolute positioning and vh units to guarantee visibility and large size -->
            <div class="absolute bottom-0 transform-gpu left-0 right-0 h-[50vh] md:h-[75vh] flex justify-center items-end pointer-events-none z-0">
                 <svg class="h-full w-full overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" viewBox="0 0 300 450" preserveAspectRatio="xMidYMax meet">
                  <defs>
                    <linearGradient id="instrumentWood" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" [attr.stop-color]="currentInstrument.woodBase" />
                      <stop offset="100%" [attr.stop-color]="currentInstrument.woodSide" />
                    </linearGradient>
                    <filter id="glowF"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>

                  <!-- Neck -->
                  <rect x="115" y="320" width="70" height="200" fill="url(#instrumentWood)" rx="4" />
                  <rect x="115" y="320" width="70" height="2" fill="white" opacity="0.1" />

                  <!-- Headstock Body -->
                  <path [attr.d]="currentInstrument.shape" fill="url(#instrumentWood)" stroke="#000" stroke-width="2" />
                  <path [attr.d]="currentInstrument.shape" fill="none" stroke="white" stroke-width="1" opacity="0.05" />

                  <!-- Nut -->
                  <rect [attr.x]="150 - (currentInstrument.nutWidth/2)" y="315" [attr.width]="currentInstrument.nutWidth" height="8" fill="#f0f0f0" rx="1" />

                  <!-- Mechanics & Strings -->
                  <g *ngFor="let s of currentInstrument.strings; let i = index">
                    <!-- Tuner Pegs -->
                    <ng-container [ngSwitch]="currentInstrument.pegType">
                      <!-- Guitar/Chrome -->
                      <g *ngSwitchDefault>
                        <circle [attr.cx]="getPegPos(i).pegX" [attr.cy]="getPegPos(i).pegY" r="8" fill="#1a1a1a" />
                        <rect [attr.x]="getPegPos(i).pegX - (i < currentInstrument.strings.length/2 ? 30 : -10)" 
                              [attr.y]="getPegPos(i).pegY - 6" width="18" height="12" rx="3" 
                              [attr.fill]="isPegActive(i) ? '#10b981' : '#444'" />
                        <circle [attr.cx]="getPegPos(i).postX" [attr.cy]="getPegPos(i).postY" r="5" fill="#333" />
                      </g>
                      <!-- Bass Gears -->
                      <g *ngSwitchCase="'bass-gear'">
                        <circle [attr.cx]="getPegPos(i).pegX" [attr.cy]="getPegPos(i).pegY" r="16" fill="#111" />
                        <circle [attr.cx]="getPegPos(i).pegX" [attr.cy]="getPegPos(i).pegY" r="13" 
                                [attr.fill]="isPegActive(i) ? '#10b981' : '#333'" />
                        <circle [attr.cx]="getPegPos(i).postX" [attr.cy]="getPegPos(i).postY" r="7" fill="#222" />
                      </g>
                      <!-- Violin/Ebony -->
                      <g *ngSwitchCase="'ebony'">
                        <circle [attr.cx]="getPegPos(i).pegX" [attr.cy]="getPegPos(i).pegY" r="9" 
                                [attr.fill]="isPegActive(i) ? '#10b981' : '#0a0a0a'" />
                        <circle [attr.cx]="getPegPos(i).postX" [attr.cy]="getPegPos(i).postY" r="4" fill="#000" />
                      </g>
                      <!-- Ukulele -->
                      <g *ngSwitchCase="'classical'">
                        <circle [attr.cx]="getPegPos(i).pegX" [attr.cy]="getPegPos(i).pegY" r="10" 
                                [attr.fill]="isPegActive(i) ? '#10b981' : '#222'" />
                        <circle [attr.cx]="getPegPos(i).postX" [attr.cy]="getPegPos(i).postY" r="5" fill="#1a1a1a" />
                      </g>
                    </ng-container>

                    <!-- Strings -->
                    <path [attr.d]="getStringPath(i)" fill="none" class="string" 
                          [class.active]="activeString.name === s.name"
                          [attr.stroke-width]="s.width"
                          [attr.stroke]="getStringColor()" />
                  </g>
                </svg>
            </div>
        </div>

      </div>

      <!-- Footer Instrument Switch -->
      <div class="w-full shrink-0 z-[60] px-3 pb-6 bg-black/80 backdrop-blur-xl border-t border-white/5 pt-3 mb-safe-bottom">
        <div class="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2 pb-2">
          <button *ngFor="let inst of instruments" 
                  (click)="setInstrument(inst.id)"
                  class="flex-none px-6 py-3 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border border-transparent whitespace-nowrap"
                  [ngClass]="{
                    'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20': currentInstrument.id === inst.id,
                    'text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-700': currentInstrument.id !== inst.id
                  }">
            {{ inst.name }}
          </button>
        </div>
      </div>
    </div>
  
  `,
  styles: [`
    .string { transition: all 0.3s ease; opacity: 0.2; pointer-events: none; }
    .string.active { opacity: 1; stroke: #10B981; filter: url(#glowF); animation: stringVibrate 0.05s infinite linear; }
    @keyframes stringVibrate { 0% { transform: translateX(0); } 50% { transform: translateX(1px); } 100% { transform: translateX(0); } }
  `]
})
export class TunerComponent implements OnInit, OnDestroy {
  private seoService = inject(SeoService);
  private hapticService = inject(HapticService);
  private router = inject(Router);

  instruments: Instrument[] = [
    {
      id: 'guitar', name: 'Guitarra', type: '3-3', woodBase: '#3D2B1F', woodSide: '#2A1D15', pegType: 'chrome', nutWidth: 70,
      shape: 'M 75 70 Q 75 10 150 10 Q 225 10 225 70 L 235 285 C 235 315 210 325 190 325 L 110 325 C 90 325 65 315 65 285 Z',
      strings: [
        { name: 'E2', freq: 82.41, label: 'E', octave: 2, width: 2.5 },
        { name: 'A2', freq: 110.00, label: 'A', octave: 2, width: 2.2 },
        { name: 'D3', freq: 146.83, label: 'D', octave: 3, width: 1.8 },
        { name: 'G3', freq: 196.00, label: 'G', octave: 3, width: 1.4 },
        { name: 'B3', freq: 246.94, label: 'B', octave: 3, width: 1.1 },
        { name: 'E4', freq: 329.63, label: 'E', octave: 4, width: 0.8 }
      ]
    },
    {
      id: 'bass', name: 'Bajo', type: '2-2', woodBase: '#a1352b', woodSide: '#72251e', pegType: 'bass-gear', nutWidth: 65,
      shape: 'M 90 60 C 90 10 210 10 210 60 L 225 310 L 150 325 L 75 310 Z',
      strings: [
        { name: 'E1', freq: 41.20, label: 'E', octave: 1, width: 4.5 },
        { name: 'A1', freq: 55.00, label: 'A', octave: 1, width: 3.8 },
        { name: 'D2', freq: 73.42, label: 'D', octave: 2, width: 3.2 },
        { name: 'G2', freq: 98.00, label: 'G', octave: 2, width: 2.5 }
      ]
    },
    {
      id: 'ukulele', name: 'Ukulele', type: '2-2', woodBase: '#8d6e63', woodSide: '#5d4037', pegType: 'classical', nutWidth: 42,
      shape: 'M 100 70 L 205 70 L 215 315 L 85 315 Z',
      strings: [
        { name: 'G4', freq: 392.00, label: 'G', octave: 4, width: 1.8 },
        { name: 'C4', freq: 261.63, label: 'C', octave: 4, width: 2.2 },
        { name: 'E4', freq: 329.63, label: 'E', octave: 4, width: 2.0 },
        { name: 'A4', freq: 440.00, label: 'A', octave: 4, width: 1.5 }
      ]
    },
    {
      id: 'violin', name: 'Violín', type: '2-2', woodBase: '#5d4037', woodSide: '#3e2723', pegType: 'ebony', nutWidth: 38,
      shape: 'M 130 10 A 15 15 0 1 1 170 10 L 170 60 L 195 90 L 195 320 L 105 320 L 105 90 L 130 60 Z',
      strings: [
        { name: 'G3', freq: 196.00, label: 'G', octave: 3, width: 1.8 },
        { name: 'D4', freq: 293.66, label: 'D', octave: 4, width: 1.5 },
        { name: 'A4', freq: 440.00, label: 'A', octave: 4, width: 1.2 },
        { name: 'E5', freq: 659.25, label: 'E', octave: 5, width: 0.8 }
      ]
    }
  ];

  currentInstrument = this.instruments[0];
  isListening = signal(false);
  frequency = signal(0);
  currentNote = signal<{ note: string, octave: number, cents: number } | null>(null);
  activeString = this.currentInstrument.strings[0];

  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private requestAnimId: number | null = null;
  private lastManualNotePlay = 0;

  isLocked = computed(() => !!(this.currentNote() && Math.abs(this.currentNote()!.cents) < 4));
  isFlat = computed(() => !!(this.currentNote() && this.currentNote()!.cents < -4));
  isSharp = computed(() => !!(this.currentNote() && this.currentNote()!.cents > 4));
  meterOffset = computed(() => this.currentNote() ? this.currentNote()!.cents * 3.5 : 0);

  ngOnInit() { this.seoService.setMetaTags({ title: 'Afinador Maestro NaxiWeb' }); }
  ngOnDestroy() { this.stopListening(); }

  goBack() { this.router.navigate(['/tools']); }
  setInstrument(id: string) {
    const inst = this.instruments.find(i => i.id === id);
    if (inst) {
      this.currentInstrument = inst;
      this.activeString = inst.strings[0];
      this.currentNote.set(null);
      this.hapticService.medium();
    }
  }

  getStringColor() { return this.currentInstrument.id === 'ukulele' ? '#ffffff' : '#dddddd'; }

  leftStrings() {
    const mid = Math.ceil(this.currentInstrument.strings.length / 2);
    if (this.currentInstrument.id === 'guitar')
      return [this.currentInstrument.strings[2], this.currentInstrument.strings[1], this.currentInstrument.strings[0]];
    return this.currentInstrument.strings.slice(0, mid).reverse();
  }

  rightStrings() {
    const mid = Math.ceil(this.currentInstrument.strings.length / 2);
    if (this.currentInstrument.id === 'guitar')
      return [this.currentInstrument.strings[3], this.currentInstrument.strings[4], this.currentInstrument.strings[5]];
    return this.currentInstrument.strings.slice(mid);
  }

  getPegPos(idx: number) {
    const total = this.currentInstrument.strings.length;
    const mid = Math.ceil(total / 2);
    const onLeft = idx < mid;
    const sideIdx = onLeft ? (mid - 1 - idx) : (idx - mid);
    let startY = 100, step = 70, pegX = onLeft ? 55 : 245, postX = onLeft ? 100 : 200;
    if (total === 4) { startY = 125; step = 100; }
    if (this.currentInstrument.id === 'violin') {
      postX = onLeft ? 140 : 160; pegX = onLeft ? 110 : 190; step = 55; startY = 135;
    }
    return { postX, postY: startY + (sideIdx * step), pegX, pegY: startY + (sideIdx * step) };
  }

  isPegActive(idx: number): boolean { return this.currentInstrument.strings[idx].name === this.activeString.name; }

  getStringPath(idx: number) {
    const p = this.getPegPos(idx);
    const total = this.currentInstrument.strings.length;
    const nw = this.currentInstrument.nutWidth;
    const nx = (150 - (nw / 2)) + (idx * (nw / (total - 1)));
    return `M ${p.postX} ${p.postY} L ${nx} 315 L ${nx} 500`;
  }

  selectString(s: TunerString) { this.activeString = s; this.playTone(s.freq); this.hapticService.light(); }

  toggleMic() { if (this.isListening()) this.stopListening(); else this.initAudio(); }

  private playTone(freq: number) {
    this.lastManualNotePlay = Date.now();
    const ctx = this.audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    this.audioContext = ctx;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'triangle';
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 1.3);
  }

  async initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      this.isListening.set(true);
      this.source = this.audioContext.createMediaStreamSource(s);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096;
      this.source.connect(this.analyser);
      this.detectPitch();
    } catch (e) { this.isListening.set(false); }
  }

  stopListening() {
    if (this.requestAnimId) cancelAnimationFrame(this.requestAnimId);
    if (this.source) { this.source.mediaStream.getTracks().forEach(t => t.stop()); this.source = null; }
    this.isListening.set(false);
  }

  detectPitch() {
    if (!this.analyser || !this.isListening()) return;
    const b = new Float32Array(4096);
    this.analyser.getFloatTimeDomainData(b);
    const freq = this.autoCorrelate(b, this.audioContext!.sampleRate);
    if (freq > -1) {
      this.frequency.set(freq);
      this.currentNote.set(this.getNoteFromPitch(freq));
      if (Date.now() - this.lastManualNotePlay > 2000) this.highlightNearestString(freq);
    }
    this.requestAnimId = requestAnimationFrame(() => this.detectPitch());
  }

  autoCorrelate(buf: Float32Array, sampleRate: number): number {
    let SIZE = buf.length, rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE); if (rms < 0.05) return -1;
    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    buf = buf.slice(r1, r2); SIZE = buf.length;
    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE - i; j++) c[i] += buf[j] * buf[j + i];
    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    let t = maxpos;
    let x1 = c[t - 1], x2 = c[t], x3 = c[t + 1];
    let a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    if (a) t = t - b / (2 * a);
    return sampleRate / t;
  }

  getNoteFromPitch(f: number) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const p = 69 + 12 * Math.log2(f / 440);
    const m = Math.round(p);
    return { note: notes[m % 12], octave: Math.floor(m / 12) - 1, cents: Math.floor((p - m) * 100) };
  }

  highlightNearestString(f: number) {
    let c = this.currentInstrument.strings[0], m = Infinity;
    for (let s of this.currentInstrument.strings) {
      let d = Math.abs(f - s.freq);
      if (d < m) { m = d; c = s; }
    }
    this.activeString = c;
  }
}
