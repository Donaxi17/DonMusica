import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { LanguageService } from './language.service';

export interface SeoData {
    title: string;
    description?: string;
    image?: string;
    keywords?: string;
    type?: 'website' | 'article' | 'music.song' | 'music.album';
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private languageService = inject(LanguageService);

    private defaultTitle = 'DonMusica - Música Sin Límites';
    private defaultDesc = 'La plataforma definitiva de streaming de música urbana. Escucha, descubre y conecta con los mejores artistas latinos y globales.';
    private defaultImage = 'assets/og-image.jpg'; // Asegúrate de tener esta imagen o cambiarla

    constructor() {
        this.setupRouterListener();
    }

    /**
     * Actualiza las etiquetas SEO manualmente
     */
    updateTags(data: SeoData) {
        const title = data.title ? `${data.title} | DonMusica` : this.defaultTitle;
        const desc = data.description || this.defaultDesc;
        const image = data.image || this.defaultImage;
        const type = data.type || 'website';

        // Title
        this.titleService.setTitle(title);

        // Meta Tags Standard
        this.metaService.updateTag({ name: 'description', content: desc });
        if (data.keywords) {
            this.metaService.updateTag({ name: 'keywords', content: data.keywords });
        }

        // Open Graph (Facebook/WhatsApp)
        this.metaService.updateTag({ property: 'og:title', content: title });
        this.metaService.updateTag({ property: 'og:description', content: desc });
        this.metaService.updateTag({ property: 'og:image', content: image });
        this.metaService.updateTag({ property: 'og:type', content: type });
        this.metaService.updateTag({ property: 'og:site_name', content: 'DonMusica' });
        this.metaService.updateTag({ property: 'og:url', content: this.router.url });

        // Twitter Card
        this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.metaService.updateTag({ name: 'twitter:title', content: title });
        this.metaService.updateTag({ name: 'twitter:description', content: desc });
        this.metaService.updateTag({ name: 'twitter:image', content: image });
    }

    /**
     * Alias for compatibility - Supports (title, desc) or ({...})
     */
    setSeoData(titleOrData: string | SeoData, description?: string) {
        if (typeof titleOrData === 'string') {
            this.updateTags({ title: titleOrData, description });
        } else {
            this.updateTags(titleOrData);
        }
    }

    setMetaTags(data: SeoData) {
        this.updateTags(data);
    }

    /**
     * Escucha cambios de ruta para actualizar SEO basado en data de ruta
     */
    private setupRouterListener() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => this.activatedRoute),
            map(route => {
                while (route.firstChild) route = route.firstChild;
                return route;
            }),
            filter(route => route.outlet === 'primary'),
            mergeMap(route => route.data)
        ).subscribe((event) => {
            // Si la ruta tiene data SEO estática, úsala
            if (event['title']) {
                const titleKey = event['title'];
                const descKey = event['description'];

                // Intentar traducir si es una clave, si no usar el string directo
                const title = this.languageService.get(titleKey) || titleKey;
                const desc = descKey ? (this.languageService.get(descKey) || descKey) : this.defaultDesc;

                this.updateTags({ title, description: desc });
            }
        });
    }
}
