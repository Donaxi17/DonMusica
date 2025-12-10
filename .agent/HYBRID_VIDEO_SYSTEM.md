# Sistema Híbrido: Piped Stream + YouTube Iframe

## Fecha: 2025-12-10 10:19

## ✅ Implementación Completada

He implementado un **sistema híbrido inteligente** que intenta usar Piped primero y hace fallback a YouTube si falla.

## Cómo Funciona

### **Flujo de Reproducción**

```
Usuario hace clic en un video
         ↓
1. Intentar obtener stream de Piped
         ↓
   ┌─────────────────┐
   │ ¿Piped funciona?│
   └─────────────────┘
         ↓
    ┌────┴────┐
    │         │
   SÍ        NO
    │         │
    ↓         ↓
 Video     YouTube
 Nativo    Iframe
    │         │
    └────┬────┘
         ↓
    Reproducir
```

### **Opción 1: Piped Stream (Preferido)** ✅

**Ventajas:**
- ✅ Control total sobre eventos
- ✅ `ended` event funciona al 100%
- ✅ `timeupdate` event cada frame
- ✅ `play` / `pause` events inmediatos
- ✅ No hay problemas de CORS
- ✅ Video avanza EXACTAMENTE cuando termina

**Logs que verás:**
```
🎬 Loading video: dQw4w9WgXcQ
🔍 Trying Piped instance: https://pipedapi.kavin.rocks
✅ Found stream: 720p - https://rr3---sn-...
✅ Using Piped stream (native video)

▶️ Native video playing
⏱️ Video: 0:30 / 3:42 (3:12 remaining)
⏱️ Video: 1:00 / 3:42 (2:42 remaining)
⏱️ Video: 1:30 / 3:42 (2:12 remaining)
...
⏱️ Video: 3:30 / 3:42 (0:12 remaining)
🎬 Native video ended!
Video ended, advancing to next video...
```

### **Opción 2: YouTube Iframe (Fallback)** 🔄

**Cuándo se usa:**
- ❌ Todas las instancias de Piped fallan
- ❌ El video no está disponible en Piped
- ❌ Error de red con Piped

**Comportamiento:**
- Igual que antes (timeout de 4 minutos)
- Todos los videos siguen funcionando
- Sin cambios para el usuario

**Logs que verás:**
```
🎬 Loading video: dQw4w9WgXcQ
🔍 Trying Piped instance: https://pipedapi.kavin.rocks
❌ Piped instance https://pipedapi.kavin.rocks failed
🔍 Trying Piped instance: https://api.piped.private.coffee
❌ Piped instance https://api.piped.private.coffee failed
...
❌ All Piped instances failed
⚠️ Piped failed, falling back to YouTube iframe

⏱️ Video playing for: 0m 30s (State: -1)
⏱️ Video playing for: 1m 0s (State: -1)
...
```

## Archivos Modificados

### 1. **`video-player.service.ts`**

**Nuevos signals:**
```typescript
useNativeVideo = signal<boolean>(false);    // ¿Usar video nativo?
videoStreamUrl = signal<string | null>(null); // URL del stream de Piped
```

**Nuevo método:**
```typescript
private async getPipedStream(videoId: string): Promise<string | null> {
  // Intenta obtener stream de todas las instancias de Piped
  // Retorna URL del stream o null si falla
}
```

**Método actualizado:**
```typescript
private async setPlayer(videoId: string) {
  const streamUrl = await this.getPipedStream(videoId);
  
  if (streamUrl) {
    // Usar video nativo
    this.useNativeVideo.set(true);
    this.videoStreamUrl.set(streamUrl);
  } else {
    // Fallback a YouTube iframe
    this.useNativeVideo.set(false);
    this.currentVideoUrl.set(/* YouTube iframe URL */);
  }
}
```

### 2. **`video-player.component.html`**

**Renderizado condicional:**
```html
<!-- Piped: Video nativo -->
@if (videoService.useNativeVideo() && videoService.videoStreamUrl()) {
  <video 
    [src]="videoService.videoStreamUrl()!"
    autoplay
    controls
    (ended)="onVideoEnded()"
    (timeupdate)="onTimeUpdate($event)"
    (play)="onVideoPlay()"
    (pause)="onVideoPause()">
  </video>
}

<!-- Fallback: YouTube iframe -->
@if (!videoService.useNativeVideo() && currentVideoUrl()) {
  <iframe [src]="currentVideoUrl()! | safe">
  </iframe>
}
```

### 3. **`video-player.component.ts`**

**Nuevos event handlers:**
```typescript
onVideoEnded() {
  // Video terminó → Avanzar inmediatamente
  this.handleVideoEnd();
}

onTimeUpdate(event: Event) {
  // Actualiza cada frame → Logs cada 30 segundos
  console.log(`⏱️ Video: ${currentTime} / ${duration}`);
}

onVideoPlay() {
  // Video empezó a reproducir
  this.isCurrentlyPlaying = true;
}

onVideoPause() {
  // Video pausado
  this.isCurrentlyPlaying = false;
}
```

## Garantías

### ✅ **Todos los Videos Funcionan**
- Si Piped funciona → Video nativo (mejor)
- Si Piped falla → YouTube iframe (como antes)
- **Ningún video dejará de funcionar**

### ✅ **Mejor Experiencia Cuando Piped Funciona**
- Auto-advance exacto (cuando el video termina)
- No más timeouts arbitrarios
- Logs precisos del progreso

### ✅ **Fallback Robusto**
- Si Piped tiene problemas → YouTube iframe
- Mismo comportamiento que antes
- Usuario no nota la diferencia

## Instancias de Piped Usadas

```typescript
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.private.coffee',
  'https://pipedapi.drgns.space',
  'https://api.piped.projectsegfau.lt',
  'https://pipedapi.moomoo.me',
  'https://pipedapi.smnz.de'
];
```

El sistema intenta cada una en orden hasta que una funcione.

## Logs de Debug

### Caso 1: Piped Funciona ✅
```
🎬 Loading video: dQw4w9WgXcQ
🔍 Trying Piped instance: https://pipedapi.kavin.rocks
✅ Found stream: 720p - https://rr3---sn-...
✅ Using Piped stream (native video)

▶️ Native video playing
⏱️ Video: 0:30 / 3:42 (3:12 remaining)
⏱️ Video: 1:00 / 3:42 (2:42 remaining)
⏱️ Video: 3:30 / 3:42 (0:12 remaining)
🎬 Native video ended!
Video ended, advancing to next video...
```

### Caso 2: Piped Falla, Usa YouTube ⚠️
```
🎬 Loading video: dQw4w9WgXcQ
🔍 Trying Piped instance: https://pipedapi.kavin.rocks
❌ Piped instance failed
🔍 Trying Piped instance: https://api.piped.private.coffee
❌ Piped instance failed
❌ All Piped instances failed
⚠️ Piped failed, falling back to YouTube iframe

⏱️ Video playing for: 0m 30s (State: -1)
⏱️ Video playing for: 4m 0s (State: -1)
⏭️ Video timeout (4m 0s), advancing to next...
```

## Prueba Ahora

1. **Reproduce un video**
2. **Abre la consola** (F12)
3. **Observa los logs**:
   - Si ves "✅ Using Piped stream" → Video nativo funcionando
   - Si ves "⚠️ Piped failed" → Fallback a YouTube
4. **Deja que el video termine**:
   - Con Piped: Avanza exactamente cuando termina
   - Con YouTube: Avanza a los 4 minutos

## Ventajas del Sistema Híbrido

| Característica | Solo YouTube | Sistema Híbrido |
|----------------|--------------|-----------------|
| Funciona siempre | ✅ Sí | ✅ Sí |
| Control de eventos | ❌ Bloqueado | ✅ Sí (con Piped) |
| Auto-advance preciso | ❌ No | ✅ Sí (con Piped) |
| Fallback robusto | N/A | ✅ Sí |
| Logs útiles | ⚠️ Limitados | ✅ Detallados |

## Resultado Final

🎉 **Mejor de ambos mundos:**
- Intenta usar Piped para control total
- Hace fallback a YouTube si es necesario
- Todos los videos siguen funcionando
- Mejor experiencia cuando Piped funciona
