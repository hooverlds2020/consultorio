import { z } from "zod";

export const citaSchema = z.object({
  pacienteId: z.string().min(1, "Selecciona un paciente"),
  dentistaId: z.string().min(1, "Selecciona un dentista"),
  sillon: z.coerce.number().int().min(1).max(2),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  horaFin: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  tipoTratamiento: z.string().trim().min(1, "El tipo de tratamiento es obligatorio").max(150),
  notas: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CitaFormValues = z.infer<typeof citaSchema>;

export const ESTATUS_CITA_LABEL: Record<string, string> = {
  PROGRAMADA: "Programada",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
  COMPLETADA: "Completada",
};

export const ESTATUS_CITA_COLOR: Record<string, string> = {
  PROGRAMADA: "#F59E0B", // amarillo/ámbar — agendada
  CONFIRMADA: "#22C55E", // verde — confirmada
  CANCELADA: "#78716C", // gris piedra — cancelada
  NO_ASISTIO: "#EF4444", // rojo — no se presentó
  COMPLETADA: "#9CA3AF", // gris — terminada
};
