"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { esSuperAdmin } from "@/lib/permisos";
import type { Prisma, SeccionLanding } from "@prisma/client";

export type EstadoLanding = { ok: boolean; mensaje?: string };

const CARPETA_GALERIA = path.join(process.cwd(), "public", "uploads", "galeria");

async function requerirSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    throw new Error("Solo el Super Admin puede editar el contenido de la landing.");
  }
  return session;
}

// ---------- Secciones de contenido simple (Hero, Nosotros, Contacto) ----------

export async function obtenerConfigLanding(seccion: SeccionLanding) {
  return prisma.configLanding.findUnique({ where: { seccion } });
}

export async function guardarConfigLanding(
  seccion: SeccionLanding,
  _prevState: EstadoLanding,
  formData: FormData
): Promise<EstadoLanding> {
  await requerirSuperAdmin();

  const contenido: Record<string, string> = {};
  for (const [clave, valor] of formData.entries()) {
    contenido[clave] = valor.toString();
  }

  await prisma.configLanding.upsert({
    where: { seccion },
    create: { seccion, contenidoJson: contenido as unknown as Prisma.InputJsonValue },
    update: { contenidoJson: contenido as unknown as Prisma.InputJsonValue },
  });

  revalidatePath("/");
  revalidatePath("/panel/config-landing");
  return { ok: true };
}

// ---------- Testimonios ----------

export async function crearTestimonio(
  _prevState: EstadoLanding,
  formData: FormData
): Promise<EstadoLanding> {
  await requerirSuperAdmin();

  const nombrePaciente = (formData.get("nombrePaciente") ?? "").toString().trim();
  const texto = (formData.get("texto") ?? "").toString().trim();
  const calificacion = Number(formData.get("calificacion")) || null;

  if (!nombrePaciente || !texto) {
    return { ok: false, mensaje: "Nombre y testimonio son obligatorios." };
  }

  await prisma.testimonio.create({
    data: { nombrePaciente, texto, calificacion },
  });

  revalidatePath("/");
  revalidatePath("/panel/config-landing/testimonios");
  return { ok: true };
}

export async function desactivarTestimonio(id: string): Promise<EstadoLanding> {
  await requerirSuperAdmin();
  await prisma.testimonio.update({ where: { id }, data: { activo: false } });
  revalidatePath("/");
  revalidatePath("/panel/config-landing/testimonios");
  return { ok: true };
}

export async function listarTestimoniosActivos() {
  return prisma.testimonio.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });
}

export async function listarTodosTestimonios() {
  return prisma.testimonio.findMany({ orderBy: { createdAt: "desc" } });
}

// ---------- Galería ----------

export async function subirImagenGaleria(
  _prevState: EstadoLanding,
  formData: FormData
): Promise<EstadoLanding> {
  await requerirSuperAdmin();

  const tipo = (formData.get("tipo") ?? "GENERAL").toString() as "GENERAL" | "ANTES_DESPUES";
  const archivoGeneral = formData.get("imagenGeneral") as File | null;
  const archivoAntes = formData.get("imagenAntes") as File | null;
  const archivoDespues = formData.get("imagenDespues") as File | null;

  await mkdir(CARPETA_GALERIA, { recursive: true });

  async function guardar(archivo: File): Promise<string> {
    const extension = path.extname(archivo.name).toLowerCase() || ".jpg";
    const nombre = `${crypto.randomUUID()}${extension}`;
    const bytes = Buffer.from(await archivo.arrayBuffer());
    await writeFile(path.join(CARPETA_GALERIA, nombre), bytes);
    return `/uploads/galeria/${nombre}`;
  }

  if (tipo === "GENERAL") {
    if (!archivoGeneral || archivoGeneral.size === 0) {
      return { ok: false, mensaje: "Selecciona una imagen." };
    }
    const ruta = await guardar(archivoGeneral);
    await prisma.galeriaImagen.create({ data: { tipo: "GENERAL", imagenAntesPath: ruta } });
  } else {
    if (!archivoAntes || !archivoDespues || archivoAntes.size === 0 || archivoDespues.size === 0) {
      return { ok: false, mensaje: "Selecciona ambas imágenes (antes y después)." };
    }
    const rutaAntes = await guardar(archivoAntes);
    const rutaDespues = await guardar(archivoDespues);
    await prisma.galeriaImagen.create({
      data: { tipo: "ANTES_DESPUES", imagenAntesPath: rutaAntes, imagenDespuesPath: rutaDespues },
    });
  }

  revalidatePath("/");
  revalidatePath("/panel/config-landing/galeria");
  return { ok: true };
}

export async function desactivarImagenGaleria(id: string): Promise<EstadoLanding> {
  await requerirSuperAdmin();
  await prisma.galeriaImagen.update({ where: { id }, data: { activo: false } });
  revalidatePath("/");
  revalidatePath("/panel/config-landing/galeria");
  return { ok: true };
}

export async function listarGaleriaActiva() {
  return prisma.galeriaImagen.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });
}

export async function listarTodaGaleria() {
  return prisma.galeriaImagen.findMany({ orderBy: { createdAt: "desc" } });
}
