"use server";

import { prisma } from "@/lib/prisma";
import { hoyEnZonaClinica } from "@/lib/fecha";

/** Pacientes cuyo cumpleaños cae dentro de los próximos N días (sin importar el año). */
export async function obtenerCumpleanosProximos(dias = 7) {
  const pacientes = await prisma.paciente.findMany({
    where: { eliminadoEn: null },
    select: { id: true, nombre: true, apellidos: true, fechaNacimiento: true },
  });

  const hoy = new Date(`${hoyEnZonaClinica()}T00:00:00`);
  const hoyMD = hoy.getMonth() * 100 + hoy.getDate();

  return pacientes
    .map((p) => {
      const nacimiento = new Date(p.fechaNacimiento);
      const cumpleEsteAno = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
      let diferenciaDias = Math.round(
        (cumpleEsteAno.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Si ya pasó este año, considerar el del próximo año (para diciembre→enero)
      if (diferenciaDias < 0) {
        const cumpleProximoAno = new Date(hoy.getFullYear() + 1, nacimiento.getMonth(), nacimiento.getDate());
        diferenciaDias = Math.round((cumpleProximoAno.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { ...p, diferenciaDias };
    })
    .filter((p) => p.diferenciaDias >= 0 && p.diferenciaDias <= dias)
    .sort((a, b) => a.diferenciaDias - b.diferenciaDias);
}

/** Planes de tratamiento en curso con saldo pendiente de cobro. */
export async function obtenerPlanesConSaldoPendiente() {
  const planes = await prisma.planTratamiento.findMany({
    where: { estatus: "EN_CURSO" },
    include: { paciente: { select: { id: true, nombre: true, apellidos: true } } },
  });

  return planes
    .map((p) => ({
      ...p,
      saldoPendiente: Number(p.totalPlan) - Number(p.totalPagado),
    }))
    .filter((p) => p.saldoPendiente > 0)
    .sort((a, b) => b.saldoPendiente - a.saldoPendiente);
}

export async function obtenerConteoOrdenesLabPendientes() {
  return prisma.ordenLaboratorio.count({
    where: { eliminadoEn: null, estatus: { in: ["RECIBIDO", "EN_PROCESO"] } },
  });
}

export async function obtenerInsumosStockBajo() {
  const insumos = await prisma.insumo.findMany();
  return insumos.filter((i) => Number(i.stockActual) <= Number(i.stockMinimo));
}
