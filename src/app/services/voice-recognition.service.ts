import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Injectable({
    providedIn: 'root'
})
export class VoiceRecognitionService {
    recognition: any;
    isListening = false;
    text$ = new Subject<string>();
    isSupported = true;
    volume = signal<number>(0);

    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private javascriptNode: ScriptProcessorNode | null = null;
    private stream: MediaStream | null = null;
    private lastActiveTime = 0;
    private silenceThreshold = 15; // Ajustado para ruidos como un abanico
    private silenceTimeout = 2500; // 2.5 segundos de silencio antes de parar

    constructor() {
        if (typeof window !== 'undefined') {
            if ('webkitSpeechRecognition' in window) {
                this.recognition = new webkitSpeechRecognition();
            } else if ('SpeechRecognition' in window) {
                this.recognition = new SpeechRecognition();
            } else {
                this.isSupported = false;
                return;
            }

            this.recognition.continuous = false;
            this.recognition.lang = 'es-ES';
            this.recognition.interimResults = false;

            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                this.text$.next(transcript);
                this.stop();
            };

            this.recognition.onerror = (event: any) => {
                this.stop();
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };
        }
    }

    start() {
        if (!this.isSupported || !this.recognition) return;
        this.isListening = true;
        this.lastActiveTime = Date.now(); // Resetear tiempo de actividad
        try {
            this.recognition.start();
            this.startVolumeTracking();
        } catch (e) { }
    }

    private async startVolumeTracking() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);
            this.javascriptNode = this.audioContext.createScriptProcessor(2048, 1, 1);

            this.analyser.smoothingTimeConstant = 0.8;
            this.analyser.fftSize = 1024;

            this.microphone.connect(this.analyser);
            this.analyser.connect(this.javascriptNode);
            this.javascriptNode.connect(this.audioContext.destination);

            this.javascriptNode.onaudioprocess = () => {
                const array = new Uint8Array(this.analyser!.frequencyBinCount);
                this.analyser!.getByteFrequencyData(array);
                let values = 0;

                const length = array.length;
                for (let i = 0; i < length; i++) {
                    values += array[i];
                }

                const average = values / length;
                this.volume.set(Math.round(average));

                // Detector de silencio inteligente
                if (average > this.silenceThreshold) {
                    this.lastActiveTime = Date.now();
                } else if (this.isListening && (Date.now() - this.lastActiveTime) > this.silenceTimeout) {
                    // Si ha pasado demasiado tiempo en silencio, forzamos el stop
                    this.stop();
                }
            };
        } catch (e) {
            console.error('Error tracking voice volume', e);
        }
    }

    stop() {
        if (!this.isSupported || !this.recognition) return;
        this.isListening = false;
        this.recognition.stop();
        this.stopVolumeTracking();
    }

    private stopVolumeTracking() {
        if (this.javascriptNode) {
            this.javascriptNode.onaudioprocess = null;
            this.javascriptNode.disconnect();
        }
        if (this.microphone) this.microphone.disconnect();
        if (this.analyser) this.analyser.disconnect();
        if (this.audioContext) this.audioContext.close();
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.volume.set(0);
    }
}
