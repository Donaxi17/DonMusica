# Script para Limpiar Caché de Artistas

Este script te permite limpiar el caché de Spotify para artistas específicos y forzar la actualización de sus imágenes.

## Opción 1: Desde la Consola del Navegador

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Limpiar caché de Ozuna y Anuel AA
localStorage.removeItem('donmusic_cache_spotify_artist_stats_v1_ozuna');
localStorage.removeItem('donmusic_cache_spotify_artist_stats_v1_anuel aa');

// Recargar la página
location.reload();
```

## Opción 2: Limpiar TODO el caché de Spotify

Si quieres limpiar todas las imágenes de artistas:

```javascript
// Obtener todas las claves del localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('spotify_artist_stats')) {
    localStorage.removeItem(key);
    console.log('Eliminado:', key);
  }
});

// Recargar la página
location.reload();
```

## Opción 3: Usar la Herramienta de Administración

1. Navega a `/admin/refresh-images` (necesitas agregar la ruta primero)
2. Busca "Ozuna" o "Anuel AA"
3. Haz clic en el botón "Actualizar" para cada artista

## Cómo funciona

El sistema ahora:
1. Busca los **5 mejores resultados** en Spotify (antes solo buscaba 1)
2. Compara los nombres normalizados (sin acentos, sin caracteres especiales)
3. Selecciona el artista que **coincida exactamente** con el nombre
4. Si no hay coincidencia exacta, busca uno que **empiece con** el nombre buscado
5. Si aún no hay coincidencia, usa el más popular (primer resultado)

Esto debería resolver el problema de que "Ozuna" estaba mostrando "Ozuna Y Suazo Music" en lugar del artista correcto.
