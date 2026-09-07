import { prisma } from "@/lib/prisma";
import { listarServiciosActivos } from "@/actions/catalogo";
import { listarTestimoniosActivos, listarGaleriaActiva } from "@/actions/landing";

// La landing consulta la base de datos en cada visita (contenido editable
// desde el panel), así que no debe pre-construirse como página estática
// en build time — ahí todavía no hay conexión a la BD disponible.
export const dynamic = "force-dynamic";

type ContenidoHero = { titulo?: string; subtitulo?: string; textoBoton?: string; whatsappCta?: string };
type ContenidoNosotros = { texto?: string };
type ContenidoContacto = {
  direccion?: string;
  telefono?: string;
  whatsapp?: string;
  horario?: string;
  mapaUrl?: string;
};

function linkWhatsapp(numero: string | undefined, mensaje: string): string {
  const digitos = (numero ?? "").replace(/\D/g, "");
  const conCodigo = digitos.length === 10 ? `52${digitos}` : digitos;
  return `https://wa.me/${conCodigo}?text=${encodeURIComponent(mensaje)}`;
}

export default async function InicioPage() {
  const [heroConfig, nosotrosConfig, contactoConfig, servicios, testimonios, galeria] =
    await Promise.all([
      prisma.configLanding.findUnique({ where: { seccion: "HERO" } }),
      prisma.configLanding.findUnique({ where: { seccion: "NOSOTROS" } }),
      prisma.configLanding.findUnique({ where: { seccion: "CONTACTO" } }),
      listarServiciosActivos(),
      listarTestimoniosActivos(),
      listarGaleriaActiva(),
    ]);

  const hero = (heroConfig?.contenidoJson as ContenidoHero) ?? {};
  const nosotros = (nosotrosConfig?.contenidoJson as ContenidoNosotros) ?? {};
  const contacto = (contactoConfig?.contenidoJson as ContenidoContacto) ?? {};

  const tituloHero = hero.titulo || "Tu sonrisa es nuestra prioridad";
  const subtituloHero =
    hero.subtitulo || "Atención dental de calidad para toda la familia en Chiapas.";
  const textoBotonHero = hero.textoBoton || "Agenda tu cita por WhatsApp";
  const whatsappPrincipal = hero.whatsappCta || contacto.whatsapp;

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Barra de navegación */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b z-10">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-clinica-azulOscuro">Laboratorio y Consultorio Dental</span>
          <div className="hidden md:flex gap-6 text-sm text-gray-600">
            <a href="#inicio" className="hover:text-clinica-azul">Inicio</a>
            <a href="#servicios" className="hover:text-clinica-azul">Servicios</a>
            <a href="#nosotros" className="hover:text-clinica-azul">Nosotros</a>
            <a href="#galeria" className="hover:text-clinica-azul">Galería</a>
            <a href="#testimonios" className="hover:text-clinica-azul">Testimonios</a>
            <a href="#contacto" className="hover:text-clinica-azul">Contacto</a>
          </div>
          <a
            href="/login"
            className="text-sm border border-clinica-azul text-clinica-azul px-4 py-1.5 rounded-md hover:bg-clinica-azulClaro transition"
          >
            Acceso al panel
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section id="inicio" className="bg-clinica-azulClaro">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-clinica-azulOscuro mb-4">
            {tituloHero}
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">{subtituloHero}</p>
          {whatsappPrincipal && (
            <a
              href={linkWhatsapp(whatsappPrincipal, "Hola, me gustaría agendar una cita.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
            >
              {textoBotonHero}
            </a>
          )}
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-clinica-azulOscuro text-center mb-10">
          Nuestros servicios
        </h2>
        {servicios.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">
            Próximamente publicaremos aquí nuestro catálogo de servicios.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {servicios.map((s) => (
              <div key={s.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                <h3 className="font-medium text-clinica-azulOscuro">{s.nombre}</h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-clinica-azulOscuro mb-6">Nosotros</h2>
          <p className="text-gray-600 whitespace-pre-wrap">
            {nosotros.texto ||
              "Somos un consultorio dental comprometido con la salud bucal de nuestros pacientes, ofreciendo atención personalizada y de calidad."}
          </p>
        </div>
      </section>

      {/* Galería */}
      <section id="galeria" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-clinica-azulOscuro text-center mb-10">Galería</h2>
        {galeria.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">
            Próximamente compartiremos fotos de nuestro consultorio y resultados de tratamientos.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {galeria.map((img) =>
              img.tipo === "GENERAL" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.imagenAntesPath!}
                  alt="Galería del consultorio"
                  className="w-full h-40 object-cover rounded-lg"
                />
              ) : (
                <div key={img.id} className="col-span-2 grid grid-cols-2 gap-1">
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imagenAntesPath!} alt="Antes" className="w-full h-40 object-cover rounded-l-lg" />
                    <p className="text-center text-xs text-gray-400 mt-1">Antes</p>
                  </div>
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imagenDespuesPath!} alt="Después" className="w-full h-40 object-cover rounded-r-lg" />
                    <p className="text-center text-xs text-gray-400 mt-1">Después</p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-clinica-azulOscuro text-center mb-10">
            Lo que dicen nuestros pacientes
          </h2>
          {testimonios.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">
              Pronto compartiremos aquí las opiniones de nuestros pacientes.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonios.map((t) => (
                <div key={t.id} className="bg-white rounded-lg shadow-sm p-5">
                  {t.calificacion && (
                    <p className="text-yellow-500 mb-2">{"★".repeat(t.calificacion)}</p>
                  )}
                  <p className="text-gray-600 text-sm italic mb-3">"{t.texto}"</p>
                  <p className="text-sm font-medium text-clinica-azulOscuro">{t.nombrePaciente}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-clinica-azulOscuro text-center mb-10">Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3 text-gray-600">
            {contacto.direccion && <p>📍 {contacto.direccion}</p>}
            {contacto.telefono && <p>📞 {contacto.telefono}</p>}
            {contacto.horario && <p>🕒 {contacto.horario}</p>}
            {contacto.whatsapp && (
              <a
                href={linkWhatsapp(contacto.whatsapp, "Hola, tengo una pregunta.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Escríbenos por WhatsApp
              </a>
            )}
            {!contacto.direccion && !contacto.telefono && !contacto.whatsapp && (
              <p className="text-gray-400 text-sm">
                Información de contacto próximamente.
              </p>
            )}
          </div>
          {contacto.mapaUrl && (
            <iframe
              src={contacto.mapaUrl}
              className="w-full h-64 rounded-lg border-0"
              loading="lazy"
              title="Ubicación"
            />
          )}
        </div>
      </section>

      <footer className="bg-clinica-azulOscuro text-white text-center py-6 text-sm">
        © {new Date().getFullYear()} Laboratorio y Consultorio Dental. Todos los derechos reservados.
      </footer>
    </main>
  );
}
