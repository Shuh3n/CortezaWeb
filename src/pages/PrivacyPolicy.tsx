import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const PrivacyPolicy = () => {
  const sections = [
    {
      title: '1. Introducción',
      content: (
        <>
          <p>
            En la Fundación Corteza Terrestre (en adelante "la Fundación", "nosotros" o "nuestro"), estamos comprometidos con la protección y el respeto de tu privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, protegemos y compartimos la información personal de los usuarios (en adelante "el Usuario" o "tú") que visitan nuestro sitio web <a href="https://cortezaterrestre.org" className="text-primary hover:underline font-semibold">https://cortezaterrestre.org</a>, así como de aquellas personas que interactúan con nosotros a través de formularios de adopción, apadrinamiento, donaciones o consultas generales.
          </p>
          <p className="mt-3">
            Al navegar por nuestro sitio web o utilizar nuestros servicios, aceptas las prácticas descritas en esta política.
          </p>
        </>
      ),
    },
    {
      title: '2. Responsable del Tratamiento de la Información',
      content: (
        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
          <li><strong>Razón Social:</strong> Fundación Corteza Terrestre</li>
          <li><strong>Sitio Web:</strong> <a href="https://cortezaterrestre.org" className="text-primary hover:underline font-semibold">https://cortezaterrestre.org</a></li>
          <li><strong>Correo Electrónico de Contacto:</strong> <a href="mailto:ayuda@cortezaterrestre.org" className="text-primary hover:underline font-semibold">ayuda@cortezaterrestre.org</a></li>
        </ul>
      ),
    },
    {
      title: '3. Datos Personales que Recopilamos',
      content: (
        <>
          <p className="mb-4">
            Recopilamos información personal únicamente cuando nos la proporcionas de forma voluntaria. Los datos que podemos solicitar incluyen, entre otros:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li><strong>Información de contacto:</strong> Nombre completo, número de teléfono, dirección de residencia y correo electrónico.</li>
            <li><strong>Información para procesos de adopción/apadrinamiento:</strong> Datos contenidos en el "Compromiso de Adopción" o "Compromiso de Apadrinamiento", información sobre el estilo de vida, composición familiar y capacidad económica (estrictamente lo necesario para garantizar el bienestar de los animales).</li>
            <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, tiempo de navegación y páginas visitadas (recopilada automáticamente a través de cookies y herramientas de análisis para mejorar nuestro sitio web).</li>
          </ul>
        </>
      ),
    },
    {
      title: '4. Finalidad del Tratamiento de los Datos',
      content: (
        <>
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
        </>
      ),
    },
    {
      title: '5. Derechos del Titular de los Datos (Habeas Data)',
      content: (
        <>
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
            Para ejercer cualquiera de estos derechos, puedes enviar una solicitud formal a nuestro correo electrónico: <a href="mailto:ayuda@cortezaterrestre.org" className="text-primary hover:underline font-semibold">ayuda@cortezaterrestre.org</a>.
          </p>
        </>
      ),
    },
    {
      title: '6. Protección y Seguridad de la Información',
      content: (
        <>
          <p>
            La Fundación Corteza Terrestre adopta las medidas técnicas, humanas y administrativas necesarias para garantizar la seguridad de los datos personales y evitar su alteración, pérdida, consulta, uso o acceso no autorizado o fraudulento. No vendemos, alquilamos ni compartimos la información personal de nuestros usuarios con terceros con fines comerciales.
          </p>
          <p className="mt-3">
            Solo compartiremos información cuando sea estrictamente necesario para cumplir con un requerimiento legal o judicial.
          </p>
        </>
      ),
    },
    {
      title: '7. Uso de Cookies',
      content: (
        <p>
          Nuestro sitio web puede utilizar "cookies" para mejorar la experiencia del usuario. Las cookies son pequeños archivos de texto que se guardan en el dispositivo del usuario para recordar preferencias y analizar el tráfico de la web. Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envíe una cookie. Sin embargo, si no aceptas las cookies, es posible que algunas funciones del sitio web no operen correctamente.
        </p>
      ),
    },
    {
      title: '8. Enlaces a Sitios de Terceros',
      content: (
        <p>
          Nuestro sitio web puede contener enlaces a otros sitios de interés (ej. redes sociales o plataformas de pago). Una vez que hagas clic en estos enlaces y abandones nuestra página, ya no tenemos control sobre el sitio al que eres redirigido y, por lo tanto, no somos responsables de los términos de privacidad ni de la protección de tus datos en esos sitios de terceros.
        </p>
      ),
    },
    {
      title: '9. Cambios a esta Política de Privacidad',
      content: (
        <p>
          La Fundación Corteza Terrestre se reserva el derecho de actualizar o modificar esta Política de Privacidad en cualquier momento para adaptarla a novedades legislativas o nuevas dinámicas de la organización. Te recomendamos revisar esta página periódicamente. Cualquier cambio será notificado publicando la versión actualizada en esta misma URL.
        </p>
      ),
    },
    {
      title: '10. Contacto',
      content: (
        <>
          <p className="mb-4">
            Si tienes alguna pregunta, duda o comentario sobre esta Política de Privacidad y Tratamiento de Datos, por favor contáctanos:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li><strong>Correo electrónico:</strong> <a href="mailto:ayuda@cortezaterrestre.org" className="text-primary hover:underline font-semibold">ayuda@cortezaterrestre.org</a></li>
            <li><strong>Página Web:</strong> <a href="https://cortezaterrestre.org" className="text-primary hover:underline font-semibold">https://cortezaterrestre.org</a></li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Banner */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/70" />

        {/* Decorative blurred circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"
        />

        <div className="w-full lg:w-[70%] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-8 border border-white/20"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent font-bold text-sm mb-6 tracking-widest uppercase"
            >
              Protección de Datos
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6"
            >
              Política de Privacidad y{' '}
              <span className="text-accent underline decoration-white/20 decoration-4 underline-offset-8">
                Tratamiento de Datos
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-white/80 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Última actualización: 2026
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 30C1440 30 1200 0 720 0C240 0 0 30 0 30L0 60Z" fill="#fdfaf6" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="bg-neutral-soft pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={sectionVariants}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/10 transition-all duration-300"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-text-h mb-4 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary text-sm font-black shrink-0">
                    {i + 1}
                  </span>
                  {section.title.replace(/^\d+\.\s*/, '')}
                </h2>
                <div className="text-text-main leading-relaxed pl-12">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 text-center"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Inicio
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default PrivacyPolicy;
