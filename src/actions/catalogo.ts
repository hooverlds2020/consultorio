"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { esSuperAdmin } from "@/lib/permisos";

export type EstadoCatalogo = { ok: boolean; mensaje?: string };

export async function crearServicio(
  _prevState: EstadoCatalogo,
  formData: FormData
): Promise<EstadoCatalogo> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "Solo el Super Admin puede editar el catálogo." };
  }

  const nombre = (formData.get("nombre") ?? "").toString().trim();
  const precioBase = Number(formData.get("precioBase"));

  if (!nombre) {
    return { ok: false, mensaje: "El nombre del servicio es obligatorio." };
  }
  if (!Number.isFinite(precioBase) || precioBase <= 0) {
    return { ok: false, mensaje: "El precio debe ser un número mayor a cero." };
  }

  await prisma.servicioCatalogo.create({
    data: { nombre, precioBase: precioBase.toFixed(2) },
  });

  revalidatePath("/panel/catalogo");
  return { ok: true };
}

export async function desactivarServicio(servicioId: string): Promise<EstadoCatalogo> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso." };
  }

  await prisma.servicioCatalogo.update({
    where: { id: servicioId },
    data: { activo: false },
  });

  revalidatePath("/panel/catalogo");
  return { ok: true };
}

export async function listarServiciosActivos() {
  return prisma.servicioCatalogo.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}
