import { Rol } from "@prisma/client";

/**
 * Mapa central de qué rutas del panel puede ver cada rol.
 * Se usa tanto en el middleware (bloqueo de navegación) como
 * dentro de cada Server Action (bloqueo real de datos).
 *
 * IMPORTANTE: nunca confiar solo en ocultar botones en la UI.
 * Cada Server Action debe volver a llamar a estas funciones.
 */

const RUTAS_POR_ROL: Record<Rol, string[]> = {
  SUPER_ADMIN: ["*"], // acceso total
  RECEPCIONISTA: [
    "/panel",
    "/panel/pacientes",
    "/panel/agenda",
    "/panel/cotizaciones",
    "/panel/caja",
  ],
  DENTISTA: [
    "/panel",
    "/panel/pacientes",
    "/panel/agenda",
    "/panel/cotizaciones",
    "/panel/planes-tratamiento",
    "/panel/lab/ordenes",
  ],
  TECNICO_LAB: ["/panel", "/panel/lab/ordenes"],
};

export function rutaPermitida(rol: Rol, pathname: string): boolean {
  const rutas = RUTAS_POR_ROL[rol];
  if (rutas.includes("*")) return true;
  return rutas.some((ruta) => pathname === ruta || pathname.startsWith(ruta + "/"));
}

export function esSuperAdmin(rol: Rol): boolean {
  return rol === "SUPER_ADMIN";
}

export function puedeVerFinanzas(rol: Rol): boolean {
  return rol === "SUPER_ADMIN";
}

export function puedeEditarClinico(rol: Rol): boolean {
  return rol === "DENTISTA" || rol === "SUPER_ADMIN";
}

export function puedeGestionarPacientes(rol: Rol): boolean {
  return rol === "RECEPCIONISTA" || rol === "DENTISTA" || rol === "SUPER_ADMIN";
}

export function puedeGestionarOrdenesLab(rol: Rol): boolean {
  return rol === "TECNICO_LAB" || rol === "DENTISTA" || rol === "SUPER_ADMIN";
}

export function puedeGestionarAgenda(rol: Rol): boolean {
  return rol === "RECEPCIONISTA" || rol === "DENTISTA" || rol === "SUPER_ADMIN";
}

export function puedeGestionarCotizaciones(rol: Rol): boolean {
  return rol === "RECEPCIONISTA" || rol === "DENTISTA" || rol === "SUPER_ADMIN";
}

export function puedeGestionarPagos(rol: Rol): boolean {
  return rol === "RECEPCIONISTA" || rol === "SUPER_ADMIN";
}

export function puedeVerInventario(rol: Rol): boolean {
  return rol === "SUPER_ADMIN" || rol === "DENTISTA" || rol === "TECNICO_LAB";
}

export function puedeRegistrarMovimientoInventario(rol: Rol): boolean {
  return rol === "SUPER_ADMIN" || rol === "DENTISTA" || rol === "TECNICO_LAB";
}
