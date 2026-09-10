"use client";

/**
 * Diente con 5 caras clickeables, ahora pintado según los hallazgos
 * guardados (Paso 3). Convención de zonas: arriba=Vestibular,
 * abajo=Lingual/Palatino, izquierda=Mesial, derecha=Distal, centro=Oclusal.
 */

export type Cara = "Oclusal" | "Mesial" | "Distal" | "Vestibular" | "Lingual";

const COLOR_BASE = "#ffffff";
const COLOR_BORDE = "#6b7280";

export default function DienteV2({
  numero,
  coloresPorCara,
  esAusencia,
  onClickCara,
}: {
  numero: number;
  /** Color hex por cara específica; si una cara no aparece, se ve blanca. */
  coloresPorCara: Partial<Record<Cara, string>>;
  /** Cuando el hallazgo más reciente de "Todas" es Ausencia: gris + X. */
  esAusencia?: boolean;
  onClickCara: (numero: number, cara: Cara) => void;
}) {
  function Zona({ cara, puntos }: { cara: Cara; puntos: string }) {
    const color = esAusencia ? "#d1d5db" : coloresPorCara[cara] ?? COLOR_BASE;
    return (
      <polygon
        points={puntos}
        fill={color}
        stroke={COLOR_BORDE}
        strokeWidth={0.5}
        className="cursor-pointer transition-colors hover:opacity-80"
        onClick={() => onClickCara(numero, cara)}
      >
        <title>{`${numero} - ${cara}`}</title>
      </polygon>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <svg width={50} height={50} viewBox="0 0 50 50">
        <Zona cara="Vestibular" puntos="0,0 50,0 35,15 15,15" />
        <Zona cara="Distal" puntos="50,0 50,50 35,35 35,15" />
        <Zona cara="Lingual" puntos="50,50 0,50 15,35 35,35" />
        <Zona cara="Mesial" puntos="0,50 0,0 15,15 15,35" />
        <Zona cara="Oclusal" puntos="15,15 35,15 35,35 15,35" />
        {esAusencia && (
          <>
            <line x1={4} y1={4} x2={46} y2={46} stroke="#374151" strokeWidth={2.5} />
            <line x1={46} y1={4} x2={4} y2={46} stroke="#374151" strokeWidth={2.5} />
          </>
        )}
      </svg>
      <span className="text-[11px] text-gray-500">{numero}</span>
    </div>
  );
}
