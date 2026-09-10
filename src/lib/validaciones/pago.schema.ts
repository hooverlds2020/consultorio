import { z } from "zod";

export const pagoSchema = z.object({
  monto: z.coerce.number().positive("El monto debe ser mayor a cero"),
  metodo: z.enum(["EFECTIVO", "TARJETA", "TRANSFERENCIA"], {
    errorMap: () => ({ message: "Selecciona un método de pago" }),
  }),
  planTratamientoId: z.string().optional().or(z.literal("")),
  concepto: z.string().trim().max(200).optional().or(z.literal("")),
});

export const METODO_PAGO_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
};

export function generarFolioRecibo(): string {
  const fecha = Date.now().toString(36).toUpperCase();
  const azar = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `REC-${fecha}-${azar}`;
}
