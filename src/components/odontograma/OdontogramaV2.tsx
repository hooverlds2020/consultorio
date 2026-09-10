"use client";

import { useState, useTransition, useMemo } from "react";
import { Trash2, Camera } from "lucide-react";
import DienteV2, { type Cara } from "./DienteV2";
import ModalHallazgoV2 from "./ModalHallazgoV2";
import SubirRadiografiaModal from "./SubirRadiografiaModal";
import GaleriaRadiografiasV2 from "./GaleriaRadiografiasV2";
import {
  listarHallazgosPacienteV2,
  eliminarHallazgoV2,
  listarRadiografiasV2,
} from "@/actions/odontogramaV2";

// Permanente (32)
const Q1_SUP_DER = [18, 17, 16, 15, 14, 13, 12, 11];
const Q2_SUP_IZQ = [21, 22, 23, 24, 25, 26, 27, 28];
const Q4_INF_DER = [48, 47, 46, 45, 44, 43, 42, 41];
const Q3_INF_IZQ = [31, 32, 33, 34, 35, 36, 37, 38];

// Temporal (20)
const Q5_SUP_DER = [55, 54, 53, 52, 51];
const Q6_SUP_IZQ = [61, 62, 63, 64, 65];
const Q8_INF_DER = [85, 84, 83, 82, 81];
const Q7_INF_IZQ = [71, 72, 73, 74, 75];

const CARAS_REALES: Cara[] = ["Oclusal", "Mesial", "Distal", "Vestibular", "Lingual"];

type Denticion = "permanente" | "temporal";
type Vista = Denticion | "mixta";

type Estado = { key: string; label: string; descripcion: string | null; colorHex: string };
type Servicio = { id: string; nombre: string };
type Hallazgo = {
  id: string;
  fecha: Date | string;
  denticion: string;
  dienteFdi: number;
  cara: string;
  estadoKey: string;
  estadoLabel: string;
  colorHex: string;
  cie10Codigo: string | null;
  tratamientoNombre: string | null;
  comentario: string | null;
};

function calcularPintura(hallazgos: Hallazgo[], dientes: number[]) {
  const mapa = new Map<number, { colores: Partial<Record<Cara, string>>; ausencia: boolean }>();

  for (const diente of dientes) {
    const hallazgosDiente = hallazgos
      .filter((h) => h.dienteFdi === diente)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const colores: Partial<Record<Cara, string>> = {};
    let ausencia = false;

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
}

type Radiografia = {
  id: string;
  tipo: string;
  pieza: number | null;
  url: string;
  comentario: string | null;
  fecha: Date | string;
};

export default function OdontogramaV2({
  pacienteId,
  hallazgosIniciales,
  estados,
  servicios,
  vistaInicial,
  radiografiasIniciales,
}: {
  pacienteId: string;
  hallazgosIniciales: Hallazgo[];
  estados: Estado[];
  servicios: Servicio[];
  /** Calculada por edad en el servidor; el toggle manual siempre puede cambiarla. */
  vistaInicial: Vista;
  radiografiasIniciales: Radiografia[];
}) {
  const [vista, setVista] = useState<Vista>(vistaInicial);
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>(hallazgosIniciales);
  const [radiografias, setRadiografias] = useState<Radiografia[]>(radiografiasIniciales);
  const [mostrarSubirRx, setMostrarSubirRx] = useState(false);
  const [modalAbierto, setModalAbierto] = useState<{
    diente: number;
    cara: Cara;
    denticion: Denticion;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const piezasConRx = useMemo(
    () => new Set(radiografias.filter((r) => r.pieza !== null).map((r) => r.pieza)),
    [radiografias]
  );

  function refrescarRadiografias() {
    startTransition(async () => {
      const nuevas = await listarRadiografiasV2(pacienteId);
      setRadiografias(nuevas as unknown as Radiografia[]);
    });
  }

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

  const pinturaPermanente = useMemo(
    () => calcularPintura(hallazgos, [...Q1_SUP_DER, ...Q2_SUP_IZQ, ...Q4_INF_DER, ...Q3_INF_IZQ]),
    [hallazgos]
  );
  const pinturaTemporal = useMemo(
    () => calcularPintura(hallazgos, [...Q5_SUP_DER, ...Q6_SUP_IZQ, ...Q8_INF_DER, ...Q7_INF_IZQ]),
    [hallazgos]
  );

  function renderFila(
    numeros: number[],
    pintura: Map<number, { colores: Partial<Record<Cara, string>>; ausencia: boolean }>,
    denticion: Denticion
  ) {
    return (
      <div className="flex justify-center gap-2 px-2 pb-4">
        {numeros.map((n) => {
          const p = pintura.get(n) ?? { colores: {}, ausencia: false };
          return (
            <DienteV2
              key={n}
              numero={n}
              coloresPorCara={p.colores}
              esAusencia={p.ausencia}
              tieneRx={piezasConRx.has(n)}
              onClickCara={(numero, cara) => setModalAbierto({ diente: numero, cara, denticion })}
            />
          );
        })}
      </div>
    );
  }

  function renderGrid(
    titulo: string,
    q1: number[],
    q2: number[],
    q3: number[],
    q4: number[],
    pintura: Map<number, { colores: Partial<Record<Cara, string>>; ausencia: boolean }>,
    denticion: Denticion,
    nombresCuadrante: [string, string, string, string]
  ) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-clinica-azulOscuro">{titulo}</h2>
        <p className="text-sm text-gray-500 mb-3">Click en las caras de cada diente para registrar hallazgos</p>
        <div className={`border rounded-lg overflow-x-auto ${isPending ? "opacity-60" : ""}`}>
          <div className="flex">
            <div className="flex-1 border-r">
              <p className="text-center text-xs text-clinica-azul font-medium py-2">{nombresCuadrante[0]}</p>
              {renderFila(q1, pintura, denticion)}
            </div>
            <div className="flex-1">
              <p className="text-center text-xs text-clinica-azul font-medium py-2">{nombresCuadrante[1]}</p>
              {renderFila(q2, pintura, denticion)}
            </div>
          </div>
          <div className="flex border-t">
            <div className="flex-1 border-r">
              <p className="text-center text-xs text-clinica-azul font-medium py-2">{nombresCuadrante[2]}</p>
              {renderFila(q4, pintura, denticion)}
            </div>
            <div className="flex-1">
              <p className="text-center text-xs text-clinica-azul font-medium py-2">{nombresCuadrante[3]}</p>
              {renderFila(q3, pintura, denticion)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex w-full max-w-sm bg-gray-100 rounded-xl p-1">
          {(["permanente", "temporal", "mixta"] as Vista[]).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`flex-1 h-9 rounded-lg text-sm font-medium capitalize transition ${
                vista === v ? "bg-clinica-azul text-white" : "text-gray-600"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMostrarSubirRx(true)}
          className="h-10 px-4 border border-clinica-azul text-clinica-azul rounded-lg text-sm font-medium hover:bg-clinica-azulClaro transition flex items-center gap-1.5"
        >
          <Camera size={16} />
          Subir Radiografía
        </button>
      </div>

      {(vista === "permanente" || vista === "mixta") &&
        renderGrid(
          "Odontograma - Dentición Permanente",
          Q1_SUP_DER,
          Q2_SUP_IZQ,
          Q3_INF_IZQ,
          Q4_INF_DER,
          pinturaPermanente,
          "permanente",
          [
            "Cuadrante 1: Superior Derecho",
            "Cuadrante 2: Superior Izquierdo",
            "Cuadrante 4: Inferior Derecho",
            "Cuadrante 3: Inferior Izquierdo",
          ]
        )}

      {(vista === "temporal" || vista === "mixta") &&
        renderGrid(
          "Odontograma - Dentición Temporal",
          Q5_SUP_DER,
          Q6_SUP_IZQ,
          Q7_INF_IZQ,
          Q8_INF_DER,
          pinturaTemporal,
          "temporal",
          [
            "Cuadrante 5: Superior Derecho",
            "Cuadrante 6: Superior Izquierdo",
            "Cuadrante 8: Inferior Derecho",
            "Cuadrante 7: Inferior Izquierdo",
          ]
        )}

      <div className="mb-6">
        <h2 className="font-medium text-clinica-azulOscuro mb-3">Radiografías</h2>
        <GaleriaRadiografiasV2 radiografias={radiografias} />
      </div>

      {/* Resumen de Hallazgos — el historial legal completo, sin importar la vista activa */}
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
          denticion={modalAbierto.denticion}
          numeroDiente={modalAbierto.diente}
          caraInicial={modalAbierto.cara}
          estados={estados}
          servicios={servicios}
          onCerrar={() => setModalAbierto(null)}
          onGuardado={refrescar}
        />
      )}
      {mostrarSubirRx && (
        <SubirRadiografiaModal
          pacienteId={pacienteId}
          onCerrar={() => setMostrarSubirRx(false)}
          onSubida={refrescarRadiografias}
        />
      )}
    </div>
  );
}
