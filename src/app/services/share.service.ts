import { Injectable } from '@angular/core';
import { Song } from './playlist.service';

@Injectable({
    providedIn: 'root'
})
export class ShareService {
    private readonly BASE_URL = 'https://donmusica.online';

    /**
     * Comparte una canción usando la Web Share API (si está disponible)
     * o copia el enlace al portapapeles como fallback
     */
    async shareSong(song: Song, source: 'default' | 'free-music' = 'default'): Promise<boolean> {
        let deepLink = '';

        if (source === 'free-music') {
            // Enlace directo al componente de música sin copyright
            deepLink = `${this.BASE_URL}/sin-copyright?q=${encodeURIComponent(song.title)}`;
        } else {
            // Enlace al buscador global
            deepLink = `${this.BASE_URL}/browse/search?q=${encodeURIComponent(song.title + ' ' + song.artist)}`;
        }

        const shareData = {
            title: `${song.title} - ${song.artist}`,
            text: `🎵 Estoy escuchando "${song.title}" de ${song.artist} en DonMusica.\n\n¡Escúchala gratis aquí! 👇`,
            url: deepLink
        };

        // Verificar si Web Share API está disponible
        if (navigator.share && this.isMobile()) {
            try {
                await navigator.share(shareData);
                return true;
            } catch (error: any) {
                // Usuario canceló o error
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
                return false;
            }
        } else {
            // Fallback: copiar al portapapeles
            return this.copyToClipboard(`${shareData.text}\n${shareData.url}`);
        }
    }

    /**
     * Comparte letras de una canción
     */
    async shareLyrics(title: string, artist: string, lyrics: string): Promise<boolean> {
        const preview = lyrics.length > 150 ? lyrics.substring(0, 150) + '...' : lyrics;
        const deepLink = `${this.BASE_URL}/browse/search?q=${encodeURIComponent(title + ' ' + artist)}`;

        const shareData = {
            title: `Letra: ${title} - ${artist}`,
            text: `🎤 Mira la letra de "${title}" de ${artist} en DonMusica.\n\n"${preview}"\n\nVer completa aquí 👇`,
            url: deepLink
        };

        if (navigator.share && this.isMobile()) {
            try {
                await navigator.share(shareData);
                return true;
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing lyrics:', error);
                }
                return false;
            }
        } else {
            return this.copyToClipboard(`${shareData.text}\n${shareData.url}`);
        }
    }

    /**
     * Comparte una playlist
     */
    async sharePlaylist(playlistName: string, songCount: number): Promise<boolean> {
        const shareData = {
            title: `Playlist: ${playlistName}`,
            text: `🎵 He creado la playlist "${playlistName}" con ${songCount} canciones en DonMusica.\n\n¡Escúchala gratis!`,
            url: `${this.BASE_URL}/playlists`
        };

        if (navigator.share && this.isMobile()) {
            try {
                await navigator.share(shareData);
                return true;
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing playlist:', error);
                }
                return false;
            }
        } else {
            return this.copyToClipboard(`${shareData.text}\n${shareData.url}`);
        }
    }

    /**
     * Copia texto al portapapeles
     */
    private async copyToClipboard(text: string): Promise<boolean> {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback para navegadores antiguos
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            return false;
        }
    }

    /**
     * Detecta si es un dispositivo móvil
     */
    private isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Comparte en redes sociales específicas
     */
    shareOnSocial(platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram', song: Song, source: 'default' | 'free-music' = 'default'): void {
        const text = `🎵 Escucha "${song.title}" de ${song.artist} en DonMusica\n\n✨ Música gratis, letras y más`;

        let url = '';
        if (source === 'free-music') {
            url = `${this.BASE_URL}/sin-copyright?q=${encodeURIComponent(song.title)}`;
        } else {
            url = `${this.BASE_URL}/browse/search?q=${encodeURIComponent(song.title + ' ' + song.artist)}`;
        }

        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
}
