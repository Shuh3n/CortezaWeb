import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="pt-24 pb-16 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-text-h tracking-tight mb-4 text-center">
          Política de Privacidad y Tratamiento de Datos Personales
        </h1>
        <p className="text-text-muted text-center mb-12">
          Última actualización: 2026
        </p>

        <div className="prose prose-lg prose-slate max-w-none text-text-body space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">1. Introducción</h2>
            <p>
              En la Fundación Corteza Terrestre (en adelante "la Fundación", "nosotros" o "nuestro"), estamos comprometidos con la protección y el respeto de tu privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, protegemos y compartimos la información personal de los usuarios (en adelante "el Usuario" o "tú") que visitan nuestro sitio web <a href="https://cortezaterrestre.org" className="text-primary hover:underline">https://cortezaterrestre.org</a>, así como de aquellas personas que interactúan con nosotros a través de formularios de adopción, apadrinamiento, donaciones o consultas generales.
            </p>
            <p className="mt-2">
              Al navegar por nuestro sitio web o utilizar nuestros servicios, aceptas las prácticas descritas en esta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">2. Responsable del Tratamiento de la Información</h2>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>Razón Social:</strong> Fundación Corteza Terrestre</li>
              <li><strong>Sitio Web:</strong> <a href="https://cortezaterrestre.org" className="text-primary hover:underline">https://cortezaterrestre.org</a></li>
              <li><strong>Correo Electrónico de Contacto:</strong> <a href="mailto:ayuda@cortezaterrestre.org" className="text-primary hover:underline">ayuda@cortezaterrestre.org</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">3. Datos Personales que Recopilamos</h2>
            <p className="mb-4">
              Recopilamos información personal únicamente cuando nos la proporcionas de forma voluntaria. Los datos que podemos solicitar incluyen, entre otros:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>Información de contacto:</strong> Nombre completo, número de teléfono, dirección de residencia y correo electrónico.</li>
              <li><strong>Información para procesos de adopción/apadrinamiento:</strong> Datos contenidos en el "Compromiso de Adopción" o "Compromiso de Apadrinamiento", información sobre el estilo de vida, composición familiar y capacidad económica (estrictamente lo necesario para garantizar el bienestar de los animales).</li>
              <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, tiempo de navegación y páginas visitadas (recopilada automáticamente a través de cookies y herramientas de análisis para mejorar nuestro sitio web).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">4. Finalidad del Tratamiento de los Datos</h2>
            <p className="mb-4">
              Los datos personales proporcionados serán utilizados exclusivamente para los siguientes propósitos:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>Gestión de Adopciones y Apadrinamientos:</strong> Evaluar las solicitudes, procesar los formularios (compromisos) enviados a nuestro correo y realizar seguimiento a los animales entregados en adopción.</li>
              <li><strong>Gestión de Donaciones y Voluntariado:</strong> Procesar aportes económicos o en especie y coordinar la participación en actividades de la Fundación.</li>
              <li><strong>Comunicación Institucional:</strong> Responder a consultas, dudas o comentarios enviados a través de nuestros canales de atención o sitio web.</li>
              <li><strong>Campañas de Concientización:</strong> Enviar información relevante sobre jornadas de esterilización, eventos, noticias del refugio y campañas de recaudación de fondos (siempre con la opción de darse de baja).</li>
              <li><strong>Cumplimiento Legal:</strong> Atender requerimientos de autoridades competentes en relación con la protección y tenencia responsable de animales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">5. Derechos del Titular de los Datos (Habeas Data)</h2>
            <p className="mb-4">
              De acuerdo con la Ley 1581 de 2012 y normativas complementarias en Colombia, como titular de tus datos personales, tienes derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li>Conocer, actualizar y rectificar tus datos personales frente a la Fundación.</li>
              <li>Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.</li>
              <li>Ser informado sobre el uso que se le ha dado a tus datos personales.</li>
              <li>Revocar la autorización y/o solicitar la supresión del dato cuando en el tratamiento no se respeten los principios, derechos y garantías constitucionales y legales.</li>
              <li>Acceder en forma gratuita a tus datos personales que hayan sido objeto de Tratamiento.</li>
            </ul>
            <p className="mt-4">
              Para ejercer cualquiera de estos derechos, puedes enviar una solicitud formal a nuestro correo electrónico: <a href="mailto:ayuda@cortezaterrestre.org" className="text-primary hover:underline">ayuda@cortezaterrestre.org</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">6. Protección y Seguridad de la Información</h2>
            <p>
              La Fundación Corteza Terrestre adopta las medidas técnicas, humanas y administrativas necesarias para garantizar la seguridad de los datos personales y evitar su alteración, pérdida, consulta, uso o acceso no autorizado o fraudulento. No vendemos, alquilamos ni compartimos la información personal de nuestros usuarios con terceros con fines comerciales.
            </p>
            <p className="mt-2">
              Solo compartiremos información cuando sea estrictamente necesario para cumplir con un requerimiento legal o judicial.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">7. Uso de Cookies</h2>
            <p>
              Nuestro sitio web puede utilizar "cookies" para mejorar la experiencia del usuario. Las cookies son pequeños archivos de texto que se guardan en el dispositivo del usuario para recordar preferencias y analizar el tráfico de la web. Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envíe una cookie. Sin embargo, si no aceptas las cookies, es posible que algunas funciones del sitio web no operen correctamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">8. Enlaces a Sitios de Terceros</h2>
            <p>
              Nuestro sitio web puede contener enlaces a otros sitios de interés (ej. redes sociales o plataformas de pago). Una vez que hagas clic en estos enlaces y abandones nuestra página, ya no tenemos control sobre el sitio al que eres redirigido y, por lo tanto, no somos responsables de los términos de privacidad ni de la protección de tus datos en esos sitios de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">9. Cambios a esta Política de Privacidad</h2>
            <p>
              La Fundación Corteza Terrestre se reserva el derecho de actualizar o modificar esta Política de Privacidad en cualquier momento para adaptarla a novedades legislativas o nuevas dinámicas de la organización. Te recomendamos revisar esta página periódicamente. Cualquier cambio será notificado publicando la versión actualizada en esta misma URL.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-h mb-4">10. Contacto</h2>
            <p className="mb-4">
              Si tienes alguna pregunta, duda o comentario sobre esta Política de Privacidad y Tratamiento de Datos, por favor contáctanos:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>Correo electrónico:</strong> <a href="mailto:ayuda@cortezaterrestre.org" className="text-primary hover:underline">ayuda@cortezaterrestre.org</a></li>
              <li><strong>Página Web:</strong> <a href="https://cortezaterrestre.org" className="text-primary hover:underline">https://cortezaterrestre.org</a></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
