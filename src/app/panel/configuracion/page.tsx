import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ListChecks, Globe } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";

const SECCIONES = [
  { href: "/panel/usuarios", titulo: "Usuarios", descripcion: "Alta de dentistas, recepcionistas y técnico de laboratorio", icono: Users },
  { href: "/panel/catalogo", titulo: "Catálogo de servicios", descripcion: "Servicios y precios usados en las cotizaciones", icono: ListChecks },
  { href: "/panel/config-landing", titulo: "Editar página web", descripcion: "Contenido de la landing pública (inicio, testimonios, galería, contacto)", icono: Globe },
];

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  return (
    <div>
      <h1 className="text-[20px] md:text-2xl font-bold text-gray-900 mb-1">Configuración</h1>
      <p className="text-sm text-gray-500 mb-6">Ajustes administrativos del sistema.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SECCIONES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-lg bg-clinica-azulClaro text-clinica-azul flex items-center justify-center mb-3">
              <s.icono size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">{s.titulo}</h3>
            <p className="text-sm text-gray-500 mt-1">{s.descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
