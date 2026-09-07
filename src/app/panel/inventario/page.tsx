import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { puedeVerInventario, esSuperAdmin } from "@/lib/permisos";
import { listarInsumos } from "@/actions/inventario";
import InsumoForm from "@/components/inventario/InsumoForm";
import FilaInsumo from "@/components/inventario/FilaInsumo";

export default async function InventarioPage() {
  const session = await getServerSession(authOptions);

  if (!session || !puedeVerInventario(session.user.rol)) {
    redirect("/panel");
  }

  const insumos = await listarInsumos();
  const conStockBajo = insumos.filter((i) => Number(i.stockActual) <= Number(i.stockMinimo));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-2">Inventario</h1>

      {conStockBajo.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-6">
          ⚠️ {conStockBajo.length} insumo(s) con stock bajo: {conStockBajo.map((i) => i.nombre).join(", ")}
        </div>
      )}

      {esSuperAdmin(session.user.rol) && (
        <div className="mb-6">
          <InsumoForm />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Insumo</th>
              <th className="px-4 py-3">Stock actual</th>
              <th className="px-4 py-3">Mínimo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {insumos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Sin insumos registrados todavía.
                </td>
              </tr>
            )}
            {insumos.map((insumo) => (
              <FilaInsumo key={insumo.id} insumo={insumo as any} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
