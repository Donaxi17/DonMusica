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

    constructor(private http: HttpClient) { }

    getPosts(): Observable<BlogPost[]> {
        return this.getRSSFeedData();
    }

    private getRSSFeedData(): Observable<BlogPost[]> {
        const currentLang = this.languageService.currentLanguage();

        // RSS Feed URLs
        const feedUrl = currentLang === 'es'
            ? 'https://www.dodmagazine.es/feed/'
            : 'https://pitchfork.com/rss/news/';

        // Use rss2json to convert RSS to JSON and bypass CORS/Captcha issues
        // This service is more reliable than direct XML parsing through a proxy
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

        return this.http.get<any>(apiUrl).pipe(
            map((data: any) => {
                if (!data || data.status !== 'ok') {
                    console.error('RSS2JSON error:', data);
                    return [];
                }

                return data.items.map((item: any, index: number) => {
                    // rss2json extracts images into 'thumbnail'
                    let imageUrl = item.thumbnail || '';

                    // Fallback to searching img tag in content if thumbnail is missing
                    if (!imageUrl && item.content) {
                        const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
                        if (imgMatch && imgMatch[1]) imageUrl = imgMatch[1];
                    }

                    if (!imageUrl) {
                        imageUrl = `https://picsum.photos/seed/music_blog_${index}/800/500`;
                    }

                    let summary = this.cleanHTML(item.content || item.description || '');
                    summary = summary.trim().substring(0, 250);
                    if (summary.length > 0) summary += '...';

                    return {
                        id: index + 1,
                        title: this.cleanHTML(item.title),
                        summary: summary,
                        category: this.getCategoryFromContent(item.title + ' ' + (item.content || '')),
                        image: imageUrl,
                        date: this.getRelativeTime(item.pubDate),
                        content: this.cleanHTML(item.content || item.description),
                        url: item.link
                    } as BlogPost;
                });
            }),
            catchError(err => {
                console.log('RSS feed fetch error:', err);
                return of([]);
            }),
            delay(500)
        );
    }

    private cleanHTML(text: string): string {
        const div = document.createElement('div');
        div.innerHTML = text;
        return div.textContent || div.innerText || '';
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
