import { z } from "zod";

export const ordenLabSchema = z.object({
  pacienteId: z.string().min(1, "Selecciona un paciente"),
  tipoTrabajo: z.enum(
    ["CORONA", "PUENTE", "PROTESIS_TOTAL", "PROTESIS_PARCIAL", "PLACA_GUARDA", "OTRO"],
    { errorMap: () => ({ message: "Selecciona un tipo de trabajo" }) }
  ),
  tonoDiente: z.string().trim().max(30).optional().or(z.literal("")),
  material: z.string().trim().max(100).optional().or(z.literal("")),
  diente: z.string().trim().max(10).optional().or(z.literal("")),
  notas: z.string().trim().max(500).optional().or(z.literal("")),
});

export const TIPO_TRABAJO_LABEL: Record<string, string> = {
  CORONA: "Corona",
  PUENTE: "Puente",
  PROTESIS_TOTAL: "Prótesis total",
  PROTESIS_PARCIAL: "Prótesis parcial",
  PLACA_GUARDA: "Placa/Guarda",
  OTRO: "Otro",
};

export const ESTATUS_LAB_LABEL: Record<string, string> = {
  RECIBIDO: "Recibido",
  EN_PROCESO: "En proceso",
  TERMINADO: "Terminado",
  ENTREGADO: "Entregado",
};

export const ORDEN_ESTATUS_LAB: string[] = ["RECIBIDO", "EN_PROCESO", "TERMINADO", "ENTREGADO"];
