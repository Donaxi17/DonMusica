# Correcciones del Reproductor de Videos

## Fecha: 2025-12-10

## Problemas Solucionados

### 1. ✅ El video no continúa automáticamente al siguiente

**Problema:** Cuando un video terminaba, no se reproducía automáticamente el siguiente video de la lista.

**Causa raíz:** 
- El iframe de YouTube no estaba enviando eventos de estado al componente
- La API de YouTube necesita ser inicializada explícitamente para enviar eventos

**Solución implementada:**

#### A. Agregado lifecycle hook `AfterViewInit`
```typescript
export class VideoPlayerComponent implements AfterViewInit {
  ngAfterViewInit() {
    if (this.currentVideoUrl()) {
      setTimeout(() => this.enablePlayerListening(), 1000);
    }
  }
}
```

#### B. Creado método `enablePlayerListening()`
```typescript
private enablePlayerListening() {
  const iframe = document.querySelector('app-video-player iframe') as HTMLIFrameElement;
  if (iframe && iframe.contentWindow) {
    // Activar envío de eventos desde YouTube
    iframe.contentWindow.postMessage(JSON.stringify({
      'event': 'listening',
      'id': 1,
      'channel': 'widget'
    }), '*');
  }
}
```

#### C. Mejorado el método `onMessage()`
- Detecta eventos `onStateChange` y `infoDelivery` de YouTube
- Cuando el estado es `0` (video terminado), llama a `nextVideo()` después de 500ms
- Agregados logs de debug para facilitar troubleshooting

#### D. Agregado `effect()` en el constructor
```typescript
constructor() {
  effect(() => {
    const url = this.currentVideoUrl();
    if (url) {
      this.playerState.set(-1);
      setTimeout(() => this.enablePlayerListening(), 1000);
    }
  });
}
```

---

### 2. ✅ En móvil, hacer clic en el medio no maximiza el video

**Problema:** Al hacer clic en el video minimizado en dispositivos móviles, no se maximizaba. En PC funcionaba correctamente.

**Causa raíz:**
- Había un `div` overlay con `z-index: 50` que capturaba todos los clicks
- Este overlay bloqueaba que los eventos llegaran al handler `handlePlayerClick()`

**Solución implementada:**

#### A. Eliminado el div overlay bloqueador
```html
<!-- ANTES (bloqueaba clicks) -->
@if (isMinimized()) {
  <div class="absolute inset-0 z-50 bg-transparent"></div>
}

<!-- DESPUÉS (permite clicks) -->
<!-- Eliminado completamente -->
```

#### B. Agregado `pointer-events` al iframe
```html
<iframe 
  [src]="currentVideoUrl()! | safe" 
  class="w-full h-full" 
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  [style.pointer-events]="isMinimized() ? 'none' : 'auto'">
</iframe>
```

Esto permite que:
- Los clicks en el video minimizado pasen al contenedor padre
- El método `handlePlayerClick()` reciba correctamente los eventos
- El video se maximice al hacer clic en cualquier parte (móvil y PC)

---

## Archivos Modificados

1. **`src/app/components/shared/video-player/video-player.component.ts`**
   - Agregado `AfterViewInit` interface
   - Agregado `effect` import
   - Creado constructor con effect para monitorear cambios de URL
   - Implementado `ngAfterViewInit()`
   - Creado método `enablePlayerListening()`
   - Mejorado método `onMessage()` con mejor detección de eventos

2. **`src/app/components/shared/video-player/video-player.component.html`**
   - Eliminado div overlay bloqueador
   - Agregado `[style.pointer-events]` al iframe

---

## Cómo Probar

### Probar auto-play del siguiente video:
1. Ir a la sección "Videos"
2. Buscar cualquier artista (ej: "Karol G")
3. Reproducir un video
4. Esperar a que termine el video
5. **Resultado esperado:** El siguiente video de la lista debe comenzar automáticamente
6. **Debug:** Abrir la consola del navegador para ver los logs:
   - "YouTube Player State: 0" cuando el video termina
   - "Video ended, playing next..." cuando se activa el auto-play

### Probar maximizar en móvil:
1. Abrir la app en un dispositivo móvil o usar DevTools en modo móvil
2. Reproducir cualquier video
3. Minimizar el video (botón de minimizar)
4. Hacer clic en cualquier parte del video minimizado
5. **Resultado esperado:** El video debe maximizarse inmediatamente

---

## Notas Técnicas

### Estados del reproductor de YouTube:
- `-1` = No iniciado
- `0` = Terminado
- `1` = Reproduciendo
- `2` = Pausado
- `3` = Buffering
- `5` = Video cued

### Eventos de YouTube iframe API:
- `onStateChange`: Evento principal de cambio de estado
- `infoDelivery`: Evento alternativo usado por algunos embeds
- `listening`: Mensaje para activar el envío de eventos

### Delay de 500ms:
Se usa un delay de 500ms antes de reproducir el siguiente video para:
- Evitar transiciones bruscas
- Dar tiempo al iframe para limpiar el estado anterior
- Mejorar la experiencia de usuario

---

## Posibles Mejoras Futuras

1. **Agregar indicador visual** cuando el video está por terminar (ej: "Siguiente en 5s...")
2. **Implementar modo repeat** para repetir la lista de videos
3. **Agregar configuración** para desactivar auto-play si el usuario lo prefiere
4. **Mejorar el manejo de errores** cuando un video no se puede reproducir
5. **Implementar precarga** del siguiente video para transiciones más rápidas
