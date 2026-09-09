"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeGestionarAgenda } from "@/lib/permisos";
import { citaSchema } from "@/lib/validaciones/cita.schema";
import { diaSemanaDeFecha, horaTextoADecimal } from "@/lib/horarioServicio";
import { obtenerHorarioServicio } from "@/actions/horarioServicio";
import type { EstatusCita } from "@prisma/client";

export type EstadoCita = { ok: boolean; errores?: Record<string, string[]>; mensaje?: string };

async function requerirPermisoAgenda() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autenticado.");
  if (!puedeGestionarAgenda(session.user.rol)) {
    throw new Error("No tienes permiso para gestionar la agenda.");
  }
  return session;
}

function combinarFechaHora(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora}:00`);
}

export async function crearCita(
  _prevState: EstadoCita,
  formData: FormData
): Promise<EstadoCita> {
  await requerirPermisoAgenda();

  const datosCrudos = Object.fromEntries(formData.entries());
  const parseo = citaSchema.safeParse(datosCrudos);

  if (!parseo.success) {
    return { ok: false, errores: parseo.error.flatten().fieldErrors };
  }

  const datos = parseo.data;
  const horaInicio = combinarFechaHora(datos.fecha, datos.horaInicio);
  const horaFin = combinarFechaHora(datos.fecha, datos.horaFin);

  if (horaFin <= horaInicio) {
    return { ok: false, mensaje: "La hora de fin debe ser después de la hora de inicio." };
  }

  // No permitir agendar en días cerrados o fuera del horario de atención
  // configurado en Configuración → Horario de atención.
  const horarios = await obtenerHorarioServicio();
  const diaSemana = diaSemanaDeFecha(datos.fecha);
  const horarioDia = horarios[diaSemana];

  if (!horarioDia.activo) {
    return { ok: false, mensaje: `La clínica no atiende ese día (${diaSemana}).` };
  }

  const horaInicioSolicitada = horaTextoADecimal(datos.horaInicio);
  const horaFinSolicitada = horaTextoADecimal(datos.horaFin);
  const aperturaDecimal = horaTextoADecimal(horarioDia.apertura);
  const cierreDecimal = horaTextoADecimal(horarioDia.cierre);

  if (horaInicioSolicitada < aperturaDecimal || horaFinSolicitada > cierreDecimal) {
    return {
      ok: false,
      mensaje: `Ese horario está fuera del horario de atención (${horarioDia.apertura} - ${horarioDia.cierre}).`,
    };
  }

  const fechaInicioDia = new Date(`${datos.fecha}T00:00:00`);
  const fechaFinDia = new Date(`${datos.fecha}T23:59:59`);

  // Choque por sillón: mismo sillón, mismo día, rango de horas que se traslapa
  const choqueSillon = await prisma.cita.findFirst({
    where: {
      sillon: datos.sillon,
      fecha: { gte: fechaInicioDia, lte: fechaFinDia },
      estatus: { notIn: ["CANCELADA", "NO_ASISTIO"] },
      horaInicio: { lt: horaFin },
      horaFin: { gt: horaInicio },
    },
  });

  if (choqueSillon) {
    return { ok: false, mensaje: `El sillón ${datos.sillon} ya tiene una cita en ese horario.` };
  }

  // Choque por dentista: mismo dentista no puede estar en dos citas a la vez
  const choqueDentista = await prisma.cita.findFirst({
    where: {
      dentistaId: datos.dentistaId,
      fecha: { gte: fechaInicioDia, lte: fechaFinDia },
      estatus: { notIn: ["CANCELADA", "NO_ASISTIO"] },
      horaInicio: { lt: horaFin },
      horaFin: { gt: horaInicio },
    },
  });

  if (choqueDentista) {
    return { ok: false, mensaje: "Este dentista ya tiene otra cita en ese horario." };
  }

  await prisma.cita.create({
    data: {
      pacienteId: datos.pacienteId,
      dentistaId: datos.dentistaId,
      sillon: datos.sillon,
      fecha: fechaInicioDia,
      horaInicio,
      horaFin,
      tipoTratamiento: datos.tipoTratamiento,
      notas: datos.notas || null,
    },
  });

  revalidatePath("/panel/agenda");
  return { ok: true };
}

export async function cambiarEstatusCita(
  citaId: string,
  nuevoEstatus: EstatusCita
): Promise<EstadoCita> {
  await requerirPermisoAgenda();

  await prisma.cita.update({
    where: { id: citaId },
    data: { estatus: nuevoEstatus },
  });

  revalidatePath("/panel/agenda");
  return { ok: true };
}

export async function obtenerCitasDelDia(fecha: string) {
  const inicio = new Date(`${fecha}T00:00:00`);
  const fin = new Date(`${fecha}T23:59:59`);

  return prisma.cita.findMany({
    where: { fecha: { gte: inicio, lte: fin } },
    orderBy: { horaInicio: "asc" },
    include: {
      paciente: { select: { id: true, nombre: true, apellidos: true, whatsapp: true } },
      dentista: { select: { id: true, nombre: true } },
    },
  });
}

export async function obtenerDentistas() {
  return prisma.usuario.findMany({
    where: { rol: "DENTISTA", activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}

export async function buscarPacientesParaCita(query: string) {
  const texto = query.trim();
  if (!texto) return [];

  return prisma.paciente.findMany({
    where: {
      eliminadoEn: null,
      OR: [
        { nombre: { contains: texto, mode: "insensitive" } },
        { apellidos: { contains: texto, mode: "insensitive" } },
      ],
    },
    select: { id: true, nombre: true, apellidos: true },
    take: 10,
  });
}
