"use client";

import { useState, useTransition, useMemo } from "react";
import { Trash2 } from "lucide-react";
import DienteV2, { type Cara } from "./DienteV2";
import ModalHallazgoV2 from "./ModalHallazgoV2";
import { listarHallazgosPacienteV2, eliminarHallazgoV2 } from "@/actions/odontogramaV2";

const Q1_SUP_DER = [18, 17, 16, 15, 14, 13, 12, 11];
const Q2_SUP_IZQ = [21, 22, 23, 24, 25, 26, 27, 28];
const Q4_INF_DER = [48, 47, 46, 45, 44, 43, 42, 41];
const Q3_INF_IZQ = [31, 32, 33, 34, 35, 36, 37, 38];

const CARAS_REALES: Cara[] = ["Oclusal", "Mesial", "Distal", "Vestibular", "Lingual"];

type Estado = { key: string; label: string; descripcion: string | null; colorHex: string };
type Servicio = { id: string; nombre: string };
type Hallazgo = {
  id: string;
  fecha: Date | string;
  dienteFdi: number;
  cara: string;
  estadoKey: string;
  estadoLabel: string;
  colorHex: string;
  cie10Codigo: string | null;
  tratamientoNombre: string | null;
  comentario: string | null;
};

export default function OdontogramaV2({
  pacienteId,
  hallazgosIniciales,
  estados,
  servicios,
}: {
  pacienteId: string;
  hallazgosIniciales: Hallazgo[];
  estados: Estado[];
  servicios: Servicio[];
}) {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>(hallazgosIniciales);
  const [modalAbierto, setModalAbierto] = useState<{ diente: number; cara: Cara } | null>(null);
  const [isPending, startTransition] = useTransition();

  function refrescar() {
    startTransition(async () => {
      const nuevos = await listarHallazgosPacienteV2(pacienteId);
      setHallazgos(nuevos as unknown as Hallazgo[]);
    });
  }

  function handleEliminar(id: string) {
    startTransition(async () => {
      await eliminarHallazgoV2(id, pacienteId);
      refrescar();
    });
  }

  // Por cada diente, calcula cómo pintarlo a partir del hallazgo más
  // reciente que aplique a cada cara (o a "Todas" el diente completo).
  const pinturaPorDiente = useMemo(() => {
    const mapa = new Map<number, { colores: Partial<Record<Cara, string>>; ausencia: boolean }>();

    for (const diente of [...Q1_SUP_DER, ...Q2_SUP_IZQ, ...Q4_INF_DER, ...Q3_INF_IZQ]) {
      const hallazgosDiente = hallazgos
        .filter((h) => h.dienteFdi === diente)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      const colores: Partial<Record<Cara, string>> = {};
      let ausencia = false;

      // El más reciente "Todas" pinta todo el diente (a menos que haya
      // hallazgos por cara específica más recientes que esa fecha).
      const masRecienteTodas = hallazgosDiente.find((h) => h.cara === "Todas");
      if (masRecienteTodas) {
        for (const c of CARAS_REALES) colores[c] = masRecienteTodas.colorHex;
        ausencia = masRecienteTodas.estadoKey === "ausencia";
      }

      for (const c of CARAS_REALES) {
        const especifico = hallazgosDiente.find((h) => h.cara === c);
        if (
          especifico &&
          (!masRecienteTodas || new Date(especifico.fecha) > new Date(masRecienteTodas.fecha))
        ) {
          colores[c] = especifico.colorHex;
        }
      }

      mapa.set(diente, { colores, ausencia });
    }

    return mapa;
  }, [hallazgos]);

  function renderFila(numeros: number[]) {
    return (
      <div className="flex justify-center gap-2 px-2 pb-4">
        {numeros.map((n) => {
          const pintura = pinturaPorDiente.get(n) ?? { colores: {}, ausencia: false };
          return (
            <DienteV2
              key={n}
              numero={n}
              coloresPorCara={pintura.colores}
              esAusencia={pintura.ausencia}
              onClickCara={(numero, cara) => setModalAbierto({ diente: numero, cara })}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-clinica-azulOscuro">
        Odontograma - Dentición Permanente
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Click en las caras de cada diente para registrar hallazgos
      </p>

      <div className={`border rounded-lg overflow-x-auto ${isPending ? "opacity-60" : ""}`}>
        <div className="flex">
          <div className="flex-1 border-r">
            <p className="text-center text-xs text-clinica-azul font-medium py-2">
              Cuadrante 1: Superior Derecho
            </p>
            {renderFila(Q1_SUP_DER)}
          </div>
          <div className="flex-1">
            <p className="text-center text-xs text-clinica-azul font-medium py-2">
              Cuadrante 2: Superior Izquierdo
            </p>
            {renderFila(Q2_SUP_IZQ)}
          </div>
        </div>
        <div className="flex border-t">
          <div className="flex-1 border-r">
            <p className="text-center text-xs text-clinica-azul font-medium py-2">
              Cuadrante 4: Inferior Derecho
            </p>
            {renderFila(Q4_INF_DER)}
          </div>
          <div className="flex-1">
            <p className="text-center text-xs text-clinica-azul font-medium py-2">
              Cuadrante 3: Inferior Izquierdo
            </p>
            {renderFila(Q3_INF_IZQ)}
          </div>
        </div>
      </div>

      {/* Resumen de Hallazgos — el historial legal, ordenado del más reciente al más viejo */}
      <div className="mt-6">
        <h2 className="font-medium text-clinica-azulOscuro mb-3">Resumen de Hallazgos</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Pieza</th>
                <th className="px-4 py-2">Cara</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Diagnóstico y Plan de tratamiento</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {hallazgos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    Sin hallazgos registrados todavía.
                  </td>
                </tr>
              )}
              {hallazgos.map((h) => {
                const diagnosticoPlan =
                  [h.cie10Codigo, h.tratamientoNombre].filter(Boolean).join(" — ") || "-";
                return (
                  <tr key={h.id} className="border-t">
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                      {new Date(h.fecha).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{h.dienteFdi}</td>
                    <td className="px-4 py-2 text-gray-600">{h.cara}</td>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: h.colorHex }}
                        />
                        {h.estadoLabel}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{diagnosticoPlan}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleEliminar(h.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label="Eliminar hallazgo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <ModalHallazgoV2
          pacienteId={pacienteId}
          numeroDiente={modalAbierto.diente}
          caraInicial={modalAbierto.cara}
          estados={estados}
          servicios={servicios}
          onCerrar={() => setModalAbierto(null)}
          onGuardado={refrescar}
        />
      )}
    </div>
  );
}
