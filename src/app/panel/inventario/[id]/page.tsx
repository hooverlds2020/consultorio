import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeVerInventario } from "@/lib/permisos";
import { obtenerInsumoConMovimientos } from "@/actions/inventario";

export default async function DetalleInsumoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeVerInventario(session.user.rol)) {
    redirect("/panel");
  }

  const insumo = await obtenerInsumoConMovimientos(params.id);
  if (!insumo) {
    notFound();
  }

  // Suma de control: entradas menos salidas debería coincidir con el
  // stock actual. Si no coincide, algo se editó fuera de flujo normal.
  const totalEntradas = insumo.movimientos
    .filter((m) => m.tipo === "ENTRADA")
    .reduce((suma, m) => suma + Number(m.cantidad), 0);
  const totalSalidas = insumo.movimientos
    .filter((m) => m.tipo === "SALIDA")
    .reduce((suma, m) => suma + Number(m.cantidad), 0);
  const stockCalculado = totalEntradas - totalSalidas;
  const stockCuadra = Math.abs(stockCalculado - Number(insumo.stockActual)) < 0.01;

  return (
    <div>
      <Link href="/panel/inventario" className="text-sm text-clinica-azul hover:underline">
        ← Inventario
      </Link>

      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mt-1 mb-1">
        {insumo.nombre}
      </h1>
      <p className="text-gray-500 mb-6">
        Stock actual: {Number(insumo.stockActual).toLocaleString("es-MX")} {insumo.unidadMedida} ·
        Mínimo: {Number(insumo.stockMinimo).toLocaleString("es-MX")} {insumo.unidadMedida}
      </p>

      <div
        className={`text-sm rounded-md p-3 mb-6 border ${
          stockCuadra
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}
      >
        {stockCuadra ? (
          <>✓ El stock cuadra: entradas ({totalEntradas}) − salidas ({totalSalidas}) = stock actual.</>
        ) : (
          <>
            ⚠️ El stock NO cuadra. Entradas ({totalEntradas}) − salidas ({totalSalidas}) ={" "}
            {stockCalculado}, pero el stock actual registrado es {Number(insumo.stockActual)}.
            Esto puede pasar si el insumo se creó con un stock inicial distinto de cero.
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Registrado por</th>
            </tr>
          </thead>
          <tbody>
            {insumo.movimientos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Sin movimientos todavía.
                </td>
              </tr>
            )}
            {insumo.movimientos.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-3 text-gray-600">
                  {new Date(m.fecha).toLocaleString("es-MX", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      m.tipo === "ENTRADA"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {m.tipo === "ENTRADA" ? "Entrada" : "Salida"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-800 font-medium">
                  {m.tipo === "SALIDA" ? "−" : "+"}
                  {Number(m.cantidad).toLocaleString("es-MX")} {insumo.unidadMedida}
                </td>
                <td className="px-4 py-3 text-gray-500">{m.motivo ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{m.registradoPor.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
