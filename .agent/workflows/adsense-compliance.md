---
description: Guía de cumplimiento para Google AdSense
---

# Cumplimiento de AdSense para DonMusica

Este documento detalla las medidas tomadas para cumplir con las políticas de Google AdSense y evitar rechazos por "Contenido de bajo valor" o "Pantallas sin contenido".

## 1. Contenido Rico (SEO) y Diseño Premium
AdSense requiere texto sustancial y una buena experiencia de usuario (UX).
- **Home:** Se ha implementado una sección **"Sobre DonMusica" con diseño Premium (Glassmorphism)**.
    - Utiliza un grid de tarjetas interactivas con iconos y gradientes para presentar las características clave (Smart Shuffle, Calidad, Comunidad).
    - **Internacionalización (i18n):** Todo el texto está traducido (Español/Inglés) y se carga dinámicamente desde `LanguageService`. Esto mejora la calidad percibida del sitio y la accesibilidad.
- **Blog:** Se han implementado artículos "Evergreen" (estáticos) hardcodeados en `blog.component.ts`. Estos artículos aparecen siempre, garantizando que la página del blog nunca esté vacía.

## 2. Páginas Legales
Las páginas legales deben ser accesibles y completas.
- **Política de Privacidad:** (`privacy-policy.component.ts`) Incluye secciones obligatorias sobre:
    - Cookies y Web Beacons (DoubleClick DART).
    - Archivos de registro (Log Files).
    - Políticas de privacidad de terceros.
    - Información para niños (COPPA).
- **Términos y Condiciones:** (`terms.component.ts`) Define claramente el uso del servicio.

## 3. Manejo de Errores (Evitar Pantallas Vacías)
- En `blog.component.ts`, el método `loadPosts()` incluye manejo de errores (`catchError`) para asegurar que el spinner de carga desaparezca y se muestre el contenido estático si la API falla.

## Recomendaciones Futuras
- Si añades nuevas secciones (ej. "Foro" o "Tienda"), asegúrate de incluir texto descriptivo y no solo elementos interactivos vacíos.
- Mantén los artículos "Evergreen" actualizados y considera añadir más si es necesario.
