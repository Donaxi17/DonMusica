import { Injectable } from '@angular/core';

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresIn: number; // milliseconds
}

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private readonly STORAGE_PREFIX = 'donmusic_cache_';

    /**
     * Guarda datos en caché con tiempo de expiración
     * @param key Clave única para identificar los datos
     * @param data Datos a guardar
     * @param expiresInMinutes Tiempo de expiración en minutos (por defecto 60 min)
     */
    set<T>(key: string, data: T, expiresInMinutes: number = 60): void {
        try {
            const cacheItem: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                expiresIn: expiresInMinutes * 60 * 1000
            };

            localStorage.setItem(
                this.STORAGE_PREFIX + key,
                JSON.stringify(cacheItem)
            );

            console.log(`💾 Cached: ${key} (expires in ${expiresInMinutes}min)`);
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }

    /**
     * Obtiene datos del caché si no han expirado
     * @param key Clave de los datos
     * @returns Los datos si existen y no han expirado, null en caso contrario
     */
    get<T>(key: string): T | null {
        try {
            const cached = localStorage.getItem(this.STORAGE_PREFIX + key);

            if (!cached) {
                return null;
            }

            const cacheItem: CacheItem<T> = JSON.parse(cached);
            const now = Date.now();
            const age = now - cacheItem.timestamp;

            // Verificar si ha expirado
            if (age > cacheItem.expiresIn) {
                console.log(`🗑️ Cache expired: ${key}`);
                this.remove(key);
                return null;
            }

            console.log(`✅ Cache hit: ${key} (age: ${Math.round(age / 1000)}s)`);
            return cacheItem.data;
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    }

    /**
     * Elimina un elemento del caché
     */
    remove(key: string): void {
        localStorage.removeItem(this.STORAGE_PREFIX + key);
    }

    /**
     * Limpia todo el caché de la aplicación
     */
    clearAll(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        console.log('🧹 Cache cleared');
    }

    /**
     * Verifica si existe un elemento en caché y no ha expirado
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }
}
