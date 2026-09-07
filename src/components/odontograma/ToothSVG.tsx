"use client";

import { COLOR_ESTADO, NOMBRE_ESTADO } from "@/lib/odontograma";
import type { EstadoDiente, TipoAnatomico, Arcada } from "@/lib/odontograma";

type Props = {
  numero: number;
  estado: EstadoDiente;
  tipo: TipoAnatomico;
  arcada: Arcada;
  onClick: () => void;
  soloLectura?: boolean;
};

const ANCHO: Record<TipoAnatomico, number> = {
  incisivo: 20,
  canino: 20,
  premolar: 24,
  molar: 32,
};

const CUSPIDES: Record<TipoAnatomico, number> = {
  incisivo: 0,
  canino: 1,
  premolar: 2,
  molar: 4,
};

/** Largo de la raíz — incisivos y caninos tienen raíces más largas y afiladas. */
const ALTO_RAIZ: Record<TipoAnatomico, number> = {
  incisivo: 30,
  canino: 34,
  premolar: 26,
  molar: 22,
};

const CANTIDAD_RAICES: Record<TipoAnatomico, number> = {
  incisivo: 1,
  canino: 1,
  premolar: 1,
  molar: 2,
};

const ALTO_CORONA = 24;
const COLOR_RAIZ = "#F3EEE3"; // tono marfil, constante sin importar el estado de la corona
const COLOR_BORDE = "#A8A29E";

/** Construye el contorno de la corona: lados curvos + borde oclusal con "cantidad" cúspides. */
function contornoCorona(ancho: number, cantidad: number): string {
  const margen = ancho * 0.12;
  const izq = margen;
  const der = ancho - margen;
  const yBase = 8; // línea base del borde oclusal
  const yHombro = ALTO_CORONA; // donde la corona se estrecha hacia el cuello

  let bordeOclusal = "";
  if (cantidad === 0) {
    // Incisivo: borde recto con esquinas ligeramente redondeadas
    bordeOclusal = `Q ${izq},${yBase - 4} ${izq + 4},${yBase - 5} L ${der - 4},${yBase - 5} Q ${der},${yBase - 4} ${der},${yBase}`;
  } else {
    const paso = (der - izq) / cantidad;
    const partes: string[] = [`Q ${izq},${yBase - 3} ${izq + paso * 0.3},${yBase - 6}`];
    for (let i = 0; i < cantidad; i++) {
      const cx = izq + paso * i + paso / 2;
      const siguienteValle = izq + paso * (i + 1);
      partes.push(`Q ${cx},${-2} ${cx + paso * 0.28},${yBase - 5}`);
      if (i < cantidad - 1) {
        partes.push(`Q ${siguienteValle},${yBase - 2} ${siguienteValle + paso * 0.22},${yBase - 6}`);
      }
    }
    partes.push(`Q ${der},${yBase - 3} ${der},${yBase}`);
    bordeOclusal = partes.join(" ");
  }

  return (
    `M ${izq},${yBase} ${bordeOclusal} ` +
    `C ${der + 1},${ALTO_CORONA * 0.55} ${der - 3},${yHombro} ${ancho * 0.65},${yHombro} ` +
    `L ${ancho * 0.35},${yHombro} ` +
    `C ${izq + 3},${yHombro} ${izq - 1},${ALTO_CORONA * 0.55} ${izq},${yBase} Z`
  );
}

function pathRaiz(ancho: number, cantidad: number, largo: number): string[] {
  const yInicio = ALTO_CORONA - 2;
  const yFin = ALTO_CORONA + largo;
  if (cantidad === 1) {
    const cx = ancho / 2;
    return [
      `M ${ancho * 0.35},${yInicio} L ${ancho * 0.65},${yInicio} ` +
        `C ${ancho * 0.62},${yInicio + largo * 0.5} ${cx + 2},${yFin - 8} ${cx},${yFin} ` +
        `C ${cx - 2},${yFin - 8} ${ancho * 0.38},${yInicio + largo * 0.5} ${ancho * 0.35},${yInicio} Z`,
    ];
  }
  // Molar: dos raíces que divergen
  const separacion = ancho * 0.24;
  const centroIzq = ancho / 2 - separacion;
  const centroDer = ancho / 2 + separacion;
  return [
    `M ${ancho * 0.32},${yInicio} L ${ancho * 0.52},${yInicio} ` +
      `C ${ancho * 0.5},${yInicio + largo * 0.5} ${centroIzq + 1},${yFin - 6} ${centroIzq},${yFin} ` +
      `C ${centroIzq - 2},${yFin - 6} ${ancho * 0.3},${yInicio + largo * 0.5} ${ancho * 0.32},${yInicio} Z`,
    `M ${ancho * 0.48},${yInicio} L ${ancho * 0.68},${yInicio} ` +
      `C ${ancho * 0.7},${yInicio + largo * 0.5} ${centroDer + 2},${yFin - 6} ${centroDer},${yFin} ` +
      `C ${centroDer - 1},${yFin - 6} ${ancho * 0.5},${yInicio + largo * 0.5} ${ancho * 0.48},${yInicio} Z`,
  ];
}

export default function ToothSVG({ numero, estado, tipo, onClick, soloLectura }: Omit<Props, "arcada"> & { arcada?: Arcada }) {
  const ancho = ANCHO[tipo];
  const largoRaiz = ALTO_RAIZ[tipo];
  const altoTotal = ALTO_CORONA + largoRaiz + 2;
  const esAusente = estado === "AUSENTE";
  const colorCorona = esAusente ? "#FFFFFF" : COLOR_ESTADO[estado];

  return (
    <button
      type="button"
      disabled={soloLectura}
      onClick={onClick}
      title={`Diente ${numero} — ${NOMBRE_ESTADO[estado]}`}
      className="flex flex-col items-center gap-0.5 disabled:cursor-default group"
    >
      <svg width={ancho + 6} height={altoTotal + 4} viewBox={`-2 -6 ${ancho + 4} ${altoTotal + 8}`}>
        {esAusente ? (
          <path
            d={contornoCorona(ancho, CUSPIDES[tipo])}
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="1.2"
            strokeDasharray="2.5,2"
          />
        ) : (
          <>
            {pathRaiz(ancho, CANTIDAD_RAICES[tipo], largoRaiz).map((d, i) => (
              <path key={i} d={d} fill={COLOR_RAIZ} stroke={COLOR_BORDE} strokeWidth="1" />
            ))}
            <path
              d={contornoCorona(ancho, CUSPIDES[tipo])}
              fill={colorCorona}
              stroke={COLOR_BORDE}
              strokeWidth="1.2"
              className="transition-opacity group-hover:opacity-80"
            />
          </>
        )}
      </svg>
      <span className="text-[10px] text-gray-500">{numero}</span>
    </button>
  );
}
