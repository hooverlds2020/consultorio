const ZONA_CLINICA = "America/Mexico_City";

/**
 * Devuelve la fecha de "hoy" en formato YYYY-MM-DD, calculada en la zona
 * horaria de la clínica (no en UTC). Usar SIEMPRE esto en vez de
 * `new Date().toISOString().split('T')[0]`, porque toISOString() da la
 * fecha en UTC y cerca del final del día en México (tarde/noche) ya
 * cuenta como "mañana" en UTC, desfasando reportes y agenda.
 */
export function hoyEnZonaClinica(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ZONA_CLINICA });
}

export function sumarDiasEnZonaClinica(fechaISO: string, dias: number): string {
  const fecha = new Date(`${fechaISO}T12:00:00`); // mediodía evita cruces de día por redondeo
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toLocaleDateString("en-CA", { timeZone: ZONA_CLINICA });
}
