import { Injectable } from '@angular/core';
import { Song } from './playlist.service';

@Injectable({
    providedIn: 'root'
})
export class ShareService {

    /**
     * Comparte una canción usando la Web Share API (si está disponible)
     * o copia el enlace al portapapeles como fallback
     */
    async shareSong(song: Song): Promise<boolean> {
        const shareData = {
            title: `${song.title} - ${song.artist}`,
            text: `🎵 Escucha "${song.title}" de ${song.artist} en DonMusica\n\n✨ Música gratis, letras y más en donmusica.online`,
            url: `https://donmusica.online`
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
            return this.copyToClipboard(`${shareData.text}\n\n${shareData.url}`);
        }
    }

    /**
     * Comparte letras de una canción
     */
    async shareLyrics(title: string, artist: string, lyrics: string): Promise<boolean> {
        const preview = lyrics.length > 200 ? lyrics.substring(0, 200) + '...' : lyrics;
        const shareData = {
            title: `Letra: ${title} - ${artist}`,
            text: `🎤 Letra de "${title}" de ${artist}\n\n${preview}\n\n📖 Ver letra completa en DonMusica\n✨ donmusica.online`,
            url: `https://donmusica.online`
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
            return this.copyToClipboard(`${shareData.text}\n\n${shareData.url}`);
        }
    }

    /**
     * Comparte una playlist
     */
    async sharePlaylist(playlistName: string, songCount: number): Promise<boolean> {
        const shareData = {
            title: `Playlist: ${playlistName}`,
            text: `🎵 Escucha mi playlist "${playlistName}" con ${songCount} canciones en DonMusica\n\n✨ donmusica.online`,
            url: `https://donmusica.online`
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
            return this.copyToClipboard(`${shareData.text}\n\n${shareData.url}`);
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
    shareOnSocial(platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram', song: Song): void {
        const text = `🎵 Escucha "${song.title}" de ${song.artist} en DonMusica\n\n✨ Música gratis, letras y más`;
        const url = `https://donmusica.online`;

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
