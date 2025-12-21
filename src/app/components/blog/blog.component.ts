import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService, BlogPost } from '../../services/blog.service';
import { AdsContainerComponent } from '../shared/ads-container/ads-container.component';
import { SeoService } from '../../services/seo.service';
import { NetworkService } from '../../services/network.service';
import { NoConnectionComponent } from '../shared/no-connection/no-connection.component';
import { LanguageService } from '../../services/language.service';

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
    imports: [CommonModule, AdsContainerComponent, NoConnectionComponent],
    templateUrl: './blog.component.html'
})
export class BlogComponent implements OnInit {
    networkService = inject(NetworkService);
    private blogService = inject(BlogService);
    private seoService = inject(SeoService);
    languageService = inject(LanguageService);

    posts = signal<BlogPost[]>([]);
    loading = signal(true);
    selectedPost = signal<BlogPost | null>(null);
    showModal = signal(false);

    // Artículos estáticos "evergreen" sobre música
    evergreenArticlesES: EvergreenArticle[] = [
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

    evergreenArticlesEN: EvergreenArticle[] = [
        {
            id: 1,
            title: 'History of Reggaeton: From Puerto Rico to the World',
            excerpt: 'Discover how reggaeton went from an underground movement in Puerto Rico to becoming one of the most influential musical genres worldwide.',
            category: 'History',
            readTime: '8 min',
            image: 'https://picsum.photos/seed/reggaeton-history/800/500',
            content: `
                <h2>Origins of Reggaeton</h2>
                <p>Reggaeton was born in the neighborhoods of Puerto Rico during the 90s, fusioning Jamaican reggae, US hip hop, and Latin rhythms. This revolutionary genre changed the global music landscape forever.</p>
                
                <h3>The Pioneers</h3>
                <p>Artists like Daddy Yankee, Don Omar, and Tego Calderon were fundamental in popularizing the genre. Daddy Yankee's "Gasolina" (2004) marked a turning point, bringing reggaeton to mainstream radio.</p>
                
                <h3>Global Evolution</h3>
                <p>Since the mid-2010s, reggaeton experienced a global explosion with artists like Bad Bunny, J Balvin, and Ozuna dominating global playlists, collaborating with artists of all genres and breaking language barriers.</p>
                
                <h3>Reggaeton Today</h3>
                <p>Today, reggaeton is one of the most listened genres on streaming platforms, with Latin American artists topping global charts and selling out stadiums worldwide.</p>
            `
        },
        {
            id: 2,
            title: 'Complete Guide to Urban Music Genres',
            excerpt: 'Learn to differentiate between trap, reggaeton, dembow, hip hop and the subgenres defining current urban music.',
            category: 'Guides',
            readTime: '10 min',
            image: 'https://picsum.photos/seed/urban-genres/800/500',
            content: `
                <h2>Most Popular Urban Genres</h2>
                
                <h3>Reggaeton</h3>
                <p>Characterized by its "Dem Bow" rhythm, reggaeton combines Spanish lyrics with electronic beats and Caribbean influences. It's the ultimate Latin urban genre.</p>
                
                <h3>Latin Trap</h3>
                <p>Derived from US trap, Latin trap incorporates Spanish lyrics with heavy beats characterized by fast hi-hats and deep bass. Bad Bunny, Anuel AA, and Myke Towers are genre icons.</p>
                
                <h3>Dembow</h3>
                <p>Originating in the Dominican Republic, dembow is known for its fast and repetitive rhythm. Artists like El Alfa have taken this genre to international audiences.</p>
                
                <h3>Latin Hip Hop</h3>
                <p>The Latin version of classic hip hop, maintaining rap roots but with Spanish lyrics and themes resonating with Latin American culture.</p>
            `
        },
        {
            id: 3,
            title: 'How to Create the Perfect Playlist: Expert Tips',
            excerpt: 'Professional advice for creating playlists that flow perfectly, whether for a party, workout, or study.',
            category: 'Tips',
            readTime: '6 min',
            image: 'https://picsum.photos/seed/playlist-tips/800/500',
            content: `
                <h2>The Art of Curating Playlists</h2>
                
                <h3>1. Define the Purpose</h3>
                <p>Before adding songs, ask yourself: Is it for exercise? To study? For a party? The purpose will define the tempo, energy, and genre of the songs.</p>
                
                <h3>2. Consider Music Flow</h3>
                <p>The best playlists have a narrative arc. Start with songs that set the mood, reach a climax in the middle, and close with memorable tracks.</p>
                
                <h3>3. Vary but Keep Coherence</h3>
                <p>Include variety within the same genre or mood. Alternate between popular artists and new discoveries to keep the playlist fresh but cohesive.</p>
                
                <h3>4. Ideal Duration</h3>
                <p>For workout playlists: 45-60 minutes. For work/study: 2-3 hours. For parties: 3-4 hours. Adjust to your needs.</p>
                
                <h3>5. Update Regularly</h3>
                <p>The best playlists evolve. Add new releases, remove songs that no longer work, and keep your collection fresh.</p>
            `
        },
        {
            id: 4,
            title: 'The Music Streaming Revolution: How It Changed the Industry',
            excerpt: 'Deep analysis of how Spotify, Apple Music, and YouTube completely transformed how we consume and discover music.',
            category: 'Industry',
            readTime: '12 min',
            image: 'https://picsum.photos/seed/streaming-revolution/800/500',
            content: `
                <h2>From CD to Streaming</h2>
                
                <h3>The End of the Physical Era</h3>
                <p>In just 15 years, we went from buying physical CDs to having millions of songs in our pockets. Physical music sales dropped 80% while streaming grew exponentially.</p>
                
                <h3>Democratization of Access</h3>
                <p>Streaming democratized access to music. For less than $10 a month, anyone can listen to practically any song ever recorded. This was unthinkable 20 years ago.</p>
                
                <h3>New Opportunities for Artists</h3>
                <p>Independent artists can now reach global audiences without needing large record labels. Platforms like SoundCloud, Spotify, and YouTube have launched careers of artists who never had a traditional contract.</p>
                
                <h3>The Power of Algorithms</h3>
                <p>Recommendation algorithms have changed how we discover music. Spotify's Discover Weekly and other recommendation systems expose listeners to artists they would never have found otherwise.</p>
                
                <h3>Challenges and Controversies</h3>
                <p>Not everything is perfect. Artist compensation per stream remains controversial, with many musicians arguing they need millions of plays to earn what they previously made with one sold album.</p>
            `
        },
        {
            id: 5,
            title: 'Music to Improve Productivity: What Science Says',
            excerpt: 'Scientific studies reveal what type of music actually helps concentrate and be more productive at work or study.',
            category: 'Science',
            readTime: '7 min',
            image: 'https://picsum.photos/seed/productivity-music/800/500',
            content: `
                <h2>The Science Behind Music and Productivity</h2>
                
                <h3>The Mozart Effect</h3>
                <p>Studies have shown that listening to classical music, especially Mozart, can temporarily improve spatial reasoning and concentration capacity.</p>
                
                <h3>Lo-Fi Hip Hop: Student Favorite</h3>
                <p>The relaxed and repetitive beats of lo-fi hip hop have shown to help maintain focus without distracting. Its predictable structure allows the brain to enter "work mode".</p>
                
                <h3>Music Without Lyrics</h3>
                <p>For tasks requiring language processing (writing, reading), instrumental music is superior to music with lyrics, which can compete for the same cognitive resources.</p>
                
                <h3>Volume Matters</h3>
                <p>The ideal volume to work is low to moderate (50-70 dB). Too loud causes cognitive fatigue, too low doesn't provide "ambient noise" benefits.</p>
                
                <h3>Every Brain Is Different</h3>
                <p>Most important: what works for you is unique. Experiment with different genres and find your perfect combination of music and productivity.</p>
            `
        },
        {
            id: 6,
            title: 'Music Festivals 2025: Guide to the Unmissables',
            excerpt: 'Latin American and world music festivals you can\'t miss this year, from Coachella to Lollapalooza.',
            category: 'Events',
            readTime: '9 min',
            image: 'https://picsum.photos/seed/festivals-2025/800/500',
            content: `
                <h2>The Best Festivals of the Year</h2>
                
                <h3>Coachella (California, USA)</h3>
                <p>The world's most iconic festival returns in April with a spectacular lineup mixing global headliners with emerging artists. Two weekends of music, art, and fashion in the desert.</p>
                
                <h3>Lollapalooza (Multiple Cities)</h3>
                <p>With editions in Chicago, Buenos Aires, Santiago, São Paulo and more, Lollapalooza brings the best of rock, pop, hip hop and electronic to multiple continents. Ideal for fans of musical diversity.</p>
                
                <h3>Tomorrowland (Belgium)</h3>
                <p>Electronic music paradise. With impressive productions and the world's best DJs, Tomorrowland is a next-level experience for EDM lovers.</p>
                
                <h3>Estéreo Picnic (Colombia)</h3>
                <p>Colombia's largest festival brings the best of alternative, rock, and urban music to Bogota. A must for the Latin American scene.</p>
                
                <h3>Festival Tips</h3>
                <p>1. Buy early bird tickets for better prices<br>
                   2. Study the lineup and make your itinerary<br>
                   3. Arrive early for good spots<br>
                   4. Hydrate constantly<br>
                   5. Portable charger is essential</p>
            `
        }
    ];

    get evergreenArticles() {
        return this.languageService.currentLanguage() === 'es'
            ? this.evergreenArticlesES
            : this.evergreenArticlesEN;
    }

    selectedEvergreenArticle = signal<EvergreenArticle | null>(null);
    showEvergreenModal = signal(false);

    ngOnInit() {
        this.seoService.setSeoData(
            this.languageService.get('blog.seo.title'),
            this.languageService.get('blog.seo.desc')
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
