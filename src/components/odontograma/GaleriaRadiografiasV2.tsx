"use client";

import { useState } from "react";

type Radiografia = {
  id: string;
  tipo: string;
  pieza: number | null;
  url: string;
  comentario: string | null;
  fecha: Date | string;
};

export default function GaleriaRadiografiasV2({ radiografias }: { radiografias: Radiografia[] }) {
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  if (radiografias.length === 0) {
    return <p className="text-sm text-gray-400">Sin radiografías todavía.</p>;
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {radiografias.map((rx) => (
          <button
            key={rx.id}
            onClick={() => setZoomUrl(rx.url)}
            className="shrink-0 w-28 text-left"
          >
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
