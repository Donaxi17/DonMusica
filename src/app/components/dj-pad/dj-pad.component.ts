import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Pad {
  id: number;
  label: string;
  color: string; // Hex code or standard name
  key: string;
  type: string;
  active: boolean;
  customBuffer?: AudioBuffer;
}

@Component({
  selector: 'app-dj-pad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dj-pad.component.html',
  styleUrls: ['./dj-pad.component.css']
})
export class DjPadComponent implements OnInit, OnDestroy {
  audioCtx: AudioContext | null = null;

  isEditing = false;
  editingPadId: number | null = null;
  gridSize = 4;
  pads: Pad[] = [];

  activeModalForPadId: number | null = null;
  activeModalTab: 'sounds' | 'colors' = 'sounds';

  // --- MÁS SONIDOS ---
  readonly SOUND_PRESETS = [
    { id: 'kick-808', label: 'Kick 808', category: 'Kick' },
    { id: 'kick-punch', label: 'Kick Punch', category: 'Kick' },
    { id: 'kick-hard', label: 'Kick Hard', category: 'Kick' },
    { id: 'snare-trap', label: 'Snare Trap', category: 'Snare' },
    { id: 'snare-acoustic', label: 'Snare Real', category: 'Snare' },
    { id: 'snare-dry', label: 'Snare Dry', category: 'Snare' },
    { id: 'clap', label: 'Clap', category: 'Perc' },
    { id: 'clap-slap', label: 'Slap', category: 'Perc' },
    { id: 'hihat-closed', label: 'Hi-Hat (C)', category: 'Perc' },
    { id: 'hihat-open', label: 'Hi-Hat (O)', category: 'Perc' },
    { id: 'tom', label: 'Tom Drum', category: 'Perc' },
    { id: 'cowbell', label: 'Cowbell', category: 'Perc' },
    { id: 'crash', label: 'Crash', category: 'Cymbal' },
    { id: 'ride', label: 'Ride', category: 'Cymbal' },
    { id: 'bass-sub', label: 'Sub Bass', category: 'Bass' },
    { id: 'bass-wobble', label: 'Wobble', category: 'Bass' },
    { id: 'bass-pluck', label: 'Pluck Bass', category: 'Bass' },
    { id: 'fx-laser', label: 'Laser', category: 'FX' },
    { id: 'fx-drop', label: 'Drop FX', category: 'FX' },
    { id: 'vox-hey', label: 'Vox "Hey"', category: 'Vox' },
    { id: 'vox-yeah', label: 'Vox "Yeah"', category: 'Vox' },
  ];

  // --- MÁS COLORES (Con valores CSS reales para garantizar brillo) ---
  readonly AVAILABLE_COLORS = [
    { id: 'red', label: 'Red', hex: '#ef4444' },
    { id: 'orange', label: 'Orange', hex: '#f97316' },
    { id: 'amber', label: 'Amber', hex: '#f59e0b' },
    { id: 'yellow', label: 'Yellow', hex: '#eab308' },
    { id: 'lime', label: 'Lime', hex: '#84cc16' },
    { id: 'green', label: 'Green', hex: '#22c55e' },
    { id: 'emerald', label: 'Emerald', hex: '#10b981' },
    { id: 'teal', label: 'Teal', hex: '#14b8a6' },
    { id: 'cyan', label: 'Cyan', hex: '#06b6d4' },
    { id: 'sky', label: 'Sky', hex: '#0ea5e9' },
    { id: 'blue', label: 'Blue', hex: '#3b82f6' },
    { id: 'indigo', label: 'Indigo', hex: '#6366f1' },
    { id: 'violet', label: 'Violet', hex: '#8b5cf6' },
    { id: 'purple', label: 'Purple', hex: '#a855f7' },
    { id: 'fuchsia', label: 'Fuchsia', hex: '#d946ef' },
    { id: 'pink', label: 'Pink', hex: '#ec4899' },
    { id: 'rose', label: 'Rose', hex: '#f43f5e' },
    { id: 'white', label: 'White', hex: '#ffffff' },
  ];

  readonly DEFAULT_KEYS = '1234567890qwertyuiopasdfghjklzxcvbnm'.split('');

  constructor() { }

  ngOnInit() {
    this.createGrid(4);
    this.loadBindings();
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    if (this.audioCtx) this.audioCtx.close();
  }

  // --- Grid Management ---

  createGrid(size: number) {
    this.gridSize = size;
    const totalPads = size * size;
    const newPads: Pad[] = [];

    for (let i = 0; i < totalPads; i++) {
      if (this.pads[i]) {
        newPads.push(this.pads[i]);
      } else {
        newPads.push({
          id: i + 1,
          label: 'PAD ' + (i + 1),
          color: this.getRandomColor().id,
          key: this.DEFAULT_KEYS[i] || '?',
          type: this.getRandomSoundType(),
          active: false
        });
      }
    }
    this.pads = newPads;
  }

  setGridSize(size: number) {
    this.createGrid(size);
    this.saveBindings();
  }

  getRandomColor() {
    return this.AVAILABLE_COLORS[Math.floor(Math.random() * this.AVAILABLE_COLORS.length)];
  }

  getRandomSoundType() {
    return this.SOUND_PRESETS[Math.floor(Math.random() * this.SOUND_PRESETS.length)].id;
  }

  getPadColorHex(colorId: string): string {
    const c = this.AVAILABLE_COLORS.find(c => c.id === colorId);
    return c ? c.hex : '#ffffff';
  }

  // --- Modal Logic ---

  openSettings(padId: number, tab: 'sounds' | 'colors', event: Event) {
    event.stopPropagation();
    this.activeModalForPadId = padId;
    this.activeModalTab = tab;
  }

  closeModal() {
    this.activeModalForPadId = null;
  }

  // Solo reproduce, no asigna
  previewSound(soundId: string, event: Event) {
    event.stopPropagation();
    this.playSoundByType(soundId);
  }

  // Asigna el sonido y cierra
  selectSound(padId: number, soundId: string, label: string, event: Event) {
    event.stopPropagation();
    const pad = this.pads.find(p => p.id === padId);
    if (pad) {
      pad.type = soundId;
      pad.label = label.toUpperCase();
      pad.customBuffer = undefined;
      this.playSound(pad);
      this.closeModal();
      this.saveBindings();
    }
  }

  selectColor(padId: number, colorId: string) {
    const pad = this.pads.find(p => p.id === padId);
    if (pad) {
      pad.color = colorId;
      this.saveBindings();
      this.closeModal();
    }
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    this.editingPadId = null;
    this.closeModal();
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();

    if (key === 'enter') {
      this.isEditing = false;
      this.editingPadId = null;
      this.closeModal();
      return;
    }

    if (this.activeModalForPadId) return;

    if (this.isEditing && this.editingPadId !== null) {
      this.assignKey(this.editingPadId!, key);
      return;
    }

    if (!this.isEditing) {
      const pad = this.pads.find(p => p.key === key);
      if (pad) {
        this.playSound(pad);
      }
    }
  }

  assignKey(padId: number, newKey: string) {
    const pad = this.pads.find(p => p.id === padId);
    if (pad) {
      pad.key = newKey;
      this.saveBindings();
      this.triggerPadActive(pad);
      this.editingPadId = null;
    }
  }

  triggerUpload(padId: number, event: Event) {
    event.stopPropagation();
    const fileInput = document.getElementById(`upload-${padId}`) as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: any, padId: number) {
    const file = event.target.files[0];
    if (!file) return;

    this.initAudio();
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const arrayBuffer = e.target.result;
      this.audioCtx?.decodeAudioData(arrayBuffer, (buffer) => {
        const pad = this.pads.find(p => p.id === padId);
        if (pad) {
          pad.customBuffer = buffer;
          pad.label = file.name.substring(0, 8).toUpperCase();
          this.playSound(pad);
          this.saveBindings();
        }
      });
    };
    reader.readAsArrayBuffer(file);
  }

  saveBindings() {
    if (typeof localStorage !== 'undefined') {
      const data = {
        size: this.gridSize,
        pads: this.pads.map(p => ({
          id: p.id,
          key: p.key,
          type: p.type,
          color: p.color,
          label: p.label
        }))
      };
      localStorage.setItem('dj-pad-config-v2', JSON.stringify(data));
    }
  }

  loadBindings() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('dj-pad-config-v2');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.size) this.createGrid(data.size);

        data.pads.forEach((savedPad: any) => {
          const currentPad = this.pads.find(p => p.id === savedPad.id);
          if (currentPad) {
            currentPad.key = savedPad.key;
            currentPad.type = savedPad.type;
            currentPad.color = savedPad.color;
            currentPad.label = savedPad.label;
          }
        });
      }
    }
  }

  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
  }

  playSound(pad: Pad) {
    this.triggerPadActive(pad);
    this.initAudio();
    if (!this.audioCtx) return;

    if (pad.customBuffer) {
      this.playBuffer(pad.customBuffer);
      return;
    }

    this.playSoundByType(pad.type);
  }

  triggerPadActive(pad: Pad) {
    pad.active = false;
    setTimeout(() => pad.active = true, 5);
    setTimeout(() => pad.active = false, 150);
  }

  // Separated for Preview
  playSoundByType(type: string) {
    this.initAudio();
    if (!this.audioCtx) return;
    const t = this.audioCtx.currentTime;

    switch (type) {
      case 'kick-808': this.synthKick(t, 60, 0.8, 1.0); break;
      case 'kick-punch': this.synthKick(t, 150, 0.2, 0.8); break;
      case 'kick-hard': this.synthKick(t, 120, 0.3, 0.9, 'square'); break;

      case 'snare-trap': this.synthSnare(t, 250, 2000); break;
      case 'snare-acoustic': this.synthSnare(t, 200, 1000); break;
      case 'snare-dry': this.synthSnare(t, 180, 800, 0.05); break;

      case 'clap': this.synthClap(t, 0.15); break;
      case 'clap-slap': this.synthClap(t, 0.08, 1200); break;

      case 'hihat-closed': this.synthHiHat(t, 0.05); break;
      case 'hihat-open': this.synthHiHat(t, 0.3); break;

      case 'tom': this.synthTom(t); break;
      case 'cowbell': this.synthCowbell(t); break;

      case 'crash': this.synthCymbal(t, 1.5, 5000); break;
      case 'ride': this.synthCymbal(t, 0.8, 8000); break;

      case 'bass-sub': this.synthBass(t, 'sine'); break;
      case 'bass-wobble': this.synthBass(t, 'triangle', true); break;
      case 'bass-pluck': this.synthBass(t, 'sawtooth'); break;

      case 'fx-laser': this.synthLaser(t); break;
      case 'fx-drop': this.synthDrop(t); break;

      case 'vox-hey': this.synthVoxHey(t); break;
      case 'vox-yeah': this.synthVoxYeah(t); break;

      default: this.synthKick(t, 100, 0.5, 0.5);
    }
  }

  playBuffer(buffer: AudioBuffer) {
    if (!this.audioCtx) return;
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);
    source.start(0);
  }

  selectPadForEditing(pad: Pad, event: Event) {
    if (!this.isEditing) {
      this.playSound(pad);
      return;
    }
    event.stopPropagation();
    this.editingPadId = pad.id;
  }

  // --- Extended Synths ---

  createOsc(freqStart: number, freqEnd: number, dur: number, type: any, t: number, vol: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, t);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  createNoise(freq: number, dur: number, type: BiquadFilterType, t: number, vol = 0.5) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * dur;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    noise.start(t);
  }

  synthKick(t: number, freq: number, dur: number, vol: number, type = 'sine') {
    this.createOsc(freq, 30, dur, type, t, vol);
  }

  synthSnare(t: number, toneFreq: number, noiseFreq: number, dur = 0.2) {
    if (!this.audioCtx) return;
    this.createOsc(toneFreq, toneFreq / 2, dur / 2, 'triangle', t, 0.5);
    this.createNoise(noiseFreq, dur, 'highpass', t, 0.6);
  }

  synthHiHat(t: number, dur: number) { this.createNoise(8000, dur, 'highpass', t, 0.4); }
  synthClap(t: number, dur: number, freq = 1500) { this.createNoise(freq, dur, 'bandpass', t, 0.6); }
  synthCymbal(t: number, dur: number, freq: number) { this.createNoise(freq, dur, 'highpass', t, 0.3); }

  synthTom(t: number) { this.createOsc(200, 100, 0.3, 'sine', t, 0.8); }
  synthCowbell(t: number) { this.createOsc(800, 800, 0.1, 'square', t, 0.6); }

  synthBass(t: number, type: any, wobble = false) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(60, t);

    if (wobble) {
      osc.frequency.setValueAtTime(50, t);
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.value = 8;
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain); // Amplitude Modulation
      lfo.start(t);
      lfo.stop(t + 0.5);
    } else {
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    }

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    // Filter
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  synthLaser(t: number) { this.createOsc(1200, 200, 0.2, 'sawtooth', t, 0.4); }

  synthDrop(t: number) { this.createOsc(800, 50, 1.0, 'sine', t, 0.8); }

  synthVoxHey(t: number) { this.synthFormant(t, 400, 500, 0.15); }
  synthVoxYeah(t: number) { this.synthFormant(t, 300, 400, 0.3); }

  synthFormant(t: number, freq1: number, freq2: number, dur: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq1, t);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq2, t);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }
}
