"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { eliminarRadiografiaV2 } from "@/actions/odontogramaV2";

type Radiografia = {
  id: string;
  tipo: string;
  pieza: number | null;
  url: string;
  comentario: string | null;
  fecha: Date | string;
};

export default function GaleriaRadiografiasV2({
  radiografias,
  pacienteId,
  onEliminada,
}: {
  radiografias: Radiografia[];
  pacienteId: string;
  onEliminada: () => void;
}) {
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEliminar(id: string) {
    startTransition(async () => {
      await eliminarRadiografiaV2(id, pacienteId);
      setConfirmandoId(null);
      onEliminada();
    });
  }

  if (radiografias.length === 0) {
    return <p className="text-sm text-gray-400">Sin radiografías todavía.</p>;
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {radiografias.map((rx) => (
          <div key={rx.id} className="shrink-0 w-28 relative group">
            <button onClick={() => setZoomUrl(rx.url)} className="block w-full text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rx.url}
                alt={rx.tipo}
                className="w-28 h-28 object-cover rounded-lg border hover:opacity-80 transition"
              />
              <p className="text-[11px] text-gray-600 mt-1 truncate">
                {rx.tipo}
                {rx.pieza ? ` · ${rx.pieza}` : ""}
              </p>
              <p className="text-[10px] text-gray-400">
                {new Date(rx.fecha).toLocaleDateString("es-MX")}
              </p>
            </button>

            {confirmandoId === rx.id ? (
              <div className="absolute inset-0 bg-white/95 rounded-lg flex flex-col items-center justify-center gap-1 p-1">
                <p className="text-[10px] text-gray-600 text-center">¿Eliminar?</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEliminar(rx.id)}
                    disabled={isPending}
                    className="text-[10px] px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setConfirmandoId(null)}
                    className="text-[10px] px-2 py-1 border rounded"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmandoId(rx.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow text-gray-500 hover:text-red-500 transition"
                aria-label="Eliminar radiografía"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {zoomUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoomUrl} alt="Radiografía" className="max-w-full max-h-full rounded-lg" />
          <button
            onClick={() => setZoomUrl(null)}
            className="absolute top-4 right-4 text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
