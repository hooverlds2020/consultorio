export type EstadoDiente =
  | "SANO"
  | "CARIES"
  | "AUSENTE"
  | "CORONA"
  | "IMPLANTE"
  | "ENDODONCIA"
  | "RESTAURADO";

export const ORDEN_ESTADOS: EstadoDiente[] = [
  "SANO",
  "CARIES",
  "AUSENTE",
  "CORONA",
  "IMPLANTE",
  "ENDODONCIA",
  "RESTAURADO",
];

export const COLOR_ESTADO: Record<EstadoDiente, string> = {
  SANO: "#FFFFFF",
  CARIES: "#EF4444", // rojo
  AUSENTE: "#9CA3AF", // gris
  CORONA: "#FACC15", // amarillo
  IMPLANTE: "#A855F7", // morado
  ENDODONCIA: "#FB923C", // naranja
  RESTAURADO: "#3B82F6", // azul
};

export const NOMBRE_ESTADO: Record<EstadoDiente, string> = {
  SANO: "Sano",
  CARIES: "Caries",
  AUSENTE: "Ausente",
  CORONA: "Corona",
  IMPLANTE: "Implante",
  ENDODONCIA: "Endodoncia",
  RESTAURADO: "Restaurado",
};

export function siguienteEstado(actual: EstadoDiente): EstadoDiente {
  const indiceActual = ORDEN_ESTADOS.indexOf(actual);
  return ORDEN_ESTADOS[(indiceActual + 1) % ORDEN_ESTADOS.length];
}

/** Numeración FDI — adulto: 32 dientes, cuadrantes 1-4 */
export function numerosAdulto(): { arribaeDerecha: number[]; arribaIzquierda: number[]; abajoIzquierda: number[]; abajoDerecha: number[] } {
  return {
    arribaeDerecha: [18, 17, 16, 15, 14, 13, 12, 11],
    arribaIzquierda: [21, 22, 23, 24, 25, 26, 27, 28],
    abajoIzquierda: [31, 32, 33, 34, 35, 36, 37, 38],
    abajoDerecha: [48, 47, 46, 45, 44, 43, 42, 41],
  };
}

/** Numeración FDI — infantil (dientes de leche): 20 dientes, cuadrantes 5-8 */
export function numerosInfantil() {
  return {
    arribaeDerecha: [55, 54, 53, 52, 51],
    arribaIzquierda: [61, 62, 63, 64, 65],
    abajoIzquierda: [71, 72, 73, 74, 75],
    abajoDerecha: [85, 84, 83, 82, 81],
  };
}

export type TipoAnatomico = "incisivo" | "canino" | "premolar" | "molar";

/**
 * Determina el tipo anatómico del diente según el último dígito de su
 * numeración FDI. En dentición infantil no existen premolares —
 * las posiciones 4 y 5 son molares deciduos.
 */
export function tipoDiente(numero: number, esInfantil: boolean): TipoAnatomico {
  const posicion = numero % 10;
  if (posicion === 1 || posicion === 2) return "incisivo";
  if (posicion === 3) return "canino";
  if (posicion === 4 || posicion === 5) return esInfantil ? "molar" : "premolar";
  return "molar";
}

export type Arcada = "superior" | "inferior";

export type DientesJson = Record<string, { estado: EstadoDiente; notas?: string }>;


export function odontogramaVacio(
  tipo: "ADULTO_32" | "INFANTIL_20"
): DientesJson {
  const { arribaeDerecha, arribaIzquierda, abajoIzquierda, abajoDerecha } =
    tipo === "ADULTO_32" ? numerosAdulto() : numerosInfantil();
  const todos = [...arribaeDerecha, ...arribaIzquierda, ...abajoIzquierda, ...abajoDerecha];
  const resultado: DientesJson = {};
  for (const numero of todos) {
    resultado[String(numero)] = { estado: "SANO" };
  }
  return resultado;
}
