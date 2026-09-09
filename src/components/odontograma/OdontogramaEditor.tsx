"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  COLOR_ESTADO,
  NOMBRE_ESTADO,
  ORDEN_ESTADOS,
  siguienteEstado,
  numerosAdulto,
  numerosInfantil,
  tipoDiente,
  type DientesJson,
} from "@/lib/odontograma";
import { guardarOdontograma } from "@/actions/odontograma";
import { calcularDiff, type CambioDiente } from "./historialUtils";
import ToothSVG from "./ToothSVG";
import DetalleDienteModal from "./DetalleDienteModal";
import type { VersionHistorial } from "./OdontogramaConHistorial";

type Props = {
  pacienteId: string;
  tipo: "ADULTO_32" | "INFANTIL_20";
  dientesIniciales: DientesJson;
  soloLectura?: boolean;
  /** Cuando se está viendo una versión pasada (modo solo lectura forzado). */
  versionEnVisualizacion?: { fecha: string; dientes: DientesJson } | null;
  onVolverAEditar?: () => void;
  /** Para el panel de detalle por diente: historial de versiones y radiografía más reciente. */
  versiones?: VersionHistorial[];
};

export default function OdontogramaEditor({
  pacienteId,
  tipo,
  dientesIniciales,
  soloLectura = false,
  versionEnVisualizacion = null,
  onVolverAEditar,
  versiones = [],
}: Props) {
  const [dientes, setDientes] = useState<DientesJson>(dientesIniciales);
  const [motivo, setMotivo] = useState("");
  const [isPending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");
  const [dienteEnDetalle, setDienteEnDetalle] = useState<number | null>(null);
  const [notasModificadas, setNotasModificadas] = useState(false);
  const [ultimoDiffGuardado, setUltimoDiffGuardado] = useState<CambioDiente[]>([]);
  const baselineRef = useRef<DientesJson>(dientesIniciales);
  const router = useRouter();

  const esInfantil = tipo === "INFANTIL_20";
  const { arribaeDerecha, arribaIzquierda, abajoIzquierda, abajoDerecha } =
    esInfantil ? numerosInfantil() : numerosAdulto();

  // Si estamos viendo una versión pasada, esos dientes mandan y todo es de solo lectura.
  const dientesMostrados = versionEnVisualizacion ? versionEnVisualizacion.dientes : dientes;
  const modoSoloLectura = soloLectura || !!versionEnVisualizacion;

  function handleClickDiente(numero: number) {
    if (modoSoloLectura) return;
    setGuardado(false);
    setDientes((prev) => {
      const actual = prev[String(numero)]?.estado ?? "SANO";
      return {
        ...prev,
        [String(numero)]: { estado: siguienteEstado(actual) },
      };
    });
  }

  function handleGuardar() {
    setError("");
    if (!motivo.trim()) {
      setError("Escribe el motivo o procedimiento antes de guardar.");
      return;
    }
    const diff = calcularDiff(baselineRef.current, dientes);
    if (diff.length === 0 && !notasModificadas) {
      setError("No hay cambios respecto a la última versión guardada.");
      return;
    }
    startTransition(async () => {
      const resultado = await guardarOdontograma(pacienteId, tipo, dientes, motivo, diff);
      if (resultado.ok) {
        setGuardado(true);
        setMotivo("");
        setNotasModificadas(false);
        setUltimoDiffGuardado(diff);
        baselineRef.current = dientes;
        router.refresh();
      } else {
        setError(resultado.mensaje ?? "Error al guardar.");
      }
    });
  }

  function handleGuardarNota(numero: number, nota: string) {
    if (modoSoloLectura) return;
    setGuardado(false);
    setNotasModificadas(true);
    setDientes((prev) => ({
      ...prev,
      [String(numero)]: { ...prev[String(numero)], estado: prev[String(numero)]?.estado ?? "SANO", notas: nota },
    }));
  }

  function renderArcada(numeros: number[], arcada: "superior" | "inferior") {
    return (
      <div className="w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        <div className="flex gap-4 min-w-max px-2 pb-2">
          {numeros.map((n) => (
            <div key={n} className="snap-start">
              <ToothSVG
                numero={n}
                estado={dientesMostrados[String(n)]?.estado ?? "SANO"}
                tipo={tipoDiente(n, esInfantil)}
                arcada={arcada}
                onClick={() => handleClickDiente(n)}
                onVerDetalle={() => setDienteEnDetalle(n)}
                soloLectura={modoSoloLectura}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {versionEnVisualizacion && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg p-3 mb-4 flex items-center justify-between gap-3">
          <span>
            Viendo versión del{" "}
            {new Date(versionEnVisualizacion.fecha).toLocaleString("es-MX")} (solo lectura)
          </span>
          {onVolverAEditar && (
            <button
              onClick={onVolverAEditar}
              className="whitespace-nowrap font-medium hover:underline"
            >
              Volver a la versión actual
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-2">Arcada superior — desliza →</p>
          {renderArcada(arribaeDerecha.concat(arribaIzquierda), "superior")}
        </div>
        <div>
          <p className="text-xs text-gray-400 mt-6 mb-2">Arcada inferior — desliza →</p>
          {renderArcada(abajoDerecha.concat(abajoIzquierda), "inferior")}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-600">
        {ORDEN_ESTADOS.map((estado) => (
          <div key={estado} className="flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-gray-400"
              style={{ backgroundColor: COLOR_ESTADO[estado] }}
            />
            {NOMBRE_ESTADO[estado]}
          </div>
        ))}
      </div>

      {!modoSoloLectura && (
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{error}</p>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Motivo / procedimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Corona en pieza 42"
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-clinica-azul"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGuardar}
              disabled={isPending}
              className="h-11 px-5 bg-clinica-azul text-white rounded-lg font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
            >
              {isPending ? "Guardando..." : "Guardar nueva versión"}
            </button>
            {guardado && (
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-sm">Guardado ✓</span>
                {ultimoDiffGuardado.length > 0 && (
                  <Link
                    href={`/panel/pacientes/${pacienteId}/cotizaciones?sugerido=${encodeURIComponent(
                      JSON.stringify(ultimoDiffGuardado)
                    )}`}
                    className="text-sm text-clinica-azul hover:underline"
                  >
                    Generar cotización con estos cambios →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {dienteEnDetalle !== null && (
        <DetalleDienteModal
          numero={dienteEnDetalle}
          estadoActual={dientesMostrados[String(dienteEnDetalle)]?.estado ?? "SANO"}
          notaActual={dientesMostrados[String(dienteEnDetalle)]?.notas ?? ""}
          versiones={versiones}
          soloLectura={modoSoloLectura}
          onCerrar={() => setDienteEnDetalle(null)}
          onGuardarNota={(nota) => handleGuardarNota(dienteEnDetalle, nota)}
        />
      )}
    </div>
  );
}
