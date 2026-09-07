"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeGestionarCotizaciones } from "@/lib/permisos";

export type EstadoCotizacion = { ok: boolean; mensaje?: string; cotizacionId?: string };

type ItemCotizacion = { servicioId: string; cantidad: number };

async function requerirPermiso() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autenticado.");
  if (!puedeGestionarCotizaciones(session.user.rol)) {
    throw new Error("No tienes permiso para gestionar cotizaciones.");
  }
  return session;
}

export async function crearCotizacion(
  pacienteId: string,
  items: ItemCotizacion[]
): Promise<EstadoCotizacion> {
  const session = await requerirPermiso();

  if (items.length === 0) {
    return { ok: false, mensaje: "Agrega al menos un servicio." };
  }

  const servicios = await prisma.servicioCatalogo.findMany({
    where: { id: { in: items.map((i) => i.servicioId) } },
  });

  const mapaServicios = new Map(servicios.map((s) => [s.id, s]));

  let total = 0;
  const dataItems = items.map((item) => {
    const servicio = mapaServicios.get(item.servicioId);
    if (!servicio) throw new Error("Servicio no encontrado.");
    const precioUnitario = Number(servicio.precioBase);
    const subtotal = precioUnitario * item.cantidad;
    total += subtotal;
    return {
      servicioId: item.servicioId,
      cantidad: item.cantidad,
      precioUnitario: precioUnitario.toFixed(2),
      subtotal: subtotal.toFixed(2),
    };
  });

  const cotizacion = await prisma.cotizacion.create({
    data: {
      pacienteId,
      creadaPorId: session.user.id,
      total: total.toFixed(2),
      items: { create: dataItems },
    },
  });

  revalidatePath(`/panel/pacientes/${pacienteId}/cotizaciones`);
  return { ok: true, cotizacionId: cotizacion.id };
}

export async function aceptarCotizacion(cotizacionId: string): Promise<EstadoCotizacion> {
  await requerirPermiso();

  const cotizacion = await prisma.cotizacion.findUnique({ where: { id: cotizacionId } });
  if (!cotizacion) {
    return { ok: false, mensaje: "Cotización no encontrada." };
  }
  if (cotizacion.estatus !== "PENDIENTE") {
    return { ok: false, mensaje: "Esta cotización ya fue procesada." };
  }

  await prisma.$transaction([
    prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: { estatus: "ACEPTADA" },
    }),
    prisma.planTratamiento.create({
      data: {
        cotizacionId,
        pacienteId: cotizacion.pacienteId,
        totalPlan: cotizacion.total,
      },
    }),
  ]);

  revalidatePath(`/panel/pacientes/${cotizacion.pacienteId}/cotizaciones`);
  return { ok: true };
}

export async function rechazarCotizacion(cotizacionId: string): Promise<EstadoCotizacion> {
  await requerirPermiso();

  const cotizacion = await prisma.cotizacion.update({
    where: { id: cotizacionId },
    data: { estatus: "RECHAZADA" },
  });

  revalidatePath(`/panel/pacientes/${cotizacion.pacienteId}/cotizaciones`);
  return { ok: true };
}

export async function obtenerCotizacion(cotizacionId: string) {
  return prisma.cotizacion.findUnique({
    where: { id: cotizacionId },
    include: {
      paciente: true,
      creadaPor: { select: { nombre: true } },
      items: { include: { servicio: true } },
      planTratamiento: true,
    },
  });
}

export async function listarCotizacionesPaciente(pacienteId: string) {
  return prisma.cotizacion.findMany({
    where: { pacienteId },
    orderBy: { fecha: "desc" },
    include: { items: true },
  });
}
