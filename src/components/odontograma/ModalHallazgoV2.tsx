"use client";

import { useState, useTransition } from "react";
import { crearHallazgoV2 } from "@/actions/odontogramaV2";

type Estado = {
  key: string;
  label: string;
  descripcion: string | null;
  colorHex: string;
};

type Servicio = { id: string; nombre: string };

const OPCIONES_CARA = [
  "Todas",
  "Mesial",
  "Distal",
  "Oclusal",
  "Lingual",
  "Vestibular",
  "Palatino",
  "Incisal",
];

export default function ModalHallazgoV2({
  pacienteId,
  numeroDiente,
  caraInicial,
  estados,
  servicios,
  onCerrar,
  onGuardado,
}: {
  pacienteId: string;
  numeroDiente: number;
  caraInicial: string;
  estados: Estado[];
  servicios: Servicio[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [estadoKey, setEstadoKey] = useState(estados[0]?.key ?? "");
  const [cara, setCara] = useState(caraInicial);
  const [cie10, setCie10] = useState("");
  const [tratamientoId, setTratamientoId] = useState("");
  const [comentario, setComentario] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const estadoSeleccionado = estados.find((e) => e.key === estadoKey);

  function handleAceptar() {
    setError("");
    if (!estadoKey) {
      setError("Selecciona un estado.");
      return;
    }
    const tratamientoNombre = servicios.find((s) => s.id === tratamientoId)?.nombre ?? "";

    startTransition(async () => {
      const resultado = await crearHallazgoV2(pacienteId, {
        dienteFdi: numeroDiente,
        cara,
        estadoKey,
        cie10,
        tratamientoId,
        tratamientoNombre,
        comentario,
      });
      if (resultado.ok) {
        onGuardado();
        onCerrar();
      } else {
        setError(resultado.mensaje ?? "No se pudo guardar el hallazgo.");
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={onCerrar}>
      <div
        className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-clinica-azulOscuro">Diente {numeroDiente}</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Estado / color</label>
            <select
              value={estadoKey}
              onChange={(e) => setEstadoKey(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            >
              {estados.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.label}
                  {e.descripcion ? ` — ${e.descripcion}` : ""}
                </option>
              ))}
            </select>
            {estadoSeleccionado && (
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                  style={{ backgroundColor: estadoSeleccionado.colorHex }}
                />
                <span className="text-xs text-gray-500">{estadoSeleccionado.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Cara</label>
            <select
              value={cara}
              onChange={(e) => setCara(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            >
              {OPCIONES_CARA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Diagnóstico (CIE-10)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cie10}
                onChange={(e) => setCie10(e.target.value)}
                placeholder="Ej: K02.1 Caries de la dentina"
                className="flex-1 h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
              />
              <div className="w-11 h-11 shrink-0 border border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                🔍
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Texto libre por ahora — el buscador de códigos CIE-10 llega en un paso posterior.
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Plan de tratamiento</label>
            <select
              value={tratamientoId}
              onChange={(e) => setTratamientoId(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            >
              <option value="">Sin especificar</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Comentario</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Notas adicionales..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCerrar}
              className="flex-1 h-11 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleAceptar}
              disabled={isPending}
              className="flex-1 h-11 bg-clinica-azul text-white rounded-lg font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
            >
              {isPending ? "Guardando..." : "Aceptar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
