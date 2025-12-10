import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-converter',
    standalone: true,
    imports: [CommonModule, FormsModule, SvgIconComponent],
    templateUrl: './converter.component.html',
    styleUrls: ['./converter.component.css']
})
export class ConverterComponent implements OnInit {
    youtubeUrl: string = '';
    isLoading: boolean = false;
    showResult: boolean = false;
    error: string = '';

    // Resultados
    downloadUrl: string = '';
    fileName: string = '';

    // Instancias de Piped (Más amigables con CORS y permiten stream directo)
    readonly PIPED_INSTANCES = [
        'https://pipedapi.kavin.rocks',
        'https://pipedapi.tokhmi.xyz',
        'https://piped-api.lunar.icu',
        'https://api.piped.privacydev.net',
        'https://pipedapi.rivo.lol'
    ];

    constructor(
        private http: HttpClient,
        private toastService: ToastService,
        private titleService: Title,
        private metaService: Meta
    ) { }

    ngOnInit() {
        this.titleService.setTitle('Convertidor de Música - DonMusica');
    }

    convert() {
        if (!this.youtubeUrl.trim()) return;

        // Extraer ID de video
        let videoId = '';
        try {
            if (this.youtubeUrl.includes('v=')) {
                videoId = this.youtubeUrl.split('v=')[1].split('&')[0];
            } else if (this.youtubeUrl.includes('youtu.be/')) {
                videoId = this.youtubeUrl.split('youtu.be/')[1].split('?')[0];
            } else if (this.youtubeUrl.includes('shorts/')) {
                videoId = this.youtubeUrl.split('shorts/')[1].split('?')[0];
            }
        } catch (e) {
            this.toastService.error('Enlace inválido');
            return;
        }

        if (!videoId || videoId.length !== 11) {
            this.toastService.error('No se pudo encontrar el ID del video');
            return;
        }

        this.isLoading = true;
        this.error = '';
        this.showResult = false;

        // Iniciar búsqueda en cascada
        this.tryPiped(0, videoId);
    }

    tryPiped(index: number, videoId: string) {
        if (index >= this.PIPED_INSTANCES.length) {
            this.isLoading = false;
            this.error = 'No se pudo conectar con los servidores. Es posible que el navegador esté bloqueando la conexión (CORS) en modo local.';
            return;
        }

        const instance = this.PIPED_INSTANCES[index];
        console.log(`Conectando a ${instance}...`);

        this.http.get<any>(`${instance}/streams/${videoId}`).subscribe({
            next: (res) => {
                // Filtrar solo audios
                const audioStreams = res.audioStreams || [];

                // Buscar el mejor audio (M4A es el estándar de Piped, similar a MP3)
                // Buscamos 'audio/mp4' que es m4a de alta calidad
                let bestAudio = audioStreams.find((s: any) => s.mimeType === 'audio/mp4');

                if (!bestAudio && audioStreams.length > 0) {
                    bestAudio = audioStreams[0]; // Fallback al primero disponible
                }

                if (bestAudio) {
                    this.handleSuccess(res.title, bestAudio.url);
                } else {
                    this.tryPiped(index + 1, videoId);
                }
            },
            error: (err) => {
                console.warn(`Falló ${instance}`, err);
                this.tryPiped(index + 1, videoId);
            }
        });
    }

    handleSuccess(title: string, url: string) {
        this.isLoading = false;
        this.showResult = true;
        this.downloadUrl = url;
        // Limpiamos el título para evitar problemas con caracteres especiales
        const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, '');
        this.fileName = `${cleanTitle}.m4a`;
        this.toastService.success('¡Audio listo!');
    }

    download() {
        if (!this.downloadUrl) return;
        window.open(this.downloadUrl, '_blank');
    }

    clearForm() {
        this.youtubeUrl = '';
        this.showResult = false;
        this.error = '';
        this.downloadUrl = '';
    }
}
