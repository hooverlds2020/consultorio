"use client";

import { useState, useTransition } from "react";
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-sm text-gray-500 mb-1">Total del periodo</p>
          <p className="text-3xl font-bold text-clinica-azulOscuro">
            ${reporte.totalGeneral.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">{reporte.cantidadPagos} pagos registrados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="font-medium text-gray-700 mb-3">Por método de pago</h3>
            <div className="space-y-2">
              {Object.entries(reporte.porMetodo).map(([metodo, total]) => (
                <div key={metodo} className="flex justify-between text-sm">
                  <span className="text-gray-600">{METODO_PAGO_LABEL[metodo]}</span>
                  <span className="font-medium text-gray-800">
                    ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
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
                  <span className="font-medium text-gray-800">
                    ${item.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
