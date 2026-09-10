"use client";

import { useState, useTransition } from "react";
import { subirRadiografiaV2 } from "@/actions/odontogramaV2";

const TIPOS_RX = ["Panorámica", "Periapical", "Aleta", "Bitewing"];

const TODOS_LOS_DIENTES = [
  ...[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  ...[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
  ...[55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
  ...[85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
];

export default function SubirRadiografiaModal({
  pacienteId,
  onCerrar,
  onSubida,
}: {
  pacienteId: string;
  onCerrar: () => void;
  onSubida: () => void;
}) {
  const [tipo, setTipo] = useState(TIPOS_RX[0]);
  const [pieza, setPieza] = useState("");
  const [comentario, setComentario] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubir() {
    setError("");
    if (!archivo) {
      setError("Selecciona una imagen.");
      return;
    }
    const formData = new FormData();
    formData.set("tipo", tipo);
    formData.set("pieza", pieza);
    formData.set("comentario", comentario);
    formData.set("archivo", archivo);

    startTransition(async () => {
      const resultado = await subirRadiografiaV2(pacienteId, { ok: false }, formData);
      if (resultado.ok) {
        onSubida();
        onCerrar();
      } else {
        setError(resultado.mensaje ?? "No se pudo subir la radiografía.");
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
          <h2 className="text-lg font-semibold text-clinica-azulOscuro">Subir radiografía</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            >
              {TIPOS_RX.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Pieza relacionada (opcional)</label>
            <select
              value={pieza}
              onChange={(e) => setPieza(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            >
              <option value="">Sin pieza específica</option>
              {TODOS_LOS_DIENTES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Comentario</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
            />
          </div>

          <button
            onClick={handleSubir}
            disabled={isPending}
            className="w-full h-12 bg-clinica-azul text-white rounded-lg font-medium text-[16px] hover:bg-clinica-azulOscuro transition disabled:opacity-60"
          >
            {isPending ? "Subiendo..." : "Subir radiografía"}
          </button>
        </div>
      </div>
    </div>
  );
}
