"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { obtenerReporteCaja } from "@/actions/pagos";
import { METODO_PAGO_LABEL } from "@/lib/validaciones/pago.schema";
import { hoyEnZonaClinica, sumarDiasEnZonaClinica } from "@/lib/fecha";

type Reporte = Awaited<ReturnType<typeof obtenerReporteCaja>>;

function hoyISO(): string {
  return hoyEnZonaClinica();
}

function haceNDias(n: number): string {
  return sumarDiasEnZonaClinica(hoyEnZonaClinica(), -n);
}

function formatoDinero(n: number): string {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

export default function ReporteCaja({ reporteInicial }: { reporteInicial: Reporte }) {
  const [desde, setDesde] = useState(hoyISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [reporte, setReporte] = useState(reporteInicial);
  const [isPending, startTransition] = useTransition();

  function cargar(nuevoDesde: string, nuevoHasta: string) {
    setDesde(nuevoDesde);
    setHasta(nuevoHasta);
    startTransition(async () => {
      const resultado = await obtenerReporteCaja(nuevoDesde, nuevoHasta);
      setReporte(resultado);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => cargar(hoyISO(), hoyISO())}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
        >
          Hoy
        </button>
        <button
          onClick={() => cargar(haceNDias(7), hoyISO())}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
        >
          Últimos 7 días
        </button>
        <button
          onClick={() => cargar(haceNDias(30), hoyISO())}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
        >
          Últimos 30 días
        </button>
        <input
          type="date"
          value={desde}
          onChange={(e) => cargar(e.target.value, hasta)}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
        />
        <span className="text-sm text-gray-500">a</span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => cargar(desde, e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>

      <div className={isPending ? "opacity-50" : ""}>
        {reporte.cantidadPagos === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center mb-6">
            <p className="text-gray-500 font-medium mb-1">Aún no hay pagos en este periodo</p>
            <p className="text-sm text-gray-400 mb-4">
              Registra el primero desde una cita en la Agenda con el botón "Cobrar".
            </p>
            <Link
              href="/panel/agenda"
              className="inline-block h-11 px-5 leading-[44px] bg-clinica-azul text-white rounded-lg font-medium hover:bg-clinica-azulOscuro transition"
            >
              Ir a la Agenda
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Ingresos</p>
                <p className="text-2xl font-bold text-green-600">{formatoDinero(reporte.totalIngresos)}</p>
              </div>
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Egresos</p>
                <p className="text-2xl font-bold text-red-500">{formatoDinero(reporte.totalEgresos)}</p>
              </div>
              <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm p-5">
                <p className="text-sm text-green-700 mb-1">Utilidad neta</p>
                <p className="text-2xl font-bold text-green-700">{formatoDinero(reporte.utilidadNeta)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h3 className="font-medium text-gray-700 mb-3">Por método de pago (ingresos)</h3>
                <div className="space-y-2">
                  {Object.entries(reporte.porMetodo).map(([metodo, total]) => (
                    <div key={metodo} className="flex justify-between text-sm">
                      <span className="text-gray-600">{METODO_PAGO_LABEL[metodo]}</span>
                      <span className="font-medium text-gray-800">{formatoDinero(total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-5">
                <h3 className="font-medium text-gray-700 mb-3">Por atendido por</h3>
                <div className="space-y-2">
                  {reporte.porAtendidoPor.length === 0 && (
                    <p className="text-sm text-gray-400">Sin datos.</p>
                  )}
                  {reporte.porAtendidoPor.map((item) => (
                    <div key={item.nombre} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.nombre}</span>
                      <span className="font-medium text-gray-800">{formatoDinero(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <h3 className="font-medium text-gray-700 p-4 pb-0">Movimientos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm mt-3">
                  <thead className="bg-gray-50 text-gray-500 text-left">
                    <tr>
                      <th className="px-4 py-2">Fecha</th>
                      <th className="px-4 py-2">Paciente</th>
                      <th className="px-4 py-2">Concepto</th>
                      <th className="px-4 py-2">Método</th>
                      <th className="px-4 py-2 text-right">Ingreso</th>
                      <th className="px-4 py-2 text-right">Egreso</th>
                      <th className="px-4 py-2">Registró</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.movimientos.map((m) => (
                      <tr key={m.id} className="border-t">
                        <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                          {new Date(m.fecha).toLocaleDateString("es-MX")}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{m.pacienteNombre}</td>
                        <td className="px-4 py-2 text-gray-500">{m.concepto}</td>
                        <td className="px-4 py-2 text-gray-500">{METODO_PAGO_LABEL[m.metodo]}</td>
                        <td className="px-4 py-2 text-right text-green-600 font-medium">
                          {m.tipo === "INGRESO" ? formatoDinero(m.monto) : ""}
                        </td>
                        <td className="px-4 py-2 text-right text-red-500 font-medium">
                          {m.tipo === "EGRESO" ? formatoDinero(m.monto) : ""}
                        </td>
                        <td className="px-4 py-2 text-gray-500">{m.registradoPorNombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
