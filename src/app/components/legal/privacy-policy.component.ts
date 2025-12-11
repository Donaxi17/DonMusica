import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 md:px-8">
      <div class="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-8">Política de Privacidad</h1>
        
        <div class="space-y-6 text-sm md:text-base leading-relaxed">
          <p class="text-zinc-400">Última actualización: 11 de Diciembre de 2025</p>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">1. Introducción</h2>
            <p>Bienvenido a DonMusica ("nosotros", "nuestro" o "el sitio"). Respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta política de privacidad le informará sobre cómo cuidamos sus datos personales cuando visita nuestro sitio web y le informará sobre sus derechos de privacidad.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">2. Información que Recopilamos</h2>
            <p>Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Datos de Identidad:</strong> nombre de usuario (si se registra).</li>
              <li><strong>Datos de Contacto:</strong> dirección de correo electrónico (si se suscribe).</li>
              <li><strong>Datos Técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, zona horaria.</li>
              <li><strong>Datos de Uso:</strong> información sobre cómo usa nuestro sitio web, páginas visitadas, tiempo de permanencia.</li>
              <li><strong>Datos de Marketing:</strong> sus preferencias para recibir comunicaciones de marketing.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">3. Cookies y Tecnologías Similares</h2>
            <p>Utilizamos cookies y tecnologías similares para:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Mejorar la funcionalidad del sitio</li>
              <li>Analizar el tráfico del sitio</li>
              <li>Personalizar su experiencia</li>
              <li>Mostrar publicidad relevante</li>
            </ul>
            <p class="mt-2">Puede configurar su navegador para rechazar todas o algunas cookies, pero esto puede afectar la funcionalidad del sitio.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">4. Publicidad de Terceros (Google AdSense)</h2>
            <p>Utilizamos Google AdSense para mostrar anuncios en nuestro sitio. Google utiliza cookies para mostrar anuncios basados en sus visitas anteriores a este u otros sitios web.</p>
            <p class="mt-2">Los usuarios pueden inhabilitar la publicidad personalizada visitando la <a href="https://www.google.com/settings/ads" target="_blank" class="text-emerald-400 hover:underline">Configuración de Anuncios de Google</a>.</p>
            <p class="mt-2">Para más información sobre cómo Google utiliza los datos, visite la <a href="https://policies.google.com/technologies/partner-sites" target="_blank" class="text-emerald-400 hover:underline">Política de Privacidad de Google</a>.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">5. Contenido de Terceros</h2>
            <p>Nuestro sitio puede contener enlaces a sitios web de terceros, incluyendo:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li><strong>YouTube:</strong> Reproducimos videos musicales alojados en YouTube mediante su API oficial.</li>
              <li><strong>iTunes:</strong> Mostramos información de música disponible en iTunes.</li>
              <li><strong>Redes Sociales:</strong> Enlaces a perfiles de redes sociales.</li>
            </ul>
            <p class="mt-2">No somos responsables del contenido o las políticas de privacidad de estos sitios de terceros.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">6. Derechos de Autor</h2>
            <p>Todo el contenido musical (videos, canciones, imágenes) mostrado en DonMusica es propiedad de sus respectivos dueños. Nosotros:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>NO alojamos ningún archivo de música o video en nuestros servidores</li>
              <li>Solo proporcionamos enlaces a contenido alojado en plataformas legítimas (YouTube, iTunes)</li>
              <li>Respetamos todos los derechos de autor y propiedad intelectual</li>
              <li>Eliminaremos cualquier contenido si se nos notifica una infracción de derechos de autor</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">7. Cómo Usamos sus Datos</h2>
            <p>Solo utilizaremos sus datos personales cuando la ley lo permita. Principalmente para:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Personalizar su experiencia en el sitio</li>
              <li>Enviar comunicaciones de marketing (solo si ha dado su consentimiento)</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Mostrar publicidad relevante</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">8. Seguridad de Datos</h2>
            <p>Hemos implementado medidas de seguridad apropiadas para prevenir que sus datos personales sean accidentalmente perdidos, usados o accedidos de manera no autorizada.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">9. Sus Derechos Legales</h2>
            <p>Bajo ciertas circunstancias, usted tiene derechos bajo las leyes de protección de datos, incluyendo el derecho a:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Solicitar acceso a sus datos personales</li>
              <li>Solicitar corrección de sus datos personales</li>
              <li>Solicitar eliminación de sus datos personales</li>
              <li>Objetar el procesamiento de sus datos personales</li>
              <li>Solicitar la restricción del procesamiento de sus datos personales</li>
              <li>Solicitar la transferencia de sus datos personales</li>
              <li>Retirar el consentimiento</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">10. Cambios a esta Política</h2>
            <p>Podemos actualizar esta política de privacidad de vez en cuando. Le notificaremos de cualquier cambio publicando la nueva política en esta página y actualizando la fecha de "Última actualización".</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">11. Contacto</h2>
            <p>Si tiene preguntas sobre esta política de privacidad o desea ejercer sus derechos, contáctenos en:</p>
            <p class="mt-2"><a href="mailto:contacto&#64;donmusica.online" class="text-emerald-400 hover:underline">contacto&#64;donmusica.online</a></p>
          </section>
        </div>
      </div>
    </div>
  `
})
export class PrivacyPolicyComponent { }
