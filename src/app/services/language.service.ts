import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Language = 'es' | 'en';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private platformId = inject(PLATFORM_ID);
    currentLanguage = signal<Language>('es');

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const savedLang = localStorage.getItem('app_language');
            if (savedLang === 'es' || savedLang === 'en') {
                this.currentLanguage.set(savedLang);
            } else {
                // Optional: Auto-detect browser language
                const browserLang = navigator.language.split('-')[0];
                if (browserLang === 'en') {
                    this.currentLanguage.set('en');
                }
            }
        }
    }

    translations: Record<Language, Record<string, string>> = {
        es: {
            // Navbar / Layout
            'nav.home': 'Inicio',
            'nav.artists': 'Artistas',
            'nav.explore': 'Explorar',
            'nav.videos': 'Videos',
            'nav.more': 'Más',
            'nav.menu': 'Menú Principal',
            'layout.loading': 'Cargando...',
            'layout.language.es': 'Español',
            'layout.language.en': 'Inglés',
            'layout.data_saver': 'Ahorro de Datos',
            'layout.view_history': 'Ver Historial',
            'layout.history': 'Historial',
            'layout.close': 'Cerrar',

            // Footer
            'footer.description': 'La plataforma de streaming definitiva. Descubre, escucha y comparte la mejor música sin límites.',
            'footer.discover': 'Descubrir',
            'footer.rankings': 'Rankings',
            'footer.community': 'Comunidad',
            'footer.about': 'Sobre Nosotros',
            'footer.legal': 'Legal',
            'footer.privacy': 'Política de Privacidad',
            'footer.terms': 'Términos y Condiciones',
            'footer.rights': '© 2025 DonMusica. Todos los derechos reservados.',
            'footer.made_with': 'Hecho con',
            'footer.in_colombia': 'en Colombia',

            // Home
            'home.hero.badge': 'Plataforma #1',
            'home.hero.title_part1': 'Siente',
            'home.hero.title_part2': 'El Ritmo.',
            'home.hero.description': 'La plataforma definitiva de música urbana. Escucha en alta fidelidad, totalmente gratis.',
            'home.hero.cta': 'Empezar Ahora',
            'home.hero.bg_alt': 'Fondo de concierto de música urbana',
            'home.section.recent': 'Recién Agregadas',
            'home.section.trends': 'Tendencias',
            'home.listening.now': 'Escuchando ahora',
            'home.download.app': 'Descargar App',
            'home.install.title': 'Instalar App',
            'home.install.desc': 'Acceso rápido y sin conexión.',
            'home.install.btn': 'Instalar',
            'home.timeline': 'Timeline de peticiones',
            'home.synced': 'Sincronizado hace un momento',
            'home.top20': 'Top 20',

            'home.pro.title': 'DonMusica Pro',
            'home.pro.desc': 'Disfruta de más funciones, música sin anuncios y beneficios exclusivos. ¡Próximamente!',
            'home.ads.title': 'DonMusica Ads',
            'home.ads.desc': 'Promociona tu música con anuncios personalizados. Ideal para artistas que quieren llegar a más oyentes. ¡Próximamente!',
            'home.common.beta': 'Beta',

            'home.modules.nav': 'Navegación',
            'home.modules.title': 'Centro de Mando',
            'home.modules.artists.title': 'Artistas',
            'home.modules.artists.desc': 'Explora bibliotecas completas de tus íconos favoritos y nuevos talentos urbanos.',
            'home.modules.artists.btn': 'Ver Catálogo',
            'home.modules.videos.title': 'Videos',
            'home.modules.videos.desc': 'Estrenos oficiales, presentaciones en vivo y contenido exclusivo en alta definición.',
            'home.modules.videos.btn': 'Ver Videos',
            'home.modules.radio.title': 'Radio',
            'home.modules.radio.desc': 'Conéctate con las mejores emisoras urbanas en vivo las 24 horas del día.',
            'home.modules.radio.btn': 'Sintonizar',
            'home.modules.blog.title': 'Blog',
            'home.modules.blog.desc': 'Mantente al día con lanzamientos, entrevistas y lo último en tendencias.',
            'home.modules.blog.btn': 'Leer Más',

            'home.stats.community': 'Comunidad DonMusica',
            'home.stats.growing_part1': 'Creciendo',
            'home.stats.growing_part2': 'junto a ti.',
            'home.stats.desc': 'Estamos empezando, pero con cada nueva canción y cada una de tus peticiones, estamos creando algo único. Tu música favorita, siempre actualizada según lo que tú pidas.',
            'home.stats.artists': 'Artistas',
            'home.stats.songs': 'Canciones',

            'home.explore.badge': 'Descubre',
            'home.explore.title_part1': 'Explora lo',
            'home.explore.title_part2': 'Último',
            'home.explore.desc_part1': 'Mantente al día con las',
            'home.explore.desc_highlight': 'tendencias globales',
            'home.explore.desc_part2': ', descubre los nuevos lanzamientos y explora rankings actualizados diariamente.',
            'home.explore.feature1': 'Tendencias cada hora',
            'home.explore.feature2': 'Estrenos destacados',
            'home.explore.btn': 'Explorar Ahora',

            'home.rankings.badge': 'Rankings',
            'home.rankings.title_part1': 'Top',
            'home.rankings.title_part2': '20',
            'home.rankings.title_part3': 'Exclusivo',
            'home.rankings.desc_part1': 'Descubre los',
            'home.rankings.desc_highlight': '20 temas más pegados',
            'home.rankings.desc_part2': 'del momento. Un ranking exclusivo actualizado diariamente.',
            'home.rankings.btn': 'Ver Rankings',

            'home.artists_detailed.badge': 'Catálogo',
            'home.artists_detailed.title_part1': 'Tus',
            'home.artists_detailed.title_part2': 'Artistas',
            'home.artists_detailed.title_part3': 'Favoritos',
            'home.artists_detailed.desc': 'Disfruta de una selección premium de artistas urbanos. Sus hits más famosos y lo que está sonando ahora.',
            'home.artists_detailed.btn': 'Ver Artistas',

            'home.videos_detailed.badge': 'Multimedia',
            'home.videos_detailed.title_part1': 'Videos',
            'home.videos_detailed.title_part2': 'Musicales',
            'home.videos_detailed.desc': 'Disfruta de tus canciones favoritas en format corto. Videos verticales rápidos para descubrir música.',
            'home.videos_detailed.btn': 'Ver Videos',

            'home.ncs.badge': 'Seguro para Creadores',
            'home.ncs.title_part1': 'Música',
            'home.ncs.title_part2': 'Sin Copyright',
            'home.ncs.desc': 'Gran variedad de pistas 100% libres de derechos. Perfectas para tus videos de YouTube y TikToks.',
            'home.ncs.btn': 'Descargar Gratis',

            'home.tools.badge': 'Utilidades',
            'home.tools.title_part1': 'Herramientas',
            'home.tools.title_part2': 'Pro',
            'home.tools.desc': 'Lleva tu producción al siguiente nivel con utilidades exclusivas para creadores.',
            'home.tools.btn': 'Abrir Herramientas',

            'home.lyrics.badge': 'Letras',
            'home.lyrics.title_part1': 'Letras',
            'home.lyrics.title_part2': 'Guardadas',
            'home.lyrics.desc': 'Guarda las letras de tus canciones favoritas y accede a ellas sin conexión.',
            'home.lyrics.btn': 'Ver Mis Letras',

            'home.radio_detailed.badge': 'En Vivo',
            'home.radio_detailed.title_part1': 'Radio',
            'home.radio_detailed.title_part2': 'Online',
            'home.radio_detailed.desc': 'Escucha emisoras de radio en vivo de todo el mundo 24/7.',
            'home.radio_detailed.btn': 'Escuchar Radio',

            'home.playlists.badge': 'Colecciones',
            'home.playlists.title_part1': 'Tus',
            'home.playlists.title_part2': 'Playlists',
            'home.playlists.desc': 'Crea y organiza tus playlists personalizadas.',
            'home.playlists.btn': 'Ver Playlists',

            'home.offline.badge': 'Sin Conexión',
            'home.offline.title_part1': 'Música',
            'home.offline.title_part2': 'Offline',
            'home.offline.desc': 'Descarga tus canciones favoritas y escúchalas sin internet en cualquier lugar.',
            'home.offline.btn': 'Ver Descargas',

            'home.upload.badge': 'Subir',
            'home.upload.title_part1': 'Añadir',
            'home.upload.title_part2': 'Música',
            'home.upload.desc': 'Sube tu propia música y organízala a tu manera.',
            'home.upload.btn': 'Subir Música',

            'home.blog_detailed.badge': 'Magazine',
            'home.blog_detailed.title_part1': 'Blog',
            'home.blog_detailed.title_part2': 'Musical',
            'home.blog_detailed.desc': 'Historias que definen la cultura urbana. Noticias y entrevistas exclusivas.',
            'home.blog_detailed.btn': 'Explorar Magazine',

            'home.request.badge': 'VIP',
            'home.request.title_part1': 'Pide tu',
            'home.request.title_part2': 'Música',
            'home.request.desc': 'Sube tu prioridad. Nuestro equipo agregará tus temas favoritos gratis.',
            'home.request.fast': 'Rápido',
            'home.request.artist_label': 'Artista',
            'home.request.song_label': 'Canción',
            'home.request.artist_placeholder': 'Ej: Bad Bunny',
            'home.request.song_placeholder': 'Ej: Un Verano Sin Ti',
            'home.request.btn': 'Enviar Petición',

            'artists.hero.discover': 'Descubre',
            'artists.hero.artists': 'Artistas',
            'artists.hero.subtitle': 'Estamos preparando el mejor catálogo musical para ti',
            'artists.hero.bg_alt': 'Fondo de artistas musicales',
            'artists.search.placeholder': 'Buscar por artista o canción...',
            'artists.recent_searches': 'Búsquedas Recientes',
            'artists.search.remove': 'Eliminar búsqueda',
            'artists.listening': 'Escuchando voz...',
            'artists.no_results': 'No hay coincidencias exactas',
            'artists.no_results_part1': 'No encontramos nada para',
            'artists.try_styles': 'pero podrías intentar con estos estilos:',
            'artists.shuffle': 'Aleatorio',
            'artists.smart_mix': 'Mezcla inteligente',
            'artists.badge.song': 'Canción',
            'artists.admin.refresh_prompt': '¿Quieres actualizar todas las imágenes de artistas desde Spotify? Esto limpiará el caché y recargará la página.',
            'artists.admin.cache_cleared': 'Caché de imágenes limpiado. Recargando...',

            'seo.artists.title': 'Artistas',
            'seo.artists.desc': 'Explora artistas musicales.',

            'home.contact.btn': 'Contacto',
            'home.whatsapp.btn': 'WhatsApp',

            'home.toast.install_instructions': 'Para instalar la App: Presiona "Añadir a pantalla de inicio" en las opciones de tu navegador o "Instalar Aplicación" en la barra de búsqueda.',
            'home.toast.fill_required': 'Por favor completa el nombre del artista y la canción/álbum',
            'home.toast.request_sent': '¡Petición enviada! Estaremos trabajando en ella pronto.',
            'home.toast.searching_download': 'Buscando enlace de descarga...',
            'home.toast.download_not_found': 'No se pudo encontrar un enlace de descarga válido.',
            'artist.toast.already_downloaded': 'Esta canción ya está descargada.',
            'artist.toast.offline_source_not_found': 'No se pudo encontrar una fuente para modo offline',
            'artist.toast.no_valid_link': 'Esta canción no tiene un enlace de reproducción válido.',
            'artist.toast.no_song_share': 'No hay canción para compartir',
            'artist.toast.added_to': 'Agregada a "{0}"',
            'artist.toast.already_in': 'Ya existe en "{0}"',
            'home.whatsapp.message_header': '⚡ *Nueva Petición Musical* ⚡',
            'home.whatsapp.artist': '🎙️ *Artista:*',
            'home.whatsapp.song': '🎧 *Canción/Álbum:*',

            'common.new': 'NUEVO',
            'common.view_all': 'Ver todo',
            'common.retry': 'Reintentar',

            // Time
            'time.new': 'Nuevo',
            'time.just_now': 'Justo ahora',
            'time.min_ago': 'Hace {0} min',
            'time.hour_ago': 'Hace {0} h',
            'time.day_ago': 'Hace {0} d',
            'time.long_ago': 'Hace tiempo',



            // Explore (Browse)
            'browse.title': 'Explorar',
            'browse.subtitle': 'Descubre nueva música y géneros.',

            // Videos
            'videos.title': 'Videos Musicales',
            'videos.subtitle': 'Disfruta de los mejores videoclips oficiales.',
            'videos.featured': 'Destacados',
            'videos.recent': 'Más recientes',
            'videos.hero.title_part1': 'Visi',
            'videos.hero.title_part2': 'ón',
            'videos.hero.subtitle': 'Tus videos musicales favoritos en alta definición.',
            'videos.search.placeholder': 'Buscar videos...',
            'videos.empty.title': 'Empieza a buscar',
            'videos.empty.subtitle': 'Busca tus videos musicales favoritos para empezar a disfrutar.',
            'videos.playing': 'Reproduciendo',
            'videos.card.playing': 'Sonando',
            'videos.card.watch': 'Ver video',
            'videos.card.play': 'Reproducir video',
            'seo.videos.title': 'Videos Musicales - DonMusica',
            'seo.videos.desc': 'Disfruta de los videoclips oficiales de tus artistas favoritos. Calidad HD y sin interrupciones.',

            // Contact
            'contact.title': 'Contáctanos',
            'contact.subtitle': '¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para escucharte y responderte lo antes posible.',
            'contact.form.title': 'Envíanos un Mensaje',
            'contact.form.subtitle': 'Te responderemos directamente a tu correo.',
            'contact.form.name': 'Nombre',
            'contact.form.name_placeholder': 'Tu nombre',
            'contact.form.subject': 'Asunto',
            'contact.form.select_subject': 'Selecciona un asunto',
            'contact.form.message': 'Mensaje',
            'contact.form.message_placeholder': '¿En qué podemos ayudarte?',
            'contact.form.send': 'Enviar Email',
            'contact.whatsapp.title': 'WhatsApp Directo',
            'contact.whatsapp.subtitle': 'Respuesta inmediata',
            'contact.location.title': 'Ubicación',
            'contact.location.value': 'Colombia',
            'contact.schedule.title': 'Horario',
            'contact.schedule.value': 'Lun-Vie: 9AM - 6PM',
            'contact.follow_us': 'Síguenos',
            'contact.faq.pre': 'Antes de preguntar',
            'contact.faq.title': 'Lee las Preguntas Frecuentes',
            'contact.toast.fill_all': 'Por favor completa todos los campos',

            'home.contact.title': 'Contacto',
            'common.views': 'vistas',
        },
        en: {
            // Navbar / Layout
            'nav.home': 'Home',
            'nav.artists': 'Artists',
            'nav.explore': 'Explore',
            'nav.videos': 'Videos',
            'nav.more': 'More',
            'nav.menu': 'Main Menu',
            'layout.loading': 'Loading...',
            'layout.language.es': 'Spanish',
            'layout.language.en': 'English',
            'layout.data_saver': 'Data Saver',
            'layout.view_history': 'View History',
            'layout.history': 'History',
            'layout.close': 'Close',

            // Footer
            'footer.description': 'The ultimate streaming platform. Discover, listen, and share the best music without limits.',
            'footer.discover': 'Discover',
            'footer.rankings': 'Rankings',
            'footer.community': 'Community',
            'footer.about': 'About Us',
            'footer.legal': 'Legal',
            'footer.privacy': 'Privacy Policy',
            'footer.terms': 'Terms and Conditions',
            'footer.rights': '© 2025 DonMusica. All rights reserved.',
            'footer.made_with': 'Made with',
            'footer.in_colombia': 'in Colombia',

            // Home
            'home.hero.badge': '#1 Platform',
            'home.hero.title_part1': 'Feel',
            'home.hero.title_part2': 'The Rhythm.',
            'home.hero.description': 'The ultimate urban music platform. Listen in high fidelity, completely free.',
            'home.hero.cta': 'Start Now',
            'home.hero.bg_alt': 'Urban music concert background',
            'home.section.recent': 'Recently Added',
            'home.section.trends': 'Trending',
            'home.listening.now': 'Listening now',
            'home.download.app': 'Get the App',
            'home.install.title': 'Install App',
            'home.install.desc': 'Fast access and offline mode.',
            'home.install.btn': 'Install',
            'home.timeline': 'Requests Timeline',
            'home.synced': 'Synced just now',
            'home.top20': 'Top 20',

            'home.pro.title': 'DonMusica Pro',
            'home.pro.desc': 'Enjoy more features, ad-free music, and exclusive benefits. Coming soon!',
            'home.ads.title': 'DonMusica Ads',
            'home.ads.desc': 'Promote your music with personalized ads. Ideal for artists who want to reach more listeners. Coming soon!',
            'home.common.beta': 'Beta',

            'home.modules.nav': 'Navigation',
            'home.modules.title': 'Command Center',
            'home.modules.artists.title': 'Artists',
            'home.modules.artists.desc': 'Explore complete libraries of your favorite icons and new urban talents.',
            'home.modules.artists.btn': 'View Catalog',
            'home.modules.videos.title': 'Videos',
            'home.modules.videos.desc': 'Official premieres, live performances, and exclusive high-definition content.',
            'home.modules.videos.btn': 'Watch Videos',
            'home.modules.radio.title': 'Radio',
            'home.modules.radio.desc': 'Tune in to the best urban stations live 24 hours a day.',
            'home.modules.radio.btn': 'Tune In',
            'home.modules.blog.title': 'Blog',
            'home.modules.blog.desc': 'Keep up with releases, interviews, and the latest trends.',
            'home.modules.blog.btn': 'Read More',

            'home.stats.community': 'DonMusica Community',
            'home.stats.growing_part1': 'Growing',
            'home.stats.growing_part2': 'with you.',
            'home.stats.desc': 'We are just starting, but with every new song and every request from you, we are creating something unique. Your favorite music, always updated according to what you ask for.',
            'home.stats.artists': 'Artists',
            'home.stats.songs': 'Songs',

            'home.explore.badge': 'Discover',
            'home.explore.title_part1': 'Explore the',
            'home.explore.title_part2': 'Latest',
            'home.explore.desc_part1': 'Stay up to date with',
            'home.explore.desc_highlight': 'global trends',
            'home.explore.desc_part2': ', discover new releases, and explore rankings updated daily.',
            'home.explore.feature1': 'Hourly trends',
            'home.explore.feature2': 'Featured premieres',
            'home.explore.btn': 'Explore Now',

            'home.rankings.badge': 'Rankings',
            'home.rankings.title_part1': 'Top',
            'home.rankings.title_part2': '20',
            'home.rankings.title_part3': 'Exclusive',
            'home.rankings.desc_part1': 'Discover the',
            'home.rankings.desc_highlight': 'top 20 hottest tracks',
            'home.rankings.desc_part2': 'of the moment. An exclusive ranking updated daily.',
            'home.rankings.btn': 'View Rankings',

            'home.artists_detailed.badge': 'Catalog',
            'home.artists_detailed.title_part1': 'Your',
            'home.artists_detailed.title_part2': 'Favorite',
            'home.artists_detailed.title_part3': 'Artists',
            'home.artists_detailed.desc': 'Enjoy a premium selection of urban artists. Their most famous hits and what is playing now.',
            'home.artists_detailed.btn': 'View Artists',

            'home.videos_detailed.badge': 'Multimedia',
            'home.videos_detailed.title_part1': 'Music',
            'home.videos_detailed.title_part2': 'Videos',
            'home.videos_detailed.desc': 'Enjoy your favorite songs in short format. Fast vertical videos to discover music.',
            'home.videos_detailed.btn': 'Watch Videos',

            'home.ncs.badge': 'Creator Safe',
            'home.ncs.title_part1': 'No Copyright',
            'home.ncs.title_part2': 'Music',
            'home.ncs.desc': 'Great variety of 100% royalty-free tracks. Perfect for your YouTube videos and TikToks.',
            'home.ncs.btn': 'Download Free',

            'home.tools.badge': 'Utilities',
            'home.tools.title_part1': 'Pro',
            'home.tools.title_part2': 'Tools',
            'home.tools.desc': 'Take your production to the next level with exclusive tools for creators.',
            'home.tools.btn': 'Open Tools',

            'home.lyrics.badge': 'Lyrics',
            'home.lyrics.title_part1': 'Saved',
            'home.lyrics.title_part2': 'Lyrics',
            'home.lyrics.desc': 'Save lyrics of your favorite songs and access them offline.',
            'home.lyrics.btn': 'View My Lyrics',

            'home.radio_detailed.badge': 'Live',
            'home.radio_detailed.title_part1': 'Online',
            'home.radio_detailed.title_part2': 'Radio',
            'home.radio_detailed.desc': 'Listen to live radio stations from around the world 24/7.',
            'home.radio_detailed.btn': 'Listen to Radio',

            'home.playlists.badge': 'Collections',
            'home.playlists.title_part1': 'Your',
            'home.playlists.title_part2': 'Playlists',
            'home.playlists.desc': 'Create and organize your personalized playlists.',
            'home.playlists.btn': 'View Playlists',

            'home.offline.badge': 'Offline',
            'home.offline.title_part1': 'Offline',
            'home.offline.title_part2': 'Music',
            'home.offline.desc': 'Download your favorite songs and listen without internet anywhere.',
            'home.offline.btn': 'View Downloads',

            'home.upload.badge': 'Upload',
            'home.upload.title_part1': 'Add',
            'home.upload.title_part2': 'Music',
            'home.upload.desc': 'Upload your own music and organize it your way.',
            'home.upload.btn': 'Upload Music',

            'home.blog_detailed.badge': 'Magazine',
            'home.blog_detailed.title_part1': 'Music',
            'home.blog_detailed.title_part2': 'Blog',
            'home.blog_detailed.desc': 'Stories that define urban culture. News and exclusive interviews.',
            'home.blog_detailed.btn': 'Explore Magazine',

            'home.request.badge': 'VIP',
            'home.request.title_part1': 'Request your',
            'home.request.title_part2': 'Music',
            'home.request.desc': 'Upload your priority. Our team will add your favorite tracks for free.',
            'home.request.fast': 'Fast',
            'home.request.artist_label': 'Artist',
            'home.request.song_label': 'Song',
            'home.request.artist_placeholder': 'Ex: Bad Bunny',
            'home.request.song_placeholder': 'Ex: Un Verano Sin Ti',
            'home.request.btn': 'Send Request',

            'artists.hero.discover': 'Discover',
            'artists.hero.artists': 'Artists',
            'artists.hero.subtitle': 'We are preparing the best music catalog for you',
            'artists.hero.bg_alt': 'Music artists background',
            'artists.search.placeholder': 'Search by artist or song...',
            'artists.recent_searches': 'Recent Searches',
            'artists.search.remove': 'Remove search',
            'artists.listening': 'Listening...',
            'artists.no_results': 'No exact matches',
            'artists.no_results_part1': 'We found nothing for',
            'artists.try_styles': 'but you could try these styles:',
            'artists.shuffle': 'Shuffle',
            'artists.smart_mix': 'Smart Mix',
            'artists.badge.song': 'Song',
            'artists.admin.refresh_prompt': 'Do you want to update all artist images from Spotify? This will clear the cache and reload the page.',
            'artists.admin.cache_cleared': 'Image cache cleared. Reloading...',

            'seo.artists.title': 'Artists',
            'seo.artists.desc': 'Explore music artists.',

            'home.contact.btn': 'Contact',
            'home.whatsapp.btn': 'WhatsApp',

            'home.toast.install_instructions': 'To install the App: Tap "Add to Home Screen" in your browser options or "Install App" in the search bar.',
            'home.toast.fill_required': 'Please fill in the artist name and song/album',
            'home.toast.request_sent': 'Request sent! We will be working on it soon.',
            'home.toast.searching_download': 'Searching for download link...',
            'home.toast.download_not_found': 'Could not find a valid download link.',
            'artist.toast.already_downloaded': 'This song is already downloaded.',
            'artist.toast.offline_source_not_found': 'Could not find a source for offline mode',
            'artist.toast.no_valid_link': 'This song does not have a valid playback link.',
            'artist.toast.no_song_share': 'No song to share',
            'artist.toast.added_to': 'Added to "{0}"',
            'artist.toast.already_in': 'Already in "{0}"',
            'home.whatsapp.message_header': '⚡ *New Music Request* ⚡',
            'home.whatsapp.artist': '🎙️ *Artist:*',
            'home.whatsapp.song': '🎧 *Song/Album:*',

            'common.new': 'NEW',
            'common.view_all': 'View all',
            'common.retry': 'Retry',

            // Time
            'time.new': 'New',
            'time.just_now': 'Just now',
            'time.min_ago': '{0} min ago',
            'time.hour_ago': '{0} h ago',
            'time.day_ago': '{0} d ago',
            'time.long_ago': 'Long ago',



            // Explore (Browse)
            'browse.title': 'Explore',
            'browse.subtitle': 'Discover new music and genres.',

            // Videos
            'videos.title': 'Music Videos',
            'videos.subtitle': 'Enjoy the best official music videos.',
            'videos.featured': 'Featured',
            'videos.recent': 'Most Recent',
            'videos.hero.title_part1': 'Visi',
            'videos.hero.title_part2': 'on',
            'videos.hero.subtitle': 'Your favorite music videos in high definition.',
            'videos.search.placeholder': 'Search videos...',
            'videos.empty.title': 'Start searching',
            'videos.empty.subtitle': 'Search for your favorite music videos to start enjoying.',
            'videos.playing': 'Playing',
            'videos.card.playing': 'Playing',
            'videos.card.watch': 'Watch video',
            'videos.card.play': 'Play video',
            'seo.videos.title': 'Music Videos - DonMusica',
            'seo.videos.desc': 'Enjoy official music videos from your favorite artists. HD quality and no interruptions.',

            // Contact
            'contact.title': 'Contact Us',
            'contact.subtitle': 'Do you have questions, suggestions, or need help? We are here to listen and respond as soon as possible.',
            'contact.form.title': 'Send us a Message',
            'contact.form.subtitle': 'We will reply directly to your email.',
            'contact.form.name': 'Name',
            'contact.form.name_placeholder': 'Your name',
            'contact.form.subject': 'Subject',
            'contact.form.select_subject': 'Select a subject',
            'contact.form.message': 'Message',
            'contact.form.message_placeholder': 'How can we help you?',
            'contact.form.send': 'Send Email',
            'contact.whatsapp.title': 'Direct WhatsApp',
            'contact.whatsapp.subtitle': 'Immediate response',
            'contact.location.title': 'Location',
            'contact.location.value': 'Colombia',
            'contact.schedule.title': 'Schedule',
            'contact.schedule.value': 'Mon-Fri: 9AM - 6PM',
            'contact.follow_us': 'Follow Us',
            'contact.faq.pre': 'Before asking',
            'contact.faq.title': 'Read the FAQ',
            'contact.toast.fill_all': 'Please fill in all fields',

            'home.contact.title': 'Contact',
            'common.views': 'views',
        }
    };

    get(key: string, ...params: any[]): string {
        let text = this.translations[this.currentLanguage()][key] || key;
        if (params.length > 0) {
            params.forEach((param, index) => {
                text = text.replace(`{${index}}`, String(param));
            });
        }
        return text;
    }

    setLanguage(lang: Language) {
        this.currentLanguage.set(lang);
        localStorage.setItem('app_language', lang);
        document.documentElement.lang = lang;
    }
}
