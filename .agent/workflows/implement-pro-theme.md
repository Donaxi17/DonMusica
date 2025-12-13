---
description: Plan de implementación para el Tema Dorado de DonMusica Pro
---

# Plan de Implementación: DonMusica Pro (Tema Dorado)

Este documento detalla los pasos técnicos para transformar la interfaz de DonMusic a un tema "Gold Premium" cuando el usuario activa el modo PRO.

## Estrategia Técnica
Usaremos **Variables CSS (CSS Custom Properties)** integradas con Tailwind. Esto permite cambiar los colores de toda la aplicación instantáneamente cambiando una sola clase en el `body`.

---

## Paso 1: Definir las Variables de Color Globales

Editar archivo: `src/styles.css`

**Acción:**
Agregar las definiciones de colores en `:root` (Modo Free/Default) y en una clase `.theme-pro-gold` (Modo Pro).

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
    /* Color Principal (Default: Emerald) */
    --primary-color: 16 185 129; /* r g b */
    --primary-hex: #10b981;
    
    /* Backgrounds */
    --bg-main: 9 9 11; /* zinc-950 */
    --bg-card: 24 24 27; /* zinc-900 */
}

/* Modo PRO (Gold/Dorado) */
.theme-pro-gold {
    /* Color Principal (Gold: Amber-400/500) */
    --primary-color: 251 191 36; /* #fbbf24 */
    --primary-hex: #fbbf24;

    /* Backgrounds Más Profundos/Premium */
    --bg-main: 0 0 0; /* Black puro */
    --bg-card: 28 25 23; /* stone-900 / warm black */
}

/* Clases de Utilidad para usar las variables */
.text-primary {
    color: rgb(var(--primary-color));
}
.bg-primary {
    background-color: rgb(var(--primary-color));
}
.border-primary {
    border-color: rgb(var(--primary-color));
}
.shadow-primary {
    --tw-shadow-color: rgb(var(--primary-color));
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
```

---

## Paso 2: Activar el Tema Globalmente

Editar archivo: `src/app/app.component.ts`

**Acción:**
Inyectar `DonMusicaProService` y usar un `effect` (Signal) para añadir o quitar la clase `theme-pro-gold` al `document.body`.

```typescript
// Pseudocódigo
constructor(private proService: DonMusicaProService) {
    effect(() => {
        if (this.proService.isPro()) {
            document.body.classList.add('theme-pro-gold');
        } else {
            document.body.classList.remove('theme-pro-gold');
        }
    });
}
```

---

## Paso 3: Reemplazo Masivo de Clases (Refactorización)

El trabajo principal será ir archivo por archivo reemplazando las clases estáticas de Tailwind por las nuevas clases dinámicas.

**Mapeo de Reemplazos:**

| Original (Estático) | Nuevo (Dinámico) |
| :--- | :--- |
| `text-emerald-500` | `text-[var(--primary-hex)]` o `text-primary` |
| `text-emerald-400` | `text-[var(--primary-hex)]` |
| `bg-emerald-500` | `bg-[var(--primary-hex)]` |
| `border-emerald-500` | `border-[var(--primary-hex)]` |
| `from-emerald-400` | `from-[var(--primary-hex)]` |
| `via-emerald-500` | `via-[var(--primary-hex)]` |
| `to-emerald-600` | `to-[var(--primary-hex)]` |

**Archivos Prioritarios a Modificar:**

1.  `src/app/components/player/player.component.html` (Barra de progreso, controles)
2.  `src/app/components/upload-music/upload-music.component.html` (Iconos, barras de almacenamiento)
3.  `src/app/components/home/home.component.html` (Tarjetas, botones principales)
4.  `src/app/components/shared/nav/nav.component.html` (Indicadores de menú activo)

---

## Paso 4: Detalles Específicos (Pulido)

1.  **Imágenes/Logos:** Si hay logotipos que son imágenes estáticas verdes, se podría necesitar un filtro CSS para cambiarlos a dorado:
    `filter: sepia(100%) saturate(500%) hue-rotate(5deg);` (ajustar valores para oro).
2.  **Gradientes:** Asegurar que los gradientes complejos (ej: `bg-gradient-to-r`) usen variables CSS para que se transformen de "Verde->Azul" a "Dorado->Negro" por ejemplo.

---

**Nota:** Este archivo sirve como prompt para ejecutar la tarea. Cuando estés listo, simplemente pide: "Ejecuta el plan de implementación de DonMusica Pro".
