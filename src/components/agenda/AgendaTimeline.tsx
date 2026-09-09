"use client";

import { ESTATUS_CITA_COLOR } from "@/lib/validaciones/cita.schema";
import type { EstatusCita } from "@prisma/client";

const ALTURA_SLOT = 40; // px por bloque de 30 min

const PUNTO_COLUMNA = ["#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

function minutosDesdeInicioDia(fecha: Date, horaInicioDia: number): number {
  return (fecha.getHours() - horaInicioDia) * 60 + fecha.getMinutes();
}

function formatoHora(fecha: Date): string {
  return fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

type CitaBase = {
  id: string;
  horaInicio: Date | string;
  horaFin: Date | string;
  tipoTratamiento: string;
  estatus: string;
  sillon: number;
  paciente: { nombre: string; apellidos: string; whatsapp?: string | null };
  dentista: { id: string; nombre: string };
  fecha: Date | string;
};

function BloqueCita<T extends CitaBase>({
  cita,
  onCambiarEstatus,
  horaInicioDia,
  onClick,
}: {
  cita: T;
  onCambiarEstatus: (id: string, estatus: EstatusCita) => void;
  horaInicioDia: number;
  onClick: () => void;
}) {
  const inicio = new Date(cita.horaInicio);
  const fin = new Date(cita.horaFin);
  const top = Math.max(0, (minutosDesdeInicioDia(inicio, horaInicioDia) / 30) * ALTURA_SLOT);
  // Altura mínima garantizada (48px) para que siempre quepan las 3 líneas
  // (hora, paciente, tratamiento) sin recortarse — una cita de 15-30 min
  // puede así "asomarse" un poco sobre el siguiente bloque de la grilla,
  // lo cual es preferible a ocultar de qué se trata la cita.
  const altoPorDuracion = ((fin.getTime() - inicio.getTime()) / 60000 / 30) * ALTURA_SLOT - 2;
  const alto = Math.max(48, altoPorDuracion);

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-1 right-1 rounded-lg bg-white border-l-4 shadow-sm px-2 py-1 text-left hover:z-20 hover:shadow-md transition"
      style={{ top, height: alto, borderLeftColor: ESTATUS_CITA_COLOR[cita.estatus] }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: ESTATUS_CITA_COLOR[cita.estatus] }}
        />
        <p className="text-[11px] font-semibold text-gray-700 truncate">
          {formatoHora(inicio)}–{formatoHora(fin)}
        </p>
      </div>
      <p className="text-xs font-medium text-gray-800 truncate">
        {cita.paciente.nombre} {cita.paciente.apellidos}
      </p>
      <p className="text-[11px] text-gray-500 truncate">{cita.tipoTratamiento}</p>
    </button>
  );
}

export default function AgendaTimeline<T extends CitaBase>({
  columnas,
  onCambiarEstatus,
  onClickCita,
  horaInicioDia = 8,
  horaFinDia = 20,
  comida,
}: {
  columnas: { clave: string; titulo: string; citas: T[] }[];
  onCambiarEstatus: (id: string, estatus: EstatusCita) => void;
  onClickCita: (cita: T) => void;
  /** Recortan la grilla al horario real de la clínica ese día. */
  horaInicioDia?: number;
  horaFinDia?: number;
  /** Franja de comida, en formato "HH:MM", si aplica ese día. */
  comida?: { inicio: string; fin: string } | null;
}) {
  const totalSlots = Math.round((horaFinDia - horaInicioDia) * 2);
  const alturaTotal = totalSlots * ALTURA_SLOT;
  const horas = Array.from({ length: Math.ceil(horaFinDia - horaInicioDia) }, (_, i) => horaInicioDia + i);

  let bandaComida: { top: number; alto: number } | null = null;
  if (comida) {
    const [hi, mi] = comida.inicio.split(":").map(Number);
    const [hf, mf] = comida.fin.split(":").map(Number);
    const inicioMin = (hi - horaInicioDia) * 60 + mi;
    const finMin = (hf - horaInicioDia) * 60 + mf;
    bandaComida = { top: (inicioMin / 30) * ALTURA_SLOT, alto: ((finMin - inicioMin) / 30) * ALTURA_SLOT };
  }

  // 1-3 sillones: se reparten el 100% del ancho, sin scroll.
  // 4+ sillones: cada uno respeta un mínimo de 280px y aparece el scroll
  // horizontal con "snap" — así con 10 sillones se ven 3-4 a la vez y
  // se desliza para ver el resto, en vez de aplastarlos hasta ser ilegibles.
  // (280px cabe cómodo incluso en el ancho mínimo de referencia del sistema,
  // 360px, mostrando la columna actual más un adelanto de la siguiente —
  // por eso no hace falta un valor aparte para móvil.)
  const gridTemplateColumns =
    columnas.length <= 3
      ? `56px repeat(${columnas.length}, 1fr)`
      : `56px repeat(${columnas.length}, minmax(280px, 1fr))`;

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto snap-x snap-mandatory">
        <div className="grid" style={{ gridTemplateColumns }}>
          {/* Esquina superior izquierda, encima de la columna de horas */}
          <div className="sticky left-0 top-0 z-20 bg-gray-50 h-10 border-b border-r" />

          {/* Encabezados de cada sillón/dentista */}
          {columnas.map((col, i) => (
            <div
              key={`${col.clave}-header`}
              className="sticky top-0 z-10 bg-white h-10 border-b flex items-center gap-2 px-3 snap-start"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: PUNTO_COLUMNA[i % PUNTO_COLUMNA.length] }}
              />
              <span className="text-sm font-semibold text-gray-700 truncate">{col.titulo}</span>
              <span className="text-[10px] text-gray-400 ml-auto shrink-0">{col.citas.length}</span>
            </div>
          ))}

          {/* Columna de horas — fija a la izquierda al deslizar */}
          <div
            className="sticky left-0 z-20 bg-gray-50 border-r"
            style={{ height: alturaTotal }}
          >
            {horas.map((h) => (
              <div
                key={h}
                className="text-[11px] text-gray-400 text-right pr-2 -mt-2"
                style={{ height: ALTURA_SLOT * 2 }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Cuerpo de cada columna, con las citas posicionadas por hora */}
          {columnas.map((col) => (
            <div
              key={`${col.clave}-body`}
              className="relative border-r last:border-r-0 snap-start"
              style={{
                height: alturaTotal,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, #f3f4f6 0, #f3f4f6 1px, transparent 1px, transparent " +
                  ALTURA_SLOT +
                  "px)",
              }}
            >
              {bandaComida && (
                <div
                  className="absolute left-0 right-0 bg-gray-100/80 border-y border-dashed border-gray-300 pointer-events-none flex items-center justify-center"
                  style={{ top: bandaComida.top, height: bandaComida.alto }}
                >
                  <span className="text-[10px] text-gray-400 font-medium">Comida</span>
                </div>
              )}
              {col.citas.map((cita) => (
                <BloqueCita
                  key={cita.id}
                  cita={cita}
                  onCambiarEstatus={onCambiarEstatus}
                  horaInicioDia={horaInicioDia}
                  onClick={() => onClickCita(cita)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
