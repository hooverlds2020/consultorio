import type { DientesJson, EstadoDiente } from "@/lib/odontograma";
import { NOMBRE_ESTADO } from "@/lib/odontograma";

export type CambioDiente = { diente: string; de: EstadoDiente; a: EstadoDiente };

/** Lo que se guarda en la columna dientesJson a partir de este cambio. */
export type VersionOdontogramaJson = {
  dientes: DientesJson;
  motivo: string;
  diff: CambioDiente[];
};

/**
 * Extrae el mapa de dientes desde el JSON guardado, sea el formato nuevo
 * (con motivo/diff) o el formato viejo (mapa plano, de antes de este fix)
 * — así el historial anterior a esta actualización no se rompe.
 */
export function extraerMapaDientes(json: unknown): DientesJson {
  if (json && typeof json === "object" && "dientes" in (json as Record<string, unknown>)) {
    return (json as VersionOdontogramaJson).dientes;
  }
  return json as DientesJson;
}

export function extraerMotivo(json: unknown): string | null {
  if (json && typeof json === "object" && "motivo" in (json as Record<string, unknown>)) {
    return (json as VersionOdontogramaJson).motivo || null;
  }
  return null;
}

export function extraerDiff(json: unknown): CambioDiente[] {
  if (json && typeof json === "object" && "diff" in (json as Record<string, unknown>)) {
    return (json as VersionOdontogramaJson).diff || [];
  }
  return [];
}

/** Compara dos mapas de dientes y arma la lista de cambios (solo lo que cambió). */
export function calcularDiff(anterior: DientesJson, nuevo: DientesJson): CambioDiente[] {
  const cambios: CambioDiente[] = [];
  for (const diente of Object.keys(nuevo)) {
    const estadoAnterior = anterior[diente]?.estado ?? "SANO";
    const estadoNuevo = nuevo[diente]?.estado ?? "SANO";
    if (estadoAnterior !== estadoNuevo) {
      cambios.push({ diente, de: estadoAnterior, a: estadoNuevo });
    }
  }
  return cambios;
}

/** Texto corto para mostrar en el historial, ej. "42 sano→corona, 18 sano→implante". */
export function formatearDiff(diff: CambioDiente[]): string {
  if (diff.length === 0) return "Sin cambios registrados";
  return diff
    .map((c) => `${c.diente} ${NOMBRE_ESTADO[c.de].toLowerCase()}→${NOMBRE_ESTADO[c.a].toLowerCase()}`)
    .join(", ");
}
