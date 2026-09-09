"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeGestionarPagos, puedeVerFinanzas } from "@/lib/permisos";
import { pagoSchema, generarFolioRecibo } from "@/lib/validaciones/pago.schema";

export type EstadoPago = { ok: boolean; errores?: Record<string, string[]>; mensaje?: string };

async function requerirPermisoPagos() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autenticado.");
  if (!puedeGestionarPagos(session.user.rol)) {
    throw new Error("No tienes permiso para registrar pagos.");
  }
  return session;
}

export async function registrarPago(
  pacienteId: string,
  _prevState: EstadoPago,
  formData: FormData
): Promise<EstadoPago> {
  const session = await requerirPermisoPagos();

  const datosCrudos = Object.fromEntries(formData.entries());
  const parseo = pagoSchema.safeParse(datosCrudos);

  if (!parseo.success) {
    return { ok: false, errores: parseo.error.flatten().fieldErrors };
  }

  const datos = parseo.data;
  const planTratamientoId = datos.planTratamientoId || null;

  await prisma.$transaction(async (tx) => {
    await tx.pago.create({
      data: {
        pacienteId,
        planTratamientoId,
        registradoPorId: session.user.id,
        monto: datos.monto.toFixed(2),
        metodo: datos.metodo,
        folioRecibo: generarFolioRecibo(),
      },
    });

    if (planTratamientoId) {
      const plan = await tx.planTratamiento.findUnique({ where: { id: planTratamientoId } });
      if (plan) {
        const nuevoTotalPagado = Number(plan.totalPagado) + datos.monto;
        await tx.planTratamiento.update({
          where: { id: planTratamientoId },
          data: {
            totalPagado: nuevoTotalPagado.toFixed(2),
            estatus: nuevoTotalPagado >= Number(plan.totalPlan) ? "COMPLETADO" : "EN_CURSO",
          },
        });
      }
    }
  });

  revalidatePath(`/panel/pacientes/${pacienteId}/pagos`);
  return { ok: true };
}

export async function listarPagosPaciente(pacienteId: string) {
  return prisma.pago.findMany({
    where: { pacienteId, eliminadoEn: null },
    orderBy: { fecha: "desc" },
    include: {
      paciente: { select: { nombre: true, apellidos: true } },
      registradoPor: { select: { nombre: true } },
      planTratamiento: { select: { totalPlan: true, totalPagado: true, estatus: true } },
    },
  });
}

export async function listarPlanesActivosPaciente(pacienteId: string) {
  return prisma.planTratamiento.findMany({
    where: { pacienteId, estatus: "EN_CURSO" },
    select: { id: true, totalPlan: true, totalPagado: true },
  });
}

export async function obtenerReporteCaja(desde: string, hasta: string) {
  const session = await getServerSession(authOptions);
  if (!session || !puedeVerFinanzas(session.user.rol)) {
    throw new Error("No tienes permiso para ver reportes financieros.");
  }

  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T23:59:59`);

  const pagos = await prisma.pago.findMany({
    where: { fecha: { gte: inicio, lte: fin }, eliminadoEn: null },
    include: {
      planTratamiento: {
        include: {
          cotizacion: { include: { creadaPor: { select: { nombre: true } } } },
        },
      },
    },
  });

  const totalGeneral = pagos.reduce((suma, p) => suma + Number(p.monto), 0);

  const porMetodo: Record<string, number> = { EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0 };
  for (const p of pagos) {
    porMetodo[p.metodo] += Number(p.monto);
  }

  const porAtendidoPor = new Map<string, number>();
  for (const p of pagos) {
    const nombre = p.planTratamiento?.cotizacion.creadaPor.nombre ?? "Pago directo (sin plan)";
    porAtendidoPor.set(nombre, (porAtendidoPor.get(nombre) ?? 0) + Number(p.monto));
  }

  return {
    totalGeneral,
    porMetodo,
    porAtendidoPor: Array.from(porAtendidoPor.entries()).map(([nombre, total]) => ({
      nombre,
      total,
    })),
    cantidadPagos: pagos.length,
  };
}
