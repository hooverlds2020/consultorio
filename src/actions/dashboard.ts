"use server";

import { prisma } from "@/lib/prisma";
import { hoyEnZonaClinica } from "@/lib/fecha";

/** Pacientes cuyo cumpleaños cae dentro de los próximos N días (sin importar el año). */
export async function obtenerCumpleanosProximos(dias = 7) {
  const pacientes = await prisma.paciente.findMany({
    where: { eliminadoEn: null },
    select: { id: true, nombre: true, apellidos: true, fechaNacimiento: true, whatsapp: true },
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

/**
 * Resumen financiero del dashboard: ingresos de hoy/mes, saldo por cobrar,
 * ticket promedio, y la serie de ingresos de los últimos 7 días para la
 * gráfica. Todo calculado sobre pagos reales (tabla Pago), no simulado.
 */
export async function obtenerResumenFinanciero() {
  const hoyISO = hoyEnZonaClinica();
  const hoy = new Date(`${hoyISO}T00:00:00`);
  const inicioHoy = new Date(`${hoyISO}T00:00:00`);
  const finHoy = new Date(`${hoyISO}T23:59:59`);

  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicio7dias = new Date(hoy);
  inicio7dias.setDate(inicio7dias.getDate() - 6); // incluye hoy = 7 días

  const [pagosHoy, pagosMes, pagos7dias, planesConSaldo] = await Promise.all([
    prisma.pago.findMany({
      where: { fecha: { gte: inicioHoy, lte: finHoy }, eliminadoEn: null },
      select: { monto: true },
    }),
    prisma.pago.findMany({
      where: { fecha: { gte: inicioMes, lte: finHoy }, eliminadoEn: null },
      select: { monto: true },
    }),
    prisma.pago.findMany({
      where: { fecha: { gte: inicio7dias, lte: finHoy }, eliminadoEn: null },
      select: { monto: true, fecha: true },
    }),
    obtenerPlanesConSaldoPendiente(),
  ]);

  const ingresosHoy = pagosHoy.reduce((suma, p) => suma + Number(p.monto), 0);
  const ingresosMes = pagosMes.reduce((suma, p) => suma + Number(p.monto), 0);
  const porCobrar = planesConSaldo.reduce((suma, p) => suma + p.saldoPendiente, 0);
  const ticketPromedio = pagosMes.length > 0 ? ingresosMes / pagosMes.length : 0;

  // Serie de 7 días para la gráfica, en orden cronológico, con $0 en los días sin pagos.
  const serie7dias: { fecha: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dia = new Date(hoy);
    dia.setDate(dia.getDate() - i);
    const diaISO = dia.toLocaleDateString("en-CA");
    const totalDia = pagos7dias
      .filter((p) => new Date(p.fecha).toLocaleDateString("en-CA") === diaISO)
      .reduce((suma, p) => suma + Number(p.monto), 0);
    serie7dias.push({
      fecha: dia.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
      total: totalDia,
    });
  }

  return { ingresosHoy, ingresosMes, porCobrar, ticketPromedio, serie7dias };
}
