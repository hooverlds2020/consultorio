"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { esSuperAdmin } from "@/lib/permisos";

export type EstadoMarca = { ok: boolean; mensaje?: string };

const CARPETA_MARCA = path.join(process.cwd(), "public", "uploads", "marca");

/** Sin sesión requerida a propósito — el login necesita leer el logo antes de que alguien inicie sesión. */
export async function obtenerLogoNegocio(): Promise<string | null> {
  const config = await prisma.configuracionMarca.findFirst();
  return config?.logoUrl ?? null;
}

export async function guardarLogoNegocio(
  _prevState: EstadoMarca,
  formData: FormData
): Promise<EstadoMarca> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "Solo el Super Admin puede cambiar el logo." };
  }

  const archivo = formData.get("logo") as File | null;
  if (!archivo || archivo.size === 0) {
    return { ok: false, mensaje: "Selecciona una imagen." };
  }

  await mkdir(CARPETA_MARCA, { recursive: true });
  const extension = path.extname(archivo.name).toLowerCase() || ".png";
  const nombreArchivo = `${crypto.randomUUID()}${extension}`;
  const bytes = Buffer.from(await archivo.arrayBuffer());
  await writeFile(path.join(CARPETA_MARCA, nombreArchivo), bytes);

  const logoUrl = `/uploads/marca/${nombreArchivo}`;
  const existente = await prisma.configuracionMarca.findFirst();

  if (existente) {
    await prisma.configuracionMarca.update({ where: { id: existente.id }, data: { logoUrl } });
  } else {
    await prisma.configuracionMarca.create({ data: { logoUrl } });
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
