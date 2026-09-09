export const DIAS_SEMANA = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const NOMBRE_DIA: Record<DiaSemana, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export type HorarioDia = {
  activo: boolean;
  apertura: string; // "HH:MM"
  cierre: string;
  comidaInicio?: string;
  comidaFin?: string;
};

export type HorariosSemana = Record<DiaSemana, HorarioDia>;

/** Se usa si nunca se ha guardado una configuración — no rompe lo que ya existía. */
export const HORARIO_POR_DEFECTO: HorariosSemana = {
  lunes: { activo: true, apertura: "09:00", cierre: "19:00" },
  martes: { activo: true, apertura: "09:00", cierre: "19:00" },
  miercoles: { activo: true, apertura: "09:00", cierre: "19:00" },
  jueves: { activo: true, apertura: "09:00", cierre: "19:00" },
  viernes: { activo: true, apertura: "09:00", cierre: "19:00" },
  sabado: { activo: true, apertura: "09:00", cierre: "19:00" },
  domingo: { activo: false, apertura: "09:00", cierre: "14:00" },
};

const INDICE_DIA_A_CLAVE: DiaSemana[] = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
]; // Date.getDay(): 0=domingo … 6=sábado

export function diaSemanaDeFecha(fechaISO: string): DiaSemana {
  const fecha = new Date(`${fechaISO}T12:00:00`); // mediodía evita líos de zona horaria
  return INDICE_DIA_A_CLAVE[fecha.getDay()];
}

/** "09:30" -> 9.5 (horas decimales, útil para calcular posiciones en la grilla). */
export function horaTextoADecimal(horaTexto: string): number {
  const [h, m] = horaTexto.split(":").map(Number);
  return h + m / 60;
}
