import { Component, OnInit, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-converter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './converter.component.html',
    styleUrls: ['./converter.component.css']
})
export class ConverterComponent implements OnInit {
    youtubeUrl: string = '';
    isLoading: boolean = false;
    showResult: boolean = false;
    error: string = '';

    // Resultados
    videoTitle: string = '';
    videoThumb: string = '';
    downloadUrl: string = '';
    audioFormat: string = 'MP3'; // Por defecto MP3

    // Instancias para probar directamente desde el cliente (bypass Vercel)
    // Nota: Muchas fallarán por CORS, pero vale la pena intentar.
    readonly CLIENT_INSTANCES = [
        'https://api.cobalt.tools',
        'https://api.server.cobalt.tools',
        'https://cobalt.mashedpotat.uno',
        'https://dl.khub.ky',
        'https://cobalt.xy24.eu.org',
    ];

    // Alias para el HTML que espera 'downloadLink'
    get downloadLink(): string {
        return this.downloadUrl;
    }

    constructor(
        private http: HttpClient,
        private toastService: ToastService,
        private titleService: Title,
        private metaService: Meta
    ) { }

    ngOnInit() {
        // --- 1. SEO OPTIMIZATION ---
        this.titleService.setTitle('Convertidor YouTube a MP3 Seguro - DonMusica');

        // Meta Tags básicos
        this.metaService.updateTag({ name: 'description', content: 'Convierte videos de YouTube a MP3 o M4A gratis en DonMusica. Rápido, seguro y compatible con iPhone y Android.' });
        this.metaService.updateTag({ name: 'keywords', content: 'youtube mp3, convertidor youtube, descargar musica, donmusica, youtube a m4a' });
        this.metaService.updateTag({ name: 'robots', content: 'index, follow' });

        // Open Graph & Canonical
        this.metaService.updateTag({ property: 'og:url', content: 'https://donmusica.online/converter' });
        this.metaService.updateTag({ property: 'og:title', content: 'Descarga Música de YouTube Gratis - DonMusica' });
        this.metaService.updateTag({ property: 'og:description', content: 'Convertidor rápido y seguro. Pega tu link y baja tu canción en alta calidad.' });
        this.metaService.updateTag({ property: 'og:image', content: 'https://donmusica.online/assets/icons/icon-512x512.png' });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }

    onUrlChange() {
        this.showResult = false;
        this.error = '';
    }

    convert() {
        if (!this.youtubeUrl) {
            this.toastService.error('Por favor ingresa una URL');
            return;
        }

        this.isLoading = true;
        this.error = '';
        this.showResult = false;

        // Estrategia: 
        // 1. Intentar desde el Cliente (Navegador) -> Evita bloqueo de Vercel
        // 2. Si falla todo, intentar desde el Backend (Vercel/Local) -> Fallback

        this.tryClientSideConversion(0);
    }

    tryClientSideConversion(index: number) {
        if (index >= this.CLIENT_INSTANCES.length) {
            // Si Cobalt cliente falla, probamos Piped cliente (Plan C)
            console.log('Falló Cobalt cliente, intentando Piped cliente...');
            this.tryPipedFallback(0);
            return;
        }

        const host = this.CLIENT_INSTANCES[index];
        const payload = {
            url: this.youtubeUrl,
            downloadMode: 'audio',
            audioFormat: 'mp3'
        };

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        this.http.post<any>(`${host}/api/json`, payload, { headers }).subscribe({
            next: (res) => {
                // Éxito directo desde el cliente!
                this.handleSuccess(res);
            },
            error: (err) => {
                console.warn(`Fallo ${host}, probando siguiente...`, err);
                this.tryClientSideConversion(index + 1);
            }
        });
    }

    // Instancias Piped para fallback cliente (Plan C)
    readonly PIPED_INSTANCES = [
        'https://pipedapi.kavin.rocks',
        'https://pipedapi.tokhmi.xyz',
        'https://piped-api.lunar.icu',
        'https://pipedapi.rivo.lol',
        'https://api.piped.privacydev.net'
    ];

    tryPipedFallback(index: number) {
        if (index >= this.PIPED_INSTANCES.length) {
            // Si todo falla en cliente, vamos al backend
            console.log('Falló todo en cliente, usando backend...');
            this.executeBackendConversion();
            return;
        }

        const host = this.PIPED_INSTANCES[index];
        // Extraer ID
        let videoId = '';
        if (this.youtubeUrl.includes('v=')) {
            videoId = this.youtubeUrl.split('v=')[1].split('&')[0];
        } else if (this.youtubeUrl.includes('youtu.be/')) {
            videoId = this.youtubeUrl.split('youtu.be/')[1].split('?')[0];
        }

        if (!videoId) {
            this.executeBackendConversion();
            return;
        }

        this.http.get<any>(`${host}/streams/${videoId}`).subscribe({
            next: (res) => {
                const audioStreams = res.audioStreams || [];
                // Buscar m4a/mp4
                let bestAudio = audioStreams.find((s: any) => s.mimeType === 'audio/mp4' || s.format === 'M4A');
                if (!bestAudio && audioStreams.length > 0) bestAudio = audioStreams[0];

                if (bestAudio) {
                    this.handleSuccess({
                        success: true,
                        status: 'stream',
                        url: bestAudio.url,
                        filename: res.title,
                        title: res.title,
                        thumbnail: res.thumbnailUrl,
                        format: 'M4A' // Piped suele ser M4A
                    });
                } else {
                    this.tryPipedFallback(index + 1);
                }
            },
            error: () => {
                console.warn(`Fallo Piped ${host}`);
                this.tryPipedFallback(index + 1);
            }
        });
    }

    executeBackendConversion() {
        // Fallback: Estrategia original (Vercel Proxy o Local Server)
        const apiUrl = isDevMode()
            ? 'http://localhost:5000/api/convert'
            : '/api/convert';

        this.http.post<any>(apiUrl, { url: this.youtubeUrl }).subscribe({
            next: (res) => this.handleSuccess(res),
            error: (err) => {
                this.isLoading = false;
                console.error('Error total:', err);

                if (err.error && err.error.error) {
                    this.error = err.error.error;
                } else if (err.status === 503 || err.status === 504) {
                    this.error = 'Servidores ocupados o bloqueados.';
                } else {
                    this.error = 'Error de conexión. Intenta más tarde.';
                }

                this.toastService.error(this.error);
            }
        });
    }

    handleSuccess(res: any) {
        this.isLoading = false;

        if (res.status === 'stream' || res.status === 'redirect' || res.url || res.downloadUrl || res.success) {
            this.showResult = true;
            this.videoTitle = res.filename || res.title || 'Audio Listo';
            this.videoThumb = res.thumbnail || '';
            this.audioFormat = 'MP3';

            // Unificar url de descarga
            const rawUrl = res.url || res.downloadUrl;

            // Si estamos en local y la respuesta vino del backend local, usar proxy
            if (isDevMode() && res.originalUrl) {
                const encodedUrl = encodeURIComponent(res.originalUrl);
                this.downloadUrl = `http://localhost:5000/api/download?url=${encodedUrl}`;
            } else {
                this.downloadUrl = rawUrl;
            }

            this.toastService.success(`¡Convertido a ${this.audioFormat}!`);
        } else {
            this.error = 'Respuesta inesperada del servidor.';
            this.toastService.error(this.error);
        }
    }

    isDownloading: boolean = false;

    downloadFile() {
        if (!this.downloadUrl) return;

        // Feedback inmediato: Preparando
        this.toastService.info('⏳ Preparando archivo, un momento...');
        this.isDownloading = true;

        // Descargamos el archivo como Blob para asegurar que existe antes de confirmar
        this.http.get(this.downloadUrl, { responseType: 'blob' }).subscribe({
            next: (blob: Blob) => {
                this.isDownloading = false;

                // Crear URL temporal para el Blob
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                // Usar el título del video para el nombre del archivo
                const cleanTitle = (this.videoTitle || 'audio').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                link.download = `${cleanTitle}.${this.audioFormat === 'MP3' ? 'mp3' : 'm4a'}`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Liberar memoria
                setTimeout(() => window.URL.revokeObjectURL(url), 100);

                // Mensaje verde confirmando que el navegador tomó el control
                this.toastService.success(`⬇️ Tu descarga ha comenzado`);
            },
            error: (err) => {
                this.isDownloading = false;
                console.error(err);
                this.toastService.error('❌ Error al descargar. Intenta de nuevo.');
            }
        });
    }

    clearForm() {
        this.youtubeUrl = '';
        this.showResult = false;
        this.downloadUrl = '';
        this.error = '';
    }
}
