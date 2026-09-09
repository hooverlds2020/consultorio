import Link from "next/link";
import { AlertTriangle, PackageCheck } from "lucide-react";

type Insumo = { id: string; nombre: string; stockActual: string | number; stockMinimo: string | number; unidadMedida: string };

export default function AlertasStock({ insumos }: { insumos: Insumo[] }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <AlertTriangle size={16} className="text-red-500" />
          Alertas de inventario
        </h3>
        {insumos.length > 0 && (
          <Link href="/panel/inventario" className="text-xs text-clinica-azul hover:underline">
            Ver todo →
          </Link>
        )}
      </div>

      {insumos.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
          <PackageCheck size={16} />
          Todo el inventario en niveles normales
        </div>
      ) : (
        <ul className="space-y-2">
          {insumos.slice(0, 5).map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between text-sm bg-red-50 rounded-lg px-3 py-2"
            >
              <span className="text-red-700 font-medium truncate">{i.nombre}</span>
              <span className="text-red-500 text-xs whitespace-nowrap ml-2">
                {Number(i.stockActual)} {i.unidadMedida}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
