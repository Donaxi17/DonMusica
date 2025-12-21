import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { LanguageService } from './language.service';

export interface BlogPost {
    id: number;
    title: string;
    summary: string;
    category: string;
    image: string;
    date: string;
    content?: string;
    url?: string;
}

@Injectable({
    providedIn: 'root'
})
export class BlogService {
    private languageService = inject(LanguageService);

    // NewsAPI.org - Free tier: 100 requests/day
    private readonly NEWS_API_KEY = '61c9afaf56a340e0b397c879851fe922';
    private readonly NEWS_API_URL = 'https://newsapi.org/v2/everything';

    private mockPosts: BlogPost[] = [
        {
            id: 1,
            title: 'El renacimiento del vinilo en la era digital',
            summary: 'A pesar de la comodidad del streaming, los discos de vinilo están vendiendo más que nunca. Exploramos por qué los audiófilos y coleccionistas están volviendo a lo analógico.',
            category: 'NOTICIAS',
            image: 'https://picsum.photos/seed/vinilo/800/500',
            date: 'Hace 2 horas',
            content: 'El vinilo ha experimentado un resurgimiento notable en los últimos años. Las ventas de discos de vinilo han aumentado constantemente, superando incluso a los CDs en algunos mercados. Los audiófilos valoran la calidad de sonido analógica y la experiencia táctil de manejar un disco físico.'
        },
        {
            id: 2,
            title: 'Los mejores lanzamientos de la semana',
            summary: 'Desde pop alternativo hasta reggaeton, repasamos los álbumes que no puedes dejar de escuchar este fin de semana.',
            category: 'RESEÑAS',
            image: 'https://picsum.photos/seed/lanzamientos/800/500',
            date: 'Hace 5 horas',
            content: 'Esta semana trae una variedad impresionante de nuevos lanzamientos musicales. Desde el esperado álbum de pop alternativo hasta los últimos éxitos del reggaeton, hay algo para todos los gustos.'
        },
        {
            id: 3,
            title: 'Entrevista exclusiva: El futuro del Jazz',
            summary: 'Hablamos con las nuevas promesas que están redefiniendo el género para la Generación Z.',
            category: 'ENTREVISTAS',
            image: 'https://picsum.photos/seed/jazz/800/500',
            date: 'Ayer',
            content: 'El jazz está experimentando una revolución generacional. Jóvenes artistas están fusionando elementos tradicionales con influencias modernas, creando un sonido fresco que atrae a nuevas audiencias.'
        },
        {
            id: 4,
            title: 'La tecnología detrás de los conciertos inmersivos',
            summary: 'Cómo la realidad aumentada y el sonido espacial están cambiando la experiencia de la música en vivo.',
            category: 'TECNOLOGÍA',
            image: 'https://picsum.photos/seed/conciertos/800/500',
            date: 'Hace 2 días',
            content: 'Los conciertos del futuro están aquí. La realidad aumentada, el audio espacial y las tecnologías inmersivas están transformando la forma en que experimentamos la música en vivo, creando experiencias inolvidables.'
        },
        {
            id: 5,
            title: 'Historia del Rock: 50 años de leyendas',
            summary: 'Un recorrido por los momentos más icónicos que marcaron la historia del rock and roll.',
            category: 'HISTORIA',
            image: 'https://picsum.photos/seed/rock/800/500',
            date: 'Hace 3 días',
            content: 'Desde los pioneros de los años 60 hasta las leyendas modernas, el rock and roll ha sido la banda sonora de generaciones. Exploramos los momentos que definieron este género inmortal.'
        },
        {
            id: 6,
            title: 'El impacto del streaming en la industria musical',
            summary: 'Análisis de cómo plataformas como Spotify y Apple Music han transformado el consumo de música.',
            category: 'NOTICIAS',
            image: 'https://picsum.photos/seed/streaming/800/500',
            date: 'Hace 4 días',
            content: 'El streaming ha revolucionado completamente la industria musical. Los artistas ahora tienen acceso directo a audiencias globales, pero también enfrentan nuevos desafíos en términos de monetización.'
        },
        {
            id: 7,
            title: 'Festivales de música 2025: Guía completa',
            summary: 'Los eventos musicales más esperados del año que no te puedes perder.',
            category: 'EVENTOS',
            image: 'https://picsum.photos/seed/festivales/800/500',
            date: 'Hace 5 días',
            content: 'El 2025 promete ser un año épico para los festivales de música. Desde Coachella hasta Glastonbury, repasamos los eventos más importantes y cómo conseguir entradas.'
        }
    ];

    constructor(private http: HttpClient) { }

    getPosts(): Observable<BlogPost[]> {
        // Detectar si estamos en localhost para usar la API (NewsAPI solo permite localhost en plan gratis)
        const isLocal = typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        if (!isLocal) {
            // En producción, usamos directamente los datos mock para evitar el error 426 y saturar la consola
            return of(this.mockPosts).pipe(delay(500));
        }

        // Get current language (es or en)
        const currentLang = this.languageService.currentLanguage();

        // Try to fetch real news, fallback to mock data
        return this.http.get<any>(`${this.NEWS_API_URL}?q=music OR musician OR album OR concert&language=${currentLang}&sortBy=publishedAt&pageSize=19&apiKey=${this.NEWS_API_KEY}`).pipe(
            map(response => {
                if (response.articles && response.articles.length > 0) {
                    return response.articles.map((article: any, index: number) => ({
                        id: index + 1,
                        title: article.title,
                        summary: article.description || article.content?.substring(0, 150) + '...' || 'Sin descripción disponible',
                        category: this.getCategoryFromContent(article.title + ' ' + article.description),
                        image: article.urlToImage || `https://picsum.photos/seed/news${index}/800/500`,
                        date: this.getRelativeTime(article.publishedAt),
                        content: article.content,
                        url: article.url
                    }));
                }
                return this.mockPosts;
            }),
            catchError(err => {
                // No loguear el error completo para no ensuciar la consola si es un error de cuota esperado
                console.log('Using mock blog data (NewsAPI limit reached or not available)');
                return of(this.mockPosts);
            }),
            delay(500)
        );
    }

    private getCategoryFromContent(content: string): string {
        const lowerContent = content.toLowerCase();
        const isSpanish = this.languageService.currentLanguage() === 'es';

        if (isSpanish) {
            if (lowerContent.includes('concierto') || lowerContent.includes('festival') || lowerContent.includes('tour')) return 'EVENTOS';
            if (lowerContent.includes('entrevista') || lowerContent.includes('habla')) return 'ENTREVISTAS';
            if (lowerContent.includes('álbum') || lowerContent.includes('disco') || lowerContent.includes('lanzamiento')) return 'RESEÑAS';
            if (lowerContent.includes('tecnología') || lowerContent.includes('streaming') || lowerContent.includes('app')) return 'TECNOLOGÍA';
            if (lowerContent.includes('historia') || lowerContent.includes('años')) return 'HISTORIA';
            return 'NOTICIAS';
        } else {
            if (lowerContent.includes('concert') || lowerContent.includes('festival') || lowerContent.includes('tour')) return 'EVENTS';
            if (lowerContent.includes('interview') || lowerContent.includes('talks')) return 'INTERVIEWS';
            if (lowerContent.includes('album') || lowerContent.includes('release') || lowerContent.includes('launch')) return 'REVIEWS';
            if (lowerContent.includes('technology') || lowerContent.includes('streaming') || lowerContent.includes('app')) return 'TECH';
            if (lowerContent.includes('history') || lowerContent.includes('years')) return 'HISTORY';
            return 'NEWS';
        }
    }

    private getRelativeTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        const isSpanish = this.languageService.currentLanguage() === 'es';

        if (isSpanish) {
            if (diffHours < 1) return 'Hace unos minutos';
            if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
            if (diffDays === 1) return 'Ayer';
            if (diffDays < 7) return `Hace ${diffDays} días`;
            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
        } else {
            if (diffHours < 1) return 'A few minutes ago';
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
        }
    }
}
