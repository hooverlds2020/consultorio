"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeEditarClinico } from "@/lib/permisos";

const CARPETA_FIRMAS = path.join(process.cwd(), "public", "uploads", "firmas-consentimiento");

export type EstadoConsentimiento = { ok: boolean; mensaje?: string };

export async function crearConsentimiento(
  pacienteId: string,
  _prevState: EstadoConsentimiento,
  formData: FormData
): Promise<EstadoConsentimiento> {
  const session = await getServerSession(authOptions);
  if (!session || !puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para registrar consentimientos." };
  }

  const tipoTratamiento = (formData.get("tipoTratamiento") ?? "").toString().trim();
  const textoConsentimiento = (formData.get("textoConsentimiento") ?? "").toString().trim();
  const firmaBase64 = (formData.get("firmaBase64") ?? "").toString();

  if (!tipoTratamiento || !textoConsentimiento) {
    return { ok: false, mensaje: "Faltan datos del consentimiento." };
  }
  if (!firmaBase64 || !firmaBase64.startsWith("data:image/png;base64,")) {
    return { ok: false, mensaje: "Falta la firma del paciente." };
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
  if (!paciente || paciente.eliminadoEn) {
    return { ok: false, mensaje: "El paciente no existe." };
  }

  await mkdir(CARPETA_FIRMAS, { recursive: true });

  const base64Datos = firmaBase64.replace("data:image/png;base64,", "");
  const bytes = Buffer.from(base64Datos, "base64");
  const nombreArchivo = `${crypto.randomUUID()}.png`;
  await writeFile(path.join(CARPETA_FIRMAS, nombreArchivo), bytes);

  await prisma.consentimiento.create({
    data: {
      pacienteId,
      dentistaId: session.user.id,
      tipoTratamiento,
      textoConsentimiento,
      firmaImagenPath: `/uploads/firmas-consentimiento/${nombreArchivo}`,
    },
  });

  revalidatePath(`/panel/pacientes/${pacienteId}/consentimientos`);
  return { ok: true };
}

export async function listarConsentimientosPaciente(pacienteId: string) {
  return prisma.consentimiento.findMany({
    where: { pacienteId, eliminadoEn: null },
    orderBy: { fechaFirma: "desc" },
    include: { dentista: { select: { nombre: true } } },
  });
}
