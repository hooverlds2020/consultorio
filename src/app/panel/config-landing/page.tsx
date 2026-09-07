import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";

const SECCIONES = [
  { href: "/panel/config-landing/hero", titulo: "Inicio (Hero)", descripcion: "Título principal, subtítulo y botón de WhatsApp" },
  { href: "/panel/config-landing/nosotros", titulo: "Nosotros", descripcion: "Texto sobre la clínica" },
  { href: "/panel/catalogo", titulo: "Servicios", descripcion: "Se muestran automáticamente desde el Catálogo de servicios" },
  { href: "/panel/config-landing/galeria", titulo: "Galería", descripcion: "Fotos generales y antes/después" },
  { href: "/panel/config-landing/testimonios", titulo: "Testimonios", descripcion: "Opiniones de pacientes" },
  { href: "/panel/config-landing/contacto", titulo: "Contacto", descripcion: "Dirección, teléfono, horario y mapa" },
];

export default async function ConfigLandingPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-2">
        Contenido de la página web
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Edita aquí lo que ven los pacientes en{" "}
        <a href="/" target="_blank" className="text-clinica-azul hover:underline">
          la página pública
        </a>
        .
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECCIONES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition"
          >
            <h3 className="font-medium text-clinica-azulOscuro">{s.titulo}</h3>
            <p className="text-sm text-gray-500 mt-1">{s.descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
