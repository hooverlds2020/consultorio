"use client";

import { useState, useTransition } from "react";
import { crearHallazgoV2, buscarCie10V2 } from "@/actions/odontogramaV2";

type Estado = {
  key: string;
  label: string;
  descripcion: string | null;
  colorHex: string;
};

type Servicio = { id: string; nombre: string };
type Cie10 = { codigo: string; descripcion: string };

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

/**
 * Sugerencia de tratamiento según el código CIE-10 elegido (Paso D).
 * Solo sugiere — el dentista puede cambiarlo libremente en el select.
 */
function sugerirPalabraClaveTratamiento(codigo: string): string | null {
  if (codigo.startsWith("K02")) return "resina"; // también aplicaría Amalgama, se busca la primera coincidencia
  if (codigo === "K04.0" || codigo === "K04.1") return "endodoncia";
  if (codigo === "S02.5") return "corona";
  return null;
}

export default function ModalHallazgoV2({
  pacienteId,
  denticion,
  numeroDiente,
  caraInicial,
  estados,
  servicios,
  onCerrar,
  onGuardado,
}: {
  pacienteId: string;
  denticion: "permanente" | "temporal";
  numeroDiente: number;
  caraInicial: string;
  estados: Estado[];
  servicios: Servicio[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [estadoKey, setEstadoKey] = useState(estados[0]?.key ?? "");
  const [cara, setCara] = useState(caraInicial);

  const [busquedaCie10, setBusquedaCie10] = useState("");
  const [resultadosCie10, setResultadosCie10] = useState<Cie10[]>([]);
  const [cie10Elegido, setCie10Elegido] = useState<Cie10 | null>(null);
  const [cie10Libre, setCie10Libre] = useState(false);
  const [isPendingBusqueda, startTransitionBusqueda] = useTransition();

  const [tratamientoId, setTratamientoId] = useState("");
  const [tratamientoSugerido, setTratamientoSugerido] = useState(false);
  const [comentario, setComentario] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const estadoSeleccionado = estados.find((e) => e.key === estadoKey);

  function handleBuscarCie10(valor: string) {
    setBusquedaCie10(valor);
    setCie10Elegido(null);
    if (valor.trim().length < 2) {
      setResultadosCie10([]);
      return;
    }
    startTransitionBusqueda(async () => {
      const res = await buscarCie10V2(valor);
      setResultadosCie10(res);
    });
  }

  function handleElegirCie10(item: Cie10) {
    setCie10Elegido(item);
    setResultadosCie10([]);
    setBusquedaCie10("");

    // Paso D: sugerir tratamiento automáticamente, sin forzarlo.
    const palabraClave = sugerirPalabraClaveTratamiento(item.codigo);
    if (palabraClave && !tratamientoId) {
      const match = servicios.find((s) => s.nombre.toLowerCase().includes(palabraClave));
      if (match) {
        setTratamientoId(match.id);
        setTratamientoSugerido(true);
      }
    }
  }

  function handleAceptar() {
    setError("");
    if (!estadoKey) {
      setError("Selecciona un estado.");
      return;
    }
    const tratamientoNombre = servicios.find((s) => s.id === tratamientoId)?.nombre ?? "";

    startTransition(async () => {
      const resultado = await crearHallazgoV2(pacienteId, {
        denticion,
        dienteFdi: numeroDiente,
        cara,
        estadoKey,
        cie10Codigo: cie10Elegido?.codigo ?? "",
        cie10Desc: cie10Elegido?.descripcion ?? (cie10Libre ? busquedaCie10 : ""),
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

          <div className="relative">
            <label className="block text-sm text-gray-700 mb-1">Diagnóstico (CIE-10)</label>

            {cie10Elegido ? (
              <div className="flex items-center justify-between border border-gray-300 rounded-lg h-11 px-3">
                <span className="text-sm truncate">
                  {cie10Elegido.codigo} - {cie10Elegido.descripcion}
                </span>
                <button
                  type="button"
                  onClick={() => setCie10Elegido(null)}
                  className="text-xs text-red-500 shrink-0 ml-2"
                >
                  Cambiar
                </button>
              </div>
            ) : cie10Libre ? (
              <div className="flex items-center justify-between border border-gray-300 rounded-lg h-11 px-3">
                <input
                  type="text"
                  value={busquedaCie10}
                  onChange={(e) => setBusquedaCie10(e.target.value)}
                  placeholder="Escribe el diagnóstico..."
                  className="flex-1 text-[16px] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCie10Libre(false);
                    setBusquedaCie10("");
                  }}
                  className="text-xs text-gray-400 shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={busquedaCie10}
                    onChange={(e) => handleBuscarCie10(e.target.value)}
                    placeholder="Escribe o busca diagnóstico..."
                    className="flex-1 h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
                  />
                  <div className="w-11 h-11 shrink-0 border border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                    🔍
                  </div>
                </div>
                {resultadosCie10.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-md w-full mt-1 max-h-48 overflow-y-auto">
                    {resultadosCie10.map((item) => (
                      <li key={item.codigo}>
                        <button
                          type="button"
                          onClick={() => handleElegirCie10(item)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-clinica-azulClaro"
                        >
                          <span className="font-medium">{item.codigo}</span> — {item.descripcion}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {busquedaCie10.trim().length >= 2 &&
                  !isPendingBusqueda &&
                  resultadosCie10.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setCie10Libre(true)}
                      className="text-xs text-clinica-azul mt-1 hover:underline"
                    >
                      No lo encuentro — usar "{busquedaCie10}" como texto libre
                    </button>
                  )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Plan de tratamiento
              {tratamientoSugerido && (
                <span className="text-clinica-azul font-normal"> (sugerido por el diagnóstico)</span>
              )}
            </label>
            <select
              value={tratamientoId}
              onChange={(e) => {
                setTratamientoId(e.target.value);
                setTratamientoSugerido(false);
              }}
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
