import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import FilaUsuario from "@/components/usuarios/FilaUsuario";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);

  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-clinica-azulOscuro">Usuarios</h1>
        <Link
          href="/panel/usuarios/nuevo"
          className="bg-clinica-azul text-white px-4 py-2 rounded-md hover:bg-clinica-azulOscuro transition"
        >
          + Nuevo usuario
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <FilaUsuario key={u.id} usuario={u} esUsuarioActual={u.id === session.user.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
