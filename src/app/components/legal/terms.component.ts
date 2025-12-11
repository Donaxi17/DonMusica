import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 md:px-8">
      <div class="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-8">Términos y Condiciones de Uso</h1>
        
        <div class="space-y-6 text-sm md:text-base leading-relaxed">
          <p class="text-zinc-400">Última actualización: 11 de Diciembre de 2025</p>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar DonMusica ("el Sitio", "nosotros", "nuestro"), usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.</p>
            <p class="mt-2">El uso continuado del Sitio constituye su aceptación de estos términos y de cualquier modificación futura.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">2. Descripción del Servicio</h2>
            <p>DonMusica es una plataforma de streaming de música que:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Proporciona acceso a contenido musical mediante enlaces a servicios de terceros (YouTube, iTunes)</li>
              <li>NO aloja archivos de música o video en nuestros servidores</li>
              <li>Actúa como agregador de contenido musical disponible públicamente</li>
              <li>Ofrece funcionalidades de búsqueda y reproducción de contenido</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">3. Derechos de Autor y Propiedad Intelectual</h2>
            <p><strong>Importante:</strong> Todo el contenido musical (canciones, videos, imágenes, letras) mostrado en DonMusica es propiedad de sus respectivos dueños y está protegido por leyes de derechos de autor.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>NO somos propietarios del contenido musical mostrado</li>
              <li>NO alojamos archivos de música o video</li>
              <li>Solo proporcionamos enlaces a contenido alojado en plataformas legítimas (YouTube, iTunes)</li>
              <li>Respetamos todos los derechos de autor y propiedad intelectual</li>
              <li>Si cree que su contenido está siendo usado indebidamente, contáctenos inmediatamente</li>
            </ul>
            <p class="mt-2">El diseño, logotipo y código del Sitio son propiedad de DonMusica y están protegidos por derechos de autor.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">4. Contenido de Terceros</h2>
            <p>El Sitio utiliza APIs y servicios de terceros, incluyendo:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li><strong>YouTube:</strong> Para reproducción de videos musicales</li>
              <li><strong>iTunes:</strong> Para información de canciones y álbumes</li>
              <li><strong>Google AdSense:</strong> Para mostrar publicidad</li>
            </ul>
            <p class="mt-2">No somos responsables del contenido, políticas o prácticas de estos servicios de terceros. El uso de estos servicios está sujeto a sus propios términos y condiciones.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">5. Uso Aceptable</h2>
            <p>Usted se compromete a NO utilizar el Sitio para:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Descargar, copiar o distribuir contenido protegido por derechos de autor sin autorización</li>
              <li>Violar cualquier ley local, nacional o internacional</li>
              <li>Infringir los derechos de propiedad intelectual de terceros</li>
              <li>Distribuir malware, virus o código malicioso</li>
              <li>Intentar acceder no autorizado a nuestros sistemas</li>
              <li>Recopilar datos de otros usuarios sin su consentimiento</li>
              <li>Usar el Sitio para fines comerciales sin autorización</li>
              <li>Interferir con el funcionamiento normal del Sitio</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">6. Publicidad</h2>
            <p>El Sitio muestra publicidad mediante Google AdSense. Al usar el Sitio, usted acepta:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Ver anuncios como parte de la experiencia del usuario</li>
              <li>Que Google puede usar cookies para personalizar anuncios</li>
              <li>Las políticas de publicidad de Google AdSense</li>
            </ul>
            <p class="mt-2">No somos responsables del contenido de los anuncios mostrados por terceros.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">7. Descargo de Responsabilidad</h2>
            <p>El Sitio se proporciona "tal cual" y "según disponibilidad" sin garantías de ningún tipo. No garantizamos que:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>El Sitio estará disponible ininterrumpidamente</li>
              <li>El contenido será siempre preciso o actualizado</li>
              <li>Los enlaces a servicios de terceros funcionarán correctamente</li>
              <li>El Sitio estará libre de errores o virus</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">8. Limitación de Responsabilidad</h2>
            <p>En ningún caso DonMusica, ni sus directores, empleados, socios o afiliados, serán responsables por:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Daños directos, indirectos, incidentales o consecuentes</li>
              <li>Pérdida de beneficios, datos o uso</li>
              <li>Contenido de terceros o servicios externos</li>
              <li>Acciones tomadas basadas en el contenido del Sitio</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">9. Notificación de Infracción de Derechos de Autor</h2>
            <p>Si cree que su contenido protegido por derechos de autor ha sido usado de manera que constituye una infracción, contáctenos con:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Descripción del trabajo protegido por derechos de autor</li>
              <li>URL donde se encuentra el contenido infractor</li>
              <li>Su información de contacto</li>
              <li>Declaración de buena fe</li>
            </ul>
            <p class="mt-2">Eliminaremos el contenido infractor lo antes posible.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">10. Modificaciones de los Términos</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el Sitio. Es su responsabilidad revisar estos términos periódicamente.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">11. Ley Aplicable</h2>
            <p>Estos términos se regirán e interpretarán de acuerdo con las leyes de Colombia, sin tener en cuenta sus disposiciones sobre conflictos de leyes.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">12. Contacto</h2>
            <p>Si tiene alguna pregunta sobre estos Términos o desea reportar una infracción de derechos de autor, contáctenos en:</p>
            <p class="mt-2"><a href="mailto:contacto&#64;donmusica.online" class="text-emerald-400 hover:underline">contacto&#64;donmusica.online</a></p>
          </section>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent { }
