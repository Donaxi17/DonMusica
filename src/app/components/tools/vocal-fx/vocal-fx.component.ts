import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-vocal-fx',
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
            <h1 class="text-3xl font-black text-white mb-2">Vocal FX</h1>
            <p class="text-zinc-500">Graba tu voz y aplica efectos en tiempo real.</p>
         </div>

         <!-- Recorder Visual -->
         <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative shadow-2xl overflow-hidden">
             
             <!-- Visualization Stand-in -->
             <div class="h-32 bg-black/50 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                 <div *ngIf="!isRecording && !audioData" class="text-zinc-600 font-mono text-sm">ESPERANDO GRABACIÓN...</div>
                 
                 <!-- Recording Wave -->
                 <div *ngIf="isRecording" class="flex items-center gap-1 h-12">
                     <div class="w-1.5 bg-pink-500 rounded-full animate-music-bar h-8"></div>
                     <div class="w-1.5 bg-pink-500 rounded-full animate-music-bar h-12 animation-delay-75"></div>
                     <div class="w-1.5 bg-pink-500 rounded-full animate-music-bar h-6 animation-delay-150"></div>
                     <div class="w-1.5 bg-pink-500 rounded-full animate-music-bar h-10"></div>
                     <div class="w-1.5 bg-pink-500 rounded-full animate-music-bar h-4 animation-delay-75"></div>
                 </div>

                 <!-- Ready Badge -->
                 <div *ngIf="audioData && !isRecording" class="text-emerald-400 font-bold flex flex-col items-center animate-fade-in">
                     <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                     AUDIO GUARDADO
                 </div>
             </div>

             <!-- Controls -->
             <div class="flex gap-4 mb-8">
                 <button (click)="toggleRecording()" 
                    [class.bg-red-500]="isRecording" [class.hover:bg-red-600]="isRecording"
                    [class.bg-zinc-800]="!isRecording" [class.hover:bg-zinc-700]="!isRecording"
                    class="flex-1 py-4 rounded-xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                    <div [class.bg-white]="isRecording" [class.bg-red-500]="!isRecording" class="w-3 h-3 rounded-full"></div>
                    {{ isRecording ? 'PARAR' : 'GRABAR' }}
                 </button>

                 <button (click)="clearAudio()" [disabled]="!audioData"
                    class="w-14 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                 </button>
             </div>

             <!-- FX Grid -->
             <div class="grid grid-cols-2 gap-3" [class.opacity-50]="!audioData" [class.pointer-events-none]="!audioData">
                 <button (click)="playEffect('normal')" class="bg-zinc-800 p-4 rounded-xl text-left hover:bg-zinc-700 transition-colors group">
                     <div class="text-[10px] text-zinc-500 font-bold mb-1">ORIGINAL</div>
                     <div class="text-white font-bold group-hover:text-emerald-400">Normal</div>
                 </button>
                 <button (click)="playEffect('robot')" class="bg-zinc-800 p-4 rounded-xl text-left hover:bg-zinc-700 transition-colors group">
                     <div class="text-[10px] text-zinc-500 font-bold mb-1">FX</div>
                     <div class="text-white font-bold group-hover:text-purple-400">Robot 🤖</div>
                 </button>
                 <button (click)="playEffect('chipmunk')" class="bg-zinc-800 p-4 rounded-xl text-left hover:bg-zinc-700 transition-colors group">
                     <div class="text-[10px] text-zinc-500 font-bold mb-1">FX</div>
                     <div class="text-white font-bold group-hover:text-orange-400">Ardilla 🐿️</div>
                 </button>
                 <button (click)="playEffect('monster')" class="bg-zinc-800 p-4 rounded-xl text-left hover:bg-zinc-700 transition-colors group">
                     <div class="text-[10px] text-zinc-500 font-bold mb-1">FX</div>
                     <div class="text-white font-bold group-hover:text-red-400">Monstruo 👹</div>
                 </button>
             </div>

         </div>
      </div>
    </div>
  `,
    styles: [`
    .animate-music-bar {
       animation: bounce 1s infinite;
    }
    @keyframes bounce {
        0%, 100% { transform: scaleY(0.5); }
        50% { transform: scaleY(1); }
    }
    .animation-delay-75 { animation-delay: 75ms; }
    .animation-delay-150 { animation-delay: 150ms; }
  `]
})
export class VocalFxComponent implements OnDestroy {
    isRecording = false;
    mediaRecorder: MediaRecorder | null = null;
    audioChunks: Blob[] = [];
    audioData: Blob | null = null;
    audioContext: AudioContext | null = null;

    constructor(private router: Router, private toastService: ToastService) { }

    goBack() {
        this.router.navigate(['/tools']);
    }

    // Init Audio Context Lazy
    getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    async toggleRecording() {
        if (this.isRecording) {
            this.mediaRecorder?.stop();
            this.isRecording = false;
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];

                this.mediaRecorder.ondataavailable = (event) => {
                    this.audioChunks.push(event.data);
                };

                this.mediaRecorder.onstop = () => {
                    this.audioData = new Blob(this.audioChunks, { type: 'audio/webm' });
                };

                this.mediaRecorder.start();
                this.isRecording = true;
            } catch (err) {
                this.toastService.error('Necesitamos acceso al micrófono para grabar.');
            }
        }
    }

    clearAudio() {
        this.audioData = null;
        this.audioChunks = [];
    }

    playEffect(type: 'normal' | 'robot' | 'chipmunk' | 'monster') {
        if (!this.audioData) return;

        const url = URL.createObjectURL(this.audioData);
        const audio = new Audio(url);
        const ctx = this.getAudioContext();
        const source = ctx.createMediaElementSource(audio);

        if (type === 'normal') {
            source.connect(ctx.destination);
        } else if (type === 'chipmunk') {
            audio.playbackRate = 1.5;
            audio.preservesPitch = false;
            source.connect(ctx.destination);
        } else if (type === 'monster') {
            audio.playbackRate = 0.7;
            audio.preservesPitch = false;
            source.connect(ctx.destination);
        } else if (type === 'robot') {
            const delay = ctx.createDelay();
            delay.delayTime.value = 0.02;
            const feedback = ctx.createGain();
            feedback.gain.value = 0.8;
            source.connect(delay);
            delay.connect(feedback);
            feedback.connect(delay);
            source.connect(ctx.destination);
            delay.connect(ctx.destination);
        }

        audio.play();
    }

    ngOnDestroy() {
        if (this.audioContext) this.audioContext.close();
    }
}
