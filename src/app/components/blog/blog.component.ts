import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService, BlogPost } from '../../services/blog.service';
import { AdBannerComponent } from '../shared/ad-banner/ad-banner.component';
import { SeoService } from '../../services/seo.service';

interface EvergreenArticle {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    image: string;
    content: string;
}

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [CommonModule, AdBannerComponent],
    templateUrl: './blog.component.html'
})
export class BlogComponent implements OnInit {
    private blogService = inject(BlogService);
    private seoService = inject(SeoService);

    posts = signal<BlogPost[]>([]);
    loading = signal(true);
    selectedPost = signal<BlogPost | null>(null);
    showModal = signal(false);

    // Artículos estáticos "evergreen" sobre música
    evergreenArticles: EvergreenArticle[] = [
        {
            id: 1,
            title: 'Historia del Reggaetón: De Puerto Rico al Mundo',
            excerpt: 'Descubre cómo el reggaetón pasó de ser un movimiento underground en Puerto Rico a convertirse en uno de los géneros musicales más influyentes a nivel mundial.',
            category: 'Historia',
            readTime: '8 min',
            image: 'https://picsum.photos/seed/reggaeton-history/800/500',
            content: `
                <h2>Orígenes del Reggaetón</h2>
                <p>El reggaetón nació en los barrios de Puerto Rico durante los años 90, fusionando el reggae jamaicano, el hip hop estadounidense y ritmos latinos. Este género revolucionario cambió para siempre el panorama musical global.</p>
                
                <h3>Los Pioneros</h3>
                <p>Artistas como Daddy Yankee, Don Omar y Tego Calderón fueron fundamentales en popularizar el género. "Gasolina" de Daddy Yankee (2004) marcó un antes y un después, llevando el reggaetón a las radios mainstream.</p>
                
                <h3>La Evolución Global</h3>
                <p>Desde mediados de los 2010s, el reggaetón experimentó una explosión global con artistas como Bad Bunny, J Balvin y Ozuna dominando las listas de reproducción mundiales, colaborando con artistas de todos los géneros y rompiendo barreras idiomáticas.</p>
                
                <h3>El Reggaetón Hoy</h3>
                <p>Hoy en día, el reggaetón es uno de los géneros más escuchados en plataformas de streaming, con artistas latinoamericanos encabezando charts globales y vendiendo estadios en todo el mundo.</p>
            `
        },
        {
            id: 2,
            title: 'Guía Completa de Géneros Musicales Urbanos',
            excerpt: 'Aprende a diferenciar entre trap, reggaetón, dembow, hip hop y los subgéneros que están definiendo la música urbana actual.',
            category: 'Guías',
            readTime: '10 min',
            image: 'https://picsum.photos/seed/urban-genres/800/500',
            content: `
                <h2>Los Géneros Urbanos Más Populares</h2>
                
                <h3>Reggaetón</h3>
                <p>Caracterizado por su ritmo "Dem Bow", el reggaetón combina letras en español con beats electrónicos y influencias caribeñas. Es el género urbano latino por excelencia.</p>
                
                <h3>Trap Latino</h3>
                <p>Derivado del trap estadounidense, el trap latino incorpora letras en español con beats pesados caracterizados por hi-hats rápidos y bajos profundos. Bad Bunny, Anuel AA y Myke Towers son referentes del género.</p>
                
                <h3>Dembow</h3>
                <p>Originario de República Dominicana, el dembow es conocido por su ritmo acelerado y repetitivo. Artistas como El Alfa han llevado este género a audiencias internacionales.</p>
                
                <h3>Hip Hop Latino</h3>
                <p>La versión latina del hip hop clásico, que mantiene las raíces del rap pero con letras en español y temáticas que resuenan con la cultura latinoamericana.</p>
            `
        },
        {
            id: 3,
            title: 'Cómo Crear la Playlist Perfecta: Tips de Expertos',
            excerpt: 'Consejos profesionales para crear playlists que fluyan perfectamente, ya sea para una fiesta, entrenamien to o estudio.',
            category: 'Tips',
            readTime: '6 min',
            image: 'https://picsum.photos/seed/playlist-tips/800/500',
            content: `
                <h2>El Arte de Curar Playlists</h2>
                
                <h3>1. Define el Propósito</h3>
                <p>Antes de agregar canciones, pregúntate: ¿Es para hacer ejercicio? ¿Para estudiar? ¿Para una fiesta? El propósito definirá el tempo, energía y género de las canciones.</p>
                
                <h3>2. Considera el Flujo Musical</h3>
                <p>Las mejores playlists tienen un arco narrativo. Comienza con canciones que establezcan el mood, alcanza un clímax en el medio, y cierra con tracks memorables.</p>
                
                <h3>3. Varía Pero Mantén Coherencia</h3>
                <p>Incluye variedad dentro del mismo género o mood. Alterna entre artistas populares y descubrimientos nuevos para mantener la playlist fresca pero cohesiva.</p>
                
                <h3>4. Duración Ideal</h3>
                <p>Para playlists de entrenamiento: 45-60 minutos. Para trabajo/estudio: 2-3 horas. Para fiestas: 3-4 horas. Ajusta según tu necesidad.</p>
                
                <h3>5. Actualiza Regularmente</h3>
                <p>Las mejores playlists evolucionan. Agrega nuevos lanzamientos, quita canciones que ya no funcionan, y mantén tu colección fresca.</p>
            `
        },
        {
            id: 4,
            title: 'La Revolución del Streaming Musical: Cómo Cambió la Industria',
            excerpt: 'Análisis profundo de cómo Spotify, Apple Music y YouTube transformaron completamente la forma en que consumimos y descubrimos música.',
            category: 'Industria',
            readTime: '12 min',
            image: 'https://picsum.photos/seed/streaming-revolution/800/500',
            content: `
                <h2>Del CD al Streaming</h2>
                
                <h3>El Fin de la Era Física</h3>
                <p>En apenas 15 años, pasamos de comprar CDs físicos a tener millones de canciones en nuestro bolsillo. Las ventas de música física cayeron 80% mientras el streaming creció exponencialmente.</p>
                
                <h3>Democratización del Acceso</h3>
                <p>El streaming democratizó el acceso a la música. Por menos de $10 al mes, cualquiera puede escuchar prácticamente cualquier canción jamás grabada. Esto era impensable hace 20 años.</p>
                
                <h3>Nuevas Oportunidades para Artistas</h3>
                <p>Artistas independientes ahora pueden alcanzar audiencias globales sin necesidad de grandes sellos discográficos. Plataformas como SoundCloud, Spotify y YouTube han lanzado carreras de artistas que nunca tuvieron un contrato tradicional.</p>
                
                <h3>El Poder de los Algoritmos</h3>
                <p>Los algoritmos de recomendación han cambiado cómo descubrimos música. Discover Weekly de Spotify y otros sistemas de recomendación exponen a los oyentes a artistas que nunca hubieran encontrado de otra manera.</p>
                
                <h3>Desafíos y Controversias</h3>
                <p>No todo es perfecto. La compensación a artistas por stream sigue siendo controversial, con muchos músicos argumentando que necesitan millones de reproducciones para ganar lo que antes ganaban con un álbum vendido.</p>
            `
        },
        {
            id: 5,
            title: 'Música Para Mejorar la Productividad: Lo Que Dice la Ciencia',
            excerpt: 'Estudios científicos revelan qué tipo de música realmente ayuda a concentrarse y ser más productivo en el trabajo o estudio.',
            category: 'Ciencia',
            readTime: '7 min',
            image: 'https://picsum.photos/seed/productivity-music/800/500',
            content: `
                <h2>La Ciencia Detrás de la Música y la Productividad</h2>
                
                <h3>El Efecto Mozart</h3>
                <p>Estudios han demostrado que escuchar música clásica, especialmente Mozart, puede mejorar temporalmente el razonamiento espacial y la capacidad de concentración.</p>
                
                <h3>Lo-Fi Hip Hop: El Favorito de Estudiantes</h3>
                <p>Los beats relajados y repetitivos del lo-fi hip hop han demostrado ayudar a mantener el enfoque sin distraer. Su estructura predecible permite que el cerebro entre en "modo trabajo".</p>
                
                <h3>Música Sin Letra</h3>
                <p>Para tareas que requieren procesamiento de lenguaje (escribir, leer), la música instrumental es superior a la música con letra, que puede competir por los mismos recursos cognitivos.</p>
                
                <h3>El Volumen Importa</h3>
                <p>El volumen ideal para trabajar es bajo a moderado (50-70 dB). Demasiado alto causa fatiga cognitiva, muy bajo no proporciona los beneficios del "ruido ambiental".</p>
                
                <h3>Cada Cerebro es Diferente</h3>
                <p>Lo más importante: lo que funciona para ti es único. Experimenta con diferentes géneros y encuentra tu combinación perfecta de música y productividad.</p>
            `
        },
        {
            id: 6,
            title: 'Festivales de Música 2025: Guía de los Imperdibles',
            excerpt: 'Los festivales de música latinoamericanos y mundiales que no puedes perderte este año, desde Coachella hasta Lollapalooza.',
            category: 'Eventos',
            readTime: '9 min',
            image: 'https://picsum.photos/seed/festivals-2025/800/500',
            content: `
                <h2>Los Mejores Festivales del Año</h2>
                
                <h3>Coachella (California, USA)</h3>
                <p>El festival más icónico del mundo regresa en abril con un lineup espectacular que mezcla headliners globales con artistas emergentes. Dos fines de semana de música, arte y moda en el desierto.</p>
                
                <h3>Lollapalooza (Multiple Ciudades)</h3>
                <p>Con ediciones en Chicago, Buenos Aires, Santiago, São Paulo y más, Lollapalooza lleva lo mejor del rock, pop, hip hop y electrónica a múltiples continentes. Ideal para fans de la diversidad musical.</p>
                
                <h3>Tomorrowland (Bélgica)</h3>
                <p>El paraíso de la música electrónica. Con producciones impresionantes y los mejores DJs del mundo, Tomorrowland es una experiencia de otro nivel para amantes del EDM.</p>
                
                <h3>Estéreo Picnic (Colombia)</h3>
                <p>El festival más grande de Colombia trae lo mejor de la música alternativa, rock y urbana a Bogotá. Un must para la escena latinoamericana.</p>
                
                <h3>Consejos Para Festivales</h3>
                <p>1. Compra boletos early bird para mejores precios<br>
                   2. Estudia el lineup y haz tu itinerario<br>
                   3. Llega temprano para buenos spots<br>
                   4. Hidrátate constantemente<br>
                   5. Carga portátil es esencial</p>
            `
        }
    ];

    selectedEvergreenArticle = signal<EvergreenArticle | null>(null);
    showEvergreenModal = signal(false);

    ngOnInit() {
        this.seoService.setSeoData(
            'Blog de Música | Noticias, Guías y Artículos sobre Música',
            'Las últimas noticias musicales, guías completas sobre géneros, historia de la música y consejos de expertos. Tu fuente definitiva de contenido musical.'
        );

        this.blogService.getPosts().subscribe(data => {
            this.posts.set(data);
            this.loading.set(false);
        });
    }

    openPost(post: BlogPost) {
        this.selectedPost.set(post);
        this.showModal.set(true);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.showModal.set(false);
        this.selectedPost.set(null);
        document.body.style.overflow = 'auto';
    }

    openEvergreenArticle(article: EvergreenArticle) {
        this.selectedEvergreenArticle.set(article);
        this.showEvergreenModal.set(true);
        document.body.style.overflow = 'hidden';
    }

    closeEvergreenModal() {
        this.showEvergreenModal.set(false);
        this.selectedEvergreenArticle.set(null);
        document.body.style.overflow = 'auto';
    }

    onImageError(event: any, id: any) {
        event.target.src = `https://picsum.photos/seed/music${id}/800/500`;
    }
}
