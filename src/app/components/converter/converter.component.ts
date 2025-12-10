import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
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
    // Cobalt es el mejor: sin anuncios, rápido y limpio
    selectedService: string = 'cobalt';

    readonly SERVICES = [
        {
            id: 'cobalt',
            name: 'Cobalt',
            description: 'El mejor: Sin anuncios, limpio y rápido',
            url: 'https://cobalt.tools/',
            icon: 'shield',
            color: 'text-emerald-500'
        },
        {
            id: 'y2mate',
            name: 'Y2Mate',
            description: 'Alternativa clásica compatible',
            url: 'https://www.y2mate.com/en946',
            icon: 'download',
            color: 'text-blue-500'
        },
        {
            id: 'ssyoutube',
            name: 'SSYouTube',
            description: 'Muy rápido para móviles',
            url: 'https://ssyoutube.com/en/',
            icon: 'zap',
            color: 'text-yellow-500'
        }
    ];

    constructor(
        private toastService: ToastService,
        private titleService: Title,
        private metaService: Meta
    ) { }

    ngOnInit() {
        this.titleService.setTitle('Convertidor MP3 - DonMusica');
    }

    async convert() {
        if (!this.youtubeUrl.trim()) {
            this.toastService.error('Ingresa una URL primero');
            return;
        }

        const service = this.SERVICES.find(s => s.id === this.selectedService);
        if (!service) return;

        // 1. Intentar copiar al portapapeles automáticamente
        try {
            await navigator.clipboard.writeText(this.youtubeUrl);
            this.toastService.success('📋 ¡Enlace copiado! Pégalo en la nueva ventana.');
        } catch (err) {
            this.toastService.info('👉 Copia el enlace y pégalo en el convertidor.');
        }

        // 2. Retraso mínimo para que el usuario vea el mensaje
        setTimeout(() => {
            window.open(service.url, '_blank');
        }, 500);
    }

    selectService(serviceId: string) {
        this.selectedService = serviceId;
        const service = this.SERVICES.find(s => s.id === serviceId);
        if (service) {
            this.toastService.info(`Servicio cambiado a ${service.name}`);
        }
    }

    clearForm() {
        this.youtubeUrl = '';
    }
}
