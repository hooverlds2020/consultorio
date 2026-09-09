"use server";

import { getServerSession } from "next-auth";
import crypto from "crypto";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeEditarClinico } from "@/lib/permisos";
import { construirLinkWhatsapp } from "@/lib/whatsapp";

const CARPETA_FIRMAS = path.join(process.cwd(), "public", "uploads", "firmas-consentimiento");
const HORAS_VALIDEZ_TOKEN = 72;

export type EstadoFirmaRemota = { ok: boolean; mensaje?: string; linkWhatsapp?: string };

/**
 * El dentista crea la solicitud: queda un registro "pendiente" (sin firma)
 * con un token de un solo uso. Devuelve el link de wa.me ya armado para
 * que el dentista lo mande desde su propio WhatsApp — nunca automatizamos
 * el envío, solo preparamos el mensaje.
 */
export async function crearSolicitudFirmaRemota(
  pacienteId: string,
  tipoTratamiento: string,
  textoConsentimiento: string
): Promise<EstadoFirmaRemota> {
  const session = await getServerSession(authOptions);
  if (!session || !puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para esto." };
  }

  if (!tipoTratamiento || !textoConsentimiento.trim()) {
    return { ok: false, mensaje: "Faltan datos del consentimiento." };
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
  if (!paciente || paciente.eliminadoEn) {
    return { ok: false, mensaje: "El paciente no existe." };
  }
  if (!paciente.whatsapp) {
    return { ok: false, mensaje: "Este paciente no tiene WhatsApp registrado en su ficha." };
  }

  const token = crypto.randomUUID();
  const tokenExpiraEn = new Date(Date.now() + HORAS_VALIDEZ_TOKEN * 60 * 60 * 1000);

  await prisma.consentimiento.create({
    data: {
      pacienteId,
      dentistaId: session.user.id,
      tipoTratamiento,
      textoConsentimiento: textoConsentimiento.trim(),
      token,
      tokenExpiraEn,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://odontologia.clicknube.site";
  const urlFirma = `${baseUrl}/firmar/${token}`;
  const mensaje =
    `Hola ${paciente.nombre}, te compartimos tu consentimiento informado para revisar y firmar ` +
    `desde tu celular: ${urlFirma}\n\nEste enlace es personal y expira en ${HORAS_VALIDEZ_TOKEN} horas.`;

  return { ok: true, linkWhatsapp: construirLinkWhatsapp(paciente.whatsapp, mensaje) };
}

/** Consulta pública (sin sesión) — solo trae lo mínimo necesario para mostrar y firmar. */
export async function obtenerSolicitudPorToken(token: string) {
  const solicitud = await prisma.consentimiento.findUnique({
    where: { token },
    include: {
      paciente: { select: { nombre: true, apellidos: true } },
      dentista: { select: { nombre: true } },
    },
  });

  if (!solicitud) return { estado: "no_encontrado" as const };
  if (solicitud.firmaImagenPath) return { estado: "ya_firmado" as const };
  if (solicitud.tokenExpiraEn && solicitud.tokenExpiraEn < new Date()) {
    return { estado: "expirado" as const };
  }

  return {
    estado: "pendiente" as const,
    tipoTratamiento: solicitud.tipoTratamiento,
    textoConsentimiento: solicitud.textoConsentimiento,
    pacienteNombre: `${solicitud.paciente.nombre} ${solicitud.paciente.apellidos}`,
    dentistaNombre: solicitud.dentista.nombre,
  };
}

/** Firmado público (sin sesión) — valida el token de nuevo del lado del servidor antes de escribir nada. */
export async function firmarRemoto(
  token: string,
  firmaBase64: string
): Promise<EstadoFirmaRemota> {
  if (!firmaBase64 || !firmaBase64.startsWith("data:image/png;base64,")) {
    return { ok: false, mensaje: "Falta la firma." };
  }

  const solicitud = await prisma.consentimiento.findUnique({ where: { token } });

  if (!solicitud) {
    return { ok: false, mensaje: "Este enlace no es válido." };
  }
  if (solicitud.firmaImagenPath) {
    return { ok: false, mensaje: "Este documento ya fue firmado anteriormente." };
  }
  if (solicitud.tokenExpiraEn && solicitud.tokenExpiraEn < new Date()) {
    return { ok: false, mensaje: "Este enlace ya expiró. Pide uno nuevo a tu dentista." };
  }

  const listaEncabezados = headers();
  const ip =
    listaEncabezados.get("x-forwarded-for")?.split(",")[0].trim() ??
    listaEncabezados.get("x-real-ip") ??
    "desconocida";

  await mkdir(CARPETA_FIRMAS, { recursive: true });
  const base64Datos = firmaBase64.replace("data:image/png;base64,", "");
  const bytes = Buffer.from(base64Datos, "base64");
  const nombreArchivo = `${crypto.randomUUID()}.png`;
  await writeFile(path.join(CARPETA_FIRMAS, nombreArchivo), bytes);

  const fechaFirma = new Date();
  const hashDocumento = crypto
    .createHash("sha256")
    .update(solicitud.textoConsentimiento + base64Datos + fechaFirma.toISOString())
    .digest("hex");

  await prisma.consentimiento.update({
    where: { token },
    data: {
      firmaImagenPath: `/uploads/firmas-consentimiento/${nombreArchivo}`,
      fechaFirma,
      ipFirma: ip,
      hashDocumento,
      token: null, // de un solo uso — ya no se puede volver a firmar con este enlace
    },
  });

  return { ok: true };
}
