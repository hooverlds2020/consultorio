"use client";

/**
 * Diente con 5 caras clickeables (Paso 2 — solo visual, sin guardar nada).
 * Convención de zonas usada aquí (ajustable después si el dentista pide
 * otra orientación anatómica): arriba=Vestibular, abajo=Lingual/Palatino,
 * izquierda=Mesial, derecha=Distal, centro=Oclusal.
 */

type Cara = "Oclusal" | "Mesial" | "Distal" | "Vestibular" | "Lingual";

const COLOR_BASE = "#ffffff";
const COLOR_HOVER = "#dbeafe";
const COLOR_BORDE = "#6b7280";

export default function DienteV2({
  numero,
  onClickCara,
}: {
  numero: number;
  onClickCara: (numero: number, cara: Cara) => void;
}) {
  function Zona({ cara, puntos }: { cara: Cara; puntos: string }) {
    return (
      <polygon
        points={puntos}
        fill={COLOR_BASE}
        stroke={COLOR_BORDE}
        strokeWidth={0.5}
        className="cursor-pointer transition-colors hover:fill-[--color-hover]"
        style={{ ["--color-hover" as string]: COLOR_HOVER }}
        onClick={() => onClickCara(numero, cara)}
      >
        <title>{`${numero} - ${cara}`}</title>
      </polygon>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <svg width={50} height={50} viewBox="0 0 50 50">
        {/* Vestibular — arriba */}
        <Zona cara="Vestibular" puntos="0,0 50,0 35,15 15,15" />
        {/* Distal — derecha */}
        <Zona cara="Distal" puntos="50,0 50,50 35,35 35,15" />
        {/* Lingual — abajo */}
        <Zona cara="Lingual" puntos="50,50 0,50 15,35 35,35" />
        {/* Mesial — izquierda */}
        <Zona cara="Mesial" puntos="0,50 0,0 15,15 15,35" />
        {/* Oclusal — centro */}
        <Zona cara="Oclusal" puntos="15,15 35,15 35,35 15,35" />
      </svg>
      <span className="text-[11px] text-gray-500">{numero}</span>
    </div>
  );
}
