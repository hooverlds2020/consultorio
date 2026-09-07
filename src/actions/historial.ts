"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeEditarClinico } from "@/lib/permisos";

const CARPETA_RADIOGRAFIAS = path.join(process.cwd(), "public", "uploads", "radiografias");
const EXTENSIONES_PERMITIDAS = [".jpg", ".jpeg", ".png", ".pdf", ".webp"];
const TAMANO_MAXIMO_BYTES = 15 * 1024 * 1024; // 15MB

export type EstadoHistorial = { ok: boolean; mensaje?: string };

async function guardarArchivo(archivo: File): Promise<string> {
  const extension = path.extname(archivo.name).toLowerCase();
  if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
    throw new Error(`Tipo de archivo no permitido: ${extension}`);
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    throw new Error(`El archivo ${archivo.name} supera los 15MB.`);
  }

  await mkdir(CARPETA_RADIOGRAFIAS, { recursive: true });

  const nombreUnico = `${crypto.randomUUID()}${extension}`;
  const rutaCompleta = path.join(CARPETA_RADIOGRAFIAS, nombreUnico);
  const bytes = Buffer.from(await archivo.arrayBuffer());
  await writeFile(rutaCompleta, bytes);

  return `/uploads/radiografias/${nombreUnico}`;
}

export async function crearEntradaHistorial(
  pacienteId: string,
  _prevState: EstadoHistorial,
  formData: FormData
): Promise<EstadoHistorial> {
  const session = await getServerSession(authOptions);

  if (!session || !puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para agregar historial clínico." };
  }

  const notas = (formData.get("notas") ?? "").toString().trim();
  if (!notas) {
    return { ok: false, mensaje: "Las notas son obligatorias." };
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
  if (!paciente || paciente.eliminadoEn) {
    return { ok: false, mensaje: "El paciente no existe." };
  }

  const archivos = formData.getAll("radiografias") as File[];
  const rutasGuardadas: string[] = [];

  try {
    for (const archivo of archivos) {
      if (archivo && archivo.size > 0) {
        const ruta = await guardarArchivo(archivo);
        rutasGuardadas.push(ruta);
      }
    }
  } catch (error) {
    return { ok: false, mensaje: (error as Error).message };
  }

  await prisma.historialClinico.create({
    data: {
      pacienteId,
      dentistaId: session.user.id,
      notas,
      archivosAdjuntos: rutasGuardadas,
    },
  });

  revalidatePath(`/panel/pacientes/${pacienteId}/historial`);
  return { ok: true };
}

export async function listarHistorial(pacienteId: string) {
  return prisma.historialClinico.findMany({
    where: { pacienteId, eliminadoEn: null },
    orderBy: { fecha: "desc" },
    include: { dentista: { select: { nombre: true } } },
  });
}
