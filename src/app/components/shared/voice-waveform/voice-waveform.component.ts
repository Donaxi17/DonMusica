import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceRecognitionService } from '../../../services/voice-recognition.service';

@Component({
  selector: 'app-voice-visualizer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center gap-1 h-24 max-w-xs mx-auto">
      <div *ngFor="let bar of bars; let i = index" 
           class="w-1.5 bg-emerald-500 rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
           [style.height.px]="getBarHeight(i)"
           [style.opacity]="getOpacity(i)">
      </div>
    </div>
  `,
  styles: [`:host { display: block; width: 100%; }`]
})
export class VoiceVisualizerComponent implements OnInit, OnDestroy {
  private voiceService = inject(VoiceRecognitionService);
  private cdr = inject(ChangeDetectorRef);

  // Create 21 bars for symmetry (center + 10 sides)
  bars = new Array(21).fill(0);
  volume = this.voiceService.volume;
  private animationFrameId: number | null = null;

  ngOnInit() {
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  animate() {
    // Only detect changes if we are listening (or just always for visualizer?)
    // The user says "asul bars don't move", assuming they mean when listening.
    // Forcing update every frame ensures smooth animation
    this.cdr.detectChanges();
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  getBarHeight(index: number): number {
    const vol = this.volume() || 0;

    // Normalize volume (0-100 typical input -> 0-1 multiplier)
    // Audio volume from WebSpeech is weird, often needs boosting.
    const sensitivity = 2.5;
    const normalizedVol = Math.min(1.0, (vol / 100) * sensitivity);

    // Idle state (breathing)
    // If volume is very low, use a simulated idle wave
    const isIdle = normalizedVol < 0.05;

    // Calculate distance from center (0 to 1)
    const center = Math.floor(this.bars.length / 2);
    const dist = Math.abs(index - center);
    const maxDist = center;
    const gaussian = Math.exp(-Math.pow(dist / (maxDist * 0.6), 2)); // Bell curve shape

    // Time-based animation
    const time = Date.now() / 150;

    let h = 0;

    if (isIdle) {
      // Idle Animation: Flowing sine wave
      // height = base + sine(index + time)
      h = 15 + Math.sin((index * 0.5) - time) * 8;
    } else {
      // Active Voice Animation
      // height = base + (max_height * volume * shape) + noise
      const noise = Math.random() * 15;
      h = 10 + (80 * normalizedVol * gaussian) + noise;
    }

    // Clamp values
    return Math.max(8, Math.min(100, h));
  }

  getOpacity(index: number): number {
    // Center bars brighter
    const center = Math.floor(this.bars.length / 2);
    const dist = Math.abs(index - center);
    const opacity = 1 - (dist / this.bars.length) * 0.6;
    return Math.max(0.3, opacity);
  }

}
// End of component