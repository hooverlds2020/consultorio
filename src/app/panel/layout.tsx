import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  puedeGestionarPacientes,
  puedeGestionarAgenda,
  esSuperAdmin,
  puedeGestionarOrdenesLab,
  puedeVerFinanzas,
  puedeVerInventario,
} from "@/lib/permisos";
import NavPanel, { type EnlaceNav } from "@/components/navegacion/NavPanel";

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

  const rol = session.user.rol;
  const enlaces: EnlaceNav[] = [{ href: "/panel", label: "Inicio" }];

  if (puedeGestionarPacientes(rol)) enlaces.push({ href: "/panel/pacientes", label: "Pacientes" });
  if (puedeGestionarAgenda(rol)) enlaces.push({ href: "/panel/agenda", label: "Agenda" });
  if (puedeGestionarOrdenesLab(rol)) enlaces.push({ href: "/panel/lab/ordenes", label: "Laboratorio" });
  if (puedeVerInventario(rol)) enlaces.push({ href: "/panel/inventario", label: "Inventario" });
  if (puedeVerFinanzas(rol)) enlaces.push({ href: "/panel/caja", label: "Caja" });
  if (esSuperAdmin(rol)) enlaces.push({ href: "/panel/usuarios", label: "Usuarios" });
  if (esSuperAdmin(rol)) enlaces.push({ href: "/panel/catalogo", label: "Catálogo" });
  if (esSuperAdmin(rol)) enlaces.push({ href: "/panel/config-landing", label: "Editar web" });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavPanel
        enlaces={enlaces}
        nombreUsuario={session.user.name}
        nombreRol={NOMBRES_ROL[rol]}
      />
      <main className="max-w-[1200px] mx-auto px-4 py-4 md:py-6 w-full">{children}</main>
    </div>
  );
}
