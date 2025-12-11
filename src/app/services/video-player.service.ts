import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlayerService } from './player.service';
import { lastValueFrom } from 'rxjs';

export interface Video {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    views: string;
}

@Injectable({
    providedIn: 'root'
})
export class VideoPlayerService {
    private playerService = inject(PlayerService);
    private http = inject(HttpClient);

    // State Signals
    currentVideoUrl = signal<string | null>(null);
    watchOnYoutubeUrl = signal<string | null>(null);
    isMinimized = signal<boolean>(false);
    showYoutubeFallback = signal<boolean>(false);
    isLoading = signal<boolean>(false);

    // Playlist State
    currentVideoList = signal<Video[]>([]);
    currentVideoIndex = signal<number>(-1);

    private readonly PIPED_INSTANCES = [
        'https://pipedapi.kavin.rocks',
        'https://api.piped.private.coffee',
        'https://pipedapi.drgns.space',
        'https://api.piped.projectsegfau.lt',
        'https://pipedapi.moomoo.me',
        'https://pipedapi.smnz.de'
    ];

    constructor() { }

    playVideo(video: Video, videoList: Video[] = []) {
        // 1. Stop background music (The "One King" Rule)
        this.playerService.stop();

        // 2. Set Playlist Context
        if (videoList.length > 0) {
            this.currentVideoList.set(videoList);
            const index = videoList.findIndex(v => v.id === video.id);
            this.currentVideoIndex.set(index !== -1 ? index : -1);
        }

        // 3. Reset UI State (but keep minimized state)
        this.showYoutubeFallback.set(false);
        this.isLoading.set(true);

        // 4. Play video immediately using YouTube iframe
        // If it's a YouTube ID (contains letters), use it directly
        if (!/^\d+$/.test(video.id)) {
            // Direct YouTube video ID
            this.setPlayer(video.id);
        } else {
            // iTunes ID - open YouTube search directly (no Piped delay)
            const origin = window.location.origin;
            const searchQ = encodeURIComponent(`${video.title} ${video.artist} official video`);
            this.currentVideoUrl.set(`https://www.youtube-nocookie.com/embed?listType=search&list=${searchQ}&autoplay=1&origin=${origin}`);
            this.watchOnYoutubeUrl.set(`https://www.youtube.com/results?search_query=${searchQ}`);
            this.showYoutubeFallback.set(true);
            this.isLoading.set(false);
        }
    }

    private async setPlayer(videoId: string) {
        // Use YouTube iframe directly (simple and reliable)
        const origin = window.location.origin;
        this.currentVideoUrl.set(
            `https://www.youtube-nocookie.com/embed/${videoId}?` +
            `autoplay=1&` +
            `enablejsapi=1&` +
            `origin=${encodeURIComponent(origin)}&` +
            `widget_referrer=${encodeURIComponent(origin)}&` +
            `rel=0&` +
            `modestbranding=1&` +
            `iv_load_policy=3&` +
            `playsinline=1&` +
            `loop=0`
        );
        this.watchOnYoutubeUrl.set(`https://www.youtube.com/watch?v=${videoId}`);
        this.showYoutubeFallback.set(false);
        this.isLoading.set(false);
    }

    private async getPipedStream(videoId: string): Promise<string | null> {
        // Only try the 2 fastest/most reliable instances
        const fastInstances = [
            'https://pipedapi.kavin.rocks',
            'https://pipedapi.moomoo.me'
        ];

        for (const instance of fastInstances) {
            try {
                console.log(`🔍 Trying Piped: ${instance.split('//')[1]}`);

                // Race between fetch and timeout (3 seconds max per instance)
                const response: any = await Promise.race([
                    lastValueFrom(
                        this.http.get(`${instance}/streams/${videoId}`, {
                            headers: { 'Accept': 'application/json' }
                        })
                    ),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), 3000)
                    )
                ]);

                if (response && response.videoStreams && response.videoStreams.length > 0) {
                    // Get the best quality stream
                    const stream = response.videoStreams[0];
                    console.log(`✅ Piped OK: ${stream.quality}`);
                    return stream.url;
                }
            } catch (error: any) {
                const errorMsg = error.message === 'Timeout' ? 'timeout' : 'failed';
                console.warn(`❌ Piped ${errorMsg}`);
                continue;
            }
        }

        console.log('⚠️ Piped unavailable, using YouTube iframe');
        return null;
    }

    closeVideo() {
        this.currentVideoUrl.set(null);
        this.watchOnYoutubeUrl.set(null);
        this.isMinimized.set(false);
        this.currentVideoIndex.set(-1);
    }

    minimizeVideo() {
        this.isMinimized.set(true);
    }

    maximizeVideo() {
        this.isMinimized.set(false);
    }

    nextVideo() {
        const list = this.currentVideoList();
        const index = this.currentVideoIndex();
        if (index < list.length - 1) {
            this.playVideo(list[index + 1], list);
        }
    }

    prevVideo() {
        const list = this.currentVideoList();
        const index = this.currentVideoIndex();
        if (index > 0) {
            this.playVideo(list[index - 1], list);
        }
    }

    private async findVideoId(query: string): Promise<string | null> {
        for (const instance of this.PIPED_INSTANCES) {
            try {
                const response: any = await lastValueFrom(this.http.get(`${instance}/search`, {
                    params: { q: query, filter: 'music_videos' }
                }));

                if (response && response.items && response.items.length > 0) {
                    const video = response.items.find((item: any) => item.type === 'stream' && !item.isShort);
                    if (video && video.url) {
                        return video.url.split('v=')[1];
                    }
                    if (response.items[0]?.url) {
                        return response.items[0].url.split('v=')[1];
                    }
                }
            } catch (error) {
                continue;
            }
        }
        return null;
    }
}
