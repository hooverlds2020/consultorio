import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes, puedeGestionarAgenda, esSuperAdmin, puedeGestionarOrdenesLab, puedeVerFinanzas, puedeVerInventario } from "@/lib/permisos";
import CerrarSesionBoton from "@/components/CerrarSesionBoton";

const NOMBRES_ROL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  RECEPCIONISTA: "Recepcionista",
  DENTISTA: "Dentista",
  TECNICO_LAB: "Técnico de Laboratorio",
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="font-semibold text-clinica-azulOscuro">
                Laboratorio y Consultorio Dental
              </p>
              <p className="text-xs text-gray-500">
                {session.user.name} · {NOMBRES_ROL[session.user.rol]}
              </p>
            </div>
            <nav className="flex gap-4 text-sm text-gray-600">
              <Link href="/panel" className="hover:text-clinica-azul">
                Inicio
              </Link>
              {puedeGestionarPacientes(session.user.rol) && (
                <Link href="/panel/pacientes" className="hover:text-clinica-azul">
                  Pacientes
                </Link>
              )}
              {puedeGestionarAgenda(session.user.rol) && (
                <Link href="/panel/agenda" className="hover:text-clinica-azul">
                  Agenda
                </Link>
              )}
              {puedeGestionarOrdenesLab(session.user.rol) && (
                <Link href="/panel/lab/ordenes" className="hover:text-clinica-azul">
                  Laboratorio
                </Link>
              )}
              {puedeVerInventario(session.user.rol) && (
                <Link href="/panel/inventario" className="hover:text-clinica-azul">
                  Inventario
                </Link>
              )}
              {puedeVerFinanzas(session.user.rol) && (
                <Link href="/panel/caja" className="hover:text-clinica-azul">
                  Caja
                </Link>
              )}
              {esSuperAdmin(session.user.rol) && (
                <Link href="/panel/usuarios" className="hover:text-clinica-azul">
                  Usuarios
                </Link>
              )}
              {esSuperAdmin(session.user.rol) && (
                <Link href="/panel/catalogo" className="hover:text-clinica-azul">
                  Catálogo
                </Link>
              )}
              {esSuperAdmin(session.user.rol) && (
                <Link href="/panel/config-landing" className="hover:text-clinica-azul">
                  Editar web
                </Link>
              )}
            </nav>
          </div>
          <CerrarSesionBoton />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
