"use server";

import { prisma } from "@/lib/prisma";
import { ESTATUS_CITA_LABEL } from "@/lib/validaciones/cita.schema";
import { METODO_PAGO_LABEL } from "@/lib/validaciones/pago.schema";

export type EventoTimeline = {
  fecha: Date;
  tipo: "cita" | "cotizacion" | "pago" | "consentimiento" | "historial";
  titulo: string;
  detalle: string;
  href?: string;
};

/**
 * Junta en una sola línea de tiempo, ordenada por fecha, todo lo que le ha
 * pasado a un paciente: citas, cotizaciones, pagos, consentimientos e
 * historial clínico. Es una sola pantalla en vez de 5 menús distintos.
 */
export async function obtenerTimelinePaciente(pacienteId: string): Promise<EventoTimeline[]> {
  const [citas, cotizaciones, pagos, consentimientos, historial] = await Promise.all([
    prisma.cita.findMany({
      where: { pacienteId },
      orderBy: { fecha: "desc" },
      take: 15,
      include: { dentista: { select: { nombre: true } } },
    }),
    prisma.cotizacion.findMany({
      where: { pacienteId },
      orderBy: { fecha: "desc" },
      take: 15,
    }),
    prisma.pago.findMany({
      where: { pacienteId, eliminadoEn: null },
      orderBy: { fecha: "desc" },
      take: 15,
    }),
    prisma.consentimiento.findMany({
      where: { pacienteId, eliminadoEn: null },
      orderBy: { fechaFirma: "desc" },
      take: 15,
    }),
    prisma.historialClinico.findMany({
      where: { pacienteId, eliminadoEn: null },
      orderBy: { fecha: "desc" },
      take: 15,
      include: { dentista: { select: { nombre: true } } },
    }),
  ]);

  const eventos: EventoTimeline[] = [
    ...citas.map((c) => ({
      fecha: c.fecha,
      tipo: "cita" as const,
      titulo: `Cita — ${c.tipoTratamiento}`,
      detalle: `Dr(a). ${c.dentista.nombre} · ${ESTATUS_CITA_LABEL[c.estatus]}`,
      href: `/panel/agenda`,
    })),
    ...cotizaciones.map((c) => ({
      fecha: c.fecha,
      tipo: "cotizacion" as const,
      titulo: `Cotización — $${Number(c.total).toLocaleString("es-MX")}`,
      detalle:
        c.estatus === "ACEPTADA" ? "Aceptada" : c.estatus === "RECHAZADA" ? "Rechazada" : "Pendiente",
      href: `/panel/pacientes/${pacienteId}/cotizaciones/${c.id}`,
    })),
    ...pagos.map((p) => ({
      fecha: p.fecha,
      tipo: "pago" as const,
      titulo: `Pago — $${Number(p.monto).toLocaleString("es-MX")}`,
      detalle: `${METODO_PAGO_LABEL[p.metodo]} · Folio ${p.folioRecibo}`,
      href: `/panel/pacientes/${pacienteId}/pagos`,
    })),
    ...consentimientos
      .filter((c) => c.fechaFirma !== null)
      .map((c) => ({
        fecha: c.fechaFirma as Date,
        tipo: "consentimiento" as const,
        titulo: `Consentimiento firmado — ${c.tipoTratamiento}`,
        detalle: "Firma digital registrada",
        href: `/panel/pacientes/${pacienteId}/consentimientos`,
      })),
    ...historial.map((h) => ({
      fecha: h.fecha,
      tipo: "historial" as const,
      titulo: `Consulta — Dr(a). ${h.dentista.nombre}`,
      detalle: h.notas.length > 80 ? `${h.notas.slice(0, 80)}...` : h.notas,
      href: `/panel/pacientes/${pacienteId}/historial`,
    })),
  ];

  return eventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 20);
}
