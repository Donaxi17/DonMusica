import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private titleService = inject(Title);
    private metaService = inject(Meta);

    setSeoData(title: string, description: string) {
        this.setMetaTags({ title, description });
    }

    setMetaTags(config: { title?: string, description?: string, keywords?: string, image?: string }) {
        const appTitle = config.title ? `${config.title} | DonMusica` : 'DonMusica';

        // Set Title
        this.titleService.setTitle(appTitle);

        // Set Meta Tags
        if (config.description) {
            this.metaService.updateTag({ name: 'description', content: config.description });
            this.metaService.updateTag({ property: 'og:description', content: config.description });
            this.metaService.updateTag({ name: 'twitter:description', content: config.description });
        }

        if (config.keywords) {
            this.metaService.updateTag({ name: 'keywords', content: config.keywords });
        }

        if (config.image) {
            this.metaService.updateTag({ property: 'og:image', content: config.image });
            this.metaService.updateTag({ name: 'twitter:image', content: config.image });
        }

        this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.metaService.updateTag({ property: 'og:title', content: appTitle });
        this.metaService.updateTag({ name: 'twitter:title', content: appTitle });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }
}
