"use client";

import { ESTATUS_CITA_LABEL, ESTATUS_CITA_COLOR } from "@/lib/validaciones/cita.schema";
import { construirLinkWhatsapp, mensajeRecordatorioCita } from "@/lib/whatsapp";
import type { EstatusCita } from "@prisma/client";

const HORA_INICIO_DIA = 8;
const HORA_FIN_DIA = 20;
const ALTURA_SLOT = 40; // px por bloque de 30 min
const TOTAL_SLOTS = (HORA_FIN_DIA - HORA_INICIO_DIA) * 2;
const ALTURA_TOTAL = TOTAL_SLOTS * ALTURA_SLOT;

const OPCIONES_ESTATUS: EstatusCita[] = [
  "PROGRAMADA",
  "CONFIRMADA",
  "COMPLETADA",
  "CANCELADA",
  "NO_ASISTIO",
];

const PUNTO_COLUMNA = ["#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

function minutosDesdeInicioDia(fecha: Date): number {
  return (fecha.getHours() - HORA_INICIO_DIA) * 60 + fecha.getMinutes();
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
}: {
  cita: T;
  onCambiarEstatus: (id: string, estatus: EstatusCita) => void;
}) {
  const inicio = new Date(cita.horaInicio);
  const fin = new Date(cita.horaFin);
  const top = Math.max(0, (minutosDesdeInicioDia(inicio) / 30) * ALTURA_SLOT);
  const alto = Math.max(24, ((fin.getTime() - inicio.getTime()) / 60000 / 30) * ALTURA_SLOT - 2);

  return (
    <div
      className="absolute left-1 right-1 rounded-lg bg-white border-l-4 shadow-sm px-2 py-1 overflow-hidden group hover:z-20 hover:shadow-md transition"
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

      {/* Detalle y acciones — visibles siempre en móvil (sin hover), y al hover en desktop */}
      <div className="mt-1 flex flex-col gap-1">
        <select
          value={cita.estatus}
          onChange={(e) => onCambiarEstatus(cita.id, e.target.value as EstatusCita)}
          className="w-full text-[10px] h-6 border border-gray-200 rounded px-1"
        >
          {OPCIONES_ESTATUS.map((e) => (
            <option key={e} value={e}>
              {ESTATUS_CITA_LABEL[e]}
            </option>
          ))}
        </select>
        {cita.paciente.whatsapp && (
          <a
            href={construirLinkWhatsapp(
              cita.paciente.whatsapp,
              mensajeRecordatorioCita({
                nombrePaciente: cita.paciente.nombre,
                fecha: cita.fecha,
                horaInicio: cita.horaInicio,
                tipoTratamiento: cita.tipoTratamiento,
              })
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-center bg-green-50 text-green-700 border border-green-200 rounded px-1 py-0.5"
          >
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

export default function AgendaTimeline<T extends CitaBase>({
  columnas,
  onCambiarEstatus,
}: {
  columnas: { clave: string; titulo: string; citas: T[] }[];
  onCambiarEstatus: (id: string, estatus: EstatusCita) => void;
}) {
  const horas = Array.from(
    { length: HORA_FIN_DIA - HORA_INICIO_DIA },
    (_, i) => HORA_INICIO_DIA + i
  );

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex overflow-x-auto">
        {/* Columna de horas — fija a la izquierda */}
        <div className="shrink-0 w-14 border-r bg-gray-50">
          <div className="h-10 border-b" /> {/* espacio del encabezado de columnas */}
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

        {/* Columnas de citas */}
        {columnas.map((col, i) => (
          <div key={col.clave} className="shrink-0 w-[220px] border-r last:border-r-0">
            <div className="h-10 border-b flex items-center gap-2 px-3 sticky top-0 bg-white z-10">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: PUNTO_COLUMNA[i % PUNTO_COLUMNA.length] }}
              />
              <span className="text-sm font-semibold text-gray-700 truncate">{col.titulo}</span>
              <span className="text-[10px] text-gray-400 ml-auto shrink-0">{col.citas.length}</span>
            </div>
            <div
              className="relative"
              style={{
                height: ALTURA_TOTAL,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, #f3f4f6 0, #f3f4f6 1px, transparent 1px, transparent " +
                  ALTURA_SLOT +
                  "px)",
              }}
            >
              {col.citas.map((cita) => (
                <BloqueCita key={cita.id} cita={cita} onCambiarEstatus={onCambiarEstatus} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
