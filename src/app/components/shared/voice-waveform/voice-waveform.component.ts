import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceRecognitionService } from '../../../services/voice-recognition.service';

@Component({
    selector: 'app-voice-waveform',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex items-center justify-center gap-1 h-12 py-2">
      <div *ngFor="let bar of bars; let i = index" 
           class="w-1.5 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-full transition-all duration-75"
           [style.height.%]="getBarHeight(i)"
           [style.opacity]="0.4 + (getBarHeight(i) / 100) * 0.6">
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class VoiceWaveformComponent {
    private voiceService = inject(VoiceRecognitionService);

    // Create 15 bars for the waveform
    bars = new Array(15).fill(0);

    volume = this.voiceService.volume;

    getBarHeight(index: number): number {
        const vol = this.volume();
        if (vol === 0) return 20; // Minimum height

        // Create a natural "wave" shape by adding some variance based on index
        const variance = Math.sin((index / this.bars.length) * Math.PI) * 0.5 + 0.5;
        const baseHeight = (vol / 128) * 100; // 128 is a reasonable max average volume

        return Math.max(20, Math.min(100, baseHeight * (0.5 + Math.random() * 0.5) * variance * 2));
    }
}
