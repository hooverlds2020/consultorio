import { z } from "zod";

export const UNIDADES_MEDIDA = ["pza", "ml", "g", "caja", "par", "frasco", "tubo", "rollo"] as const;

export const insumoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  unidadMedida: z.enum(UNIDADES_MEDIDA, {
    errorMap: () => ({ message: "Selecciona una unidad válida" }),
  }),
  stockInicial: z.coerce.number().min(0, "No puede ser negativo"),
  stockMinimo: z.coerce.number().min(0, "No puede ser negativo"),
});

export const movimientoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SALIDA"]),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a cero"),
  motivo: z.string().trim().max(200).optional().or(z.literal("")),
});
