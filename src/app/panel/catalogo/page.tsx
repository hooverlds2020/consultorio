import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import ServicioForm from "@/components/catalogo/ServicioForm";

export default async function CatalogoPage() {
  const session = await getServerSession(authOptions);

  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const servicios = await prisma.servicioCatalogo.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">
        Catálogo de servicios
      </h1>

      <div className="mb-6">
        <ServicioForm />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Servicio</th>
              <th className="px-4 py-3">Precio</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-gray-400">
                  Sin servicios en el catálogo todavía.
                </td>
              </tr>
            )}
            {servicios.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3 text-gray-800">{s.nombre}</td>
                <td className="px-4 py-3 text-gray-600">
                  ${Number(s.precioBase).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
