"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { esSuperAdmin, puedeRegistrarMovimientoInventario } from "@/lib/permisos";
import { insumoSchema, movimientoSchema } from "@/lib/validaciones/insumo.schema";

export type EstadoInventario = { ok: boolean; errores?: Record<string, string[]>; mensaje?: string };

export async function crearInsumo(
  _prevState: EstadoInventario,
  formData: FormData
): Promise<EstadoInventario> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "Solo el Super Admin puede agregar insumos." };
  }

  const datosCrudos = Object.fromEntries(formData.entries());
  const parseo = insumoSchema.safeParse(datosCrudos);

  if (!parseo.success) {
    return { ok: false, errores: parseo.error.flatten().fieldErrors };
  }

  const datos = parseo.data;

  const insumo = await prisma.insumo.create({
    data: {
      nombre: datos.nombre,
      unidadMedida: datos.unidadMedida,
      stockActual: datos.stockInicial.toFixed(2),
      stockMinimo: datos.stockMinimo.toFixed(2),
    },
  });

  if (datos.stockInicial > 0) {
    await prisma.movimientoInventario.create({
      data: {
        insumoId: insumo.id,
        tipo: "ENTRADA",
        cantidad: datos.stockInicial.toFixed(2),
        registradoPorId: session.user.id,
        motivo: "Stock inicial al dar de alta el insumo",
      },
    });
  }

  revalidatePath("/panel/inventario");
  return { ok: true };
}

export async function registrarMovimiento(
  insumoId: string,
  _prevState: EstadoInventario,
  formData: FormData
): Promise<EstadoInventario> {
  const session = await getServerSession(authOptions);
  if (!session || !puedeRegistrarMovimientoInventario(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para registrar movimientos." };
  }

  const datosCrudos = Object.fromEntries(formData.entries());
  const parseo = movimientoSchema.safeParse(datosCrudos);

  if (!parseo.success) {
    return { ok: false, errores: parseo.error.flatten().fieldErrors };
  }

  const datos = parseo.data;

  const insumo = await prisma.insumo.findUnique({ where: { id: insumoId } });
  if (!insumo) {
    return { ok: false, mensaje: "Insumo no encontrado." };
  }

  const nuevoStock =
    datos.tipo === "ENTRADA"
      ? Number(insumo.stockActual) + datos.cantidad
      : Number(insumo.stockActual) - datos.cantidad;

  if (nuevoStock < 0) {
    return { ok: false, mensaje: "No hay suficiente stock para esa salida." };
  }

  await prisma.$transaction([
    prisma.movimientoInventario.create({
      data: {
        insumoId,
        tipo: datos.tipo,
        cantidad: datos.cantidad.toFixed(2),
        registradoPorId: session.user.id,
        motivo: datos.motivo || null,
      },
    }),
    prisma.insumo.update({
      where: { id: insumoId },
      data: { stockActual: nuevoStock.toFixed(2) },
    }),
  ]);

  revalidatePath("/panel/inventario");
  return { ok: true };
}

export async function listarInsumos() {
  return prisma.insumo.findMany({ orderBy: { nombre: "asc" } });
}

export async function obtenerInsumoConMovimientos(insumoId: string) {
  return prisma.insumo.findUnique({
    where: { id: insumoId },
    include: {
      movimientos: {
        orderBy: { fecha: "desc" },
        include: { registradoPor: { select: { nombre: true } } },
      },
    },
  });
}
