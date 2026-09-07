"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeGestionarOrdenesLab, puedeEditarClinico } from "@/lib/permisos";
import { ordenLabSchema } from "@/lib/validaciones/orden-lab.schema";
import type { EstatusOrdenLab } from "@prisma/client";

export type EstadoOrdenLab = { ok: boolean; errores?: Record<string, string[]>; mensaje?: string };

async function requerirPermisoLab() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autenticado.");
  if (!puedeGestionarOrdenesLab(session.user.rol)) {
    throw new Error("No tienes permiso para gestionar órdenes de laboratorio.");
  }
  return session;
}

export async function crearOrdenLab(
  _prevState: EstadoOrdenLab,
  formData: FormData
): Promise<EstadoOrdenLab> {
  const session = await requerirPermisoLab();

  if (!puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "Solo un dentista o el Super Admin puede crear órdenes." };
  }

  const datosCrudos = Object.fromEntries(formData.entries());
  const parseo = ordenLabSchema.safeParse(datosCrudos);

  if (!parseo.success) {
    return { ok: false, errores: parseo.error.flatten().fieldErrors };
  }

  const datos = parseo.data;

  await prisma.ordenLaboratorio.create({
    data: {
      pacienteId: datos.pacienteId,
      dentistaId: session.user.id,
      tipoTrabajo: datos.tipoTrabajo,
      tonoDiente: datos.tonoDiente || null,
      material: datos.material || null,
      diente: datos.diente || null,
      notas: datos.notas || null,
    },
  });

  revalidatePath("/panel/lab/ordenes");
  return { ok: true };
}

export async function cambiarEstatusOrdenLab(
  ordenId: string,
  nuevoEstatus: EstatusOrdenLab
): Promise<EstadoOrdenLab> {
  await requerirPermisoLab();

  const data: { estatus: EstatusOrdenLab; fechaEntregaReal?: Date } = { estatus: nuevoEstatus };
  if (nuevoEstatus === "ENTREGADO") {
    data.fechaEntregaReal = new Date();
  }

  await prisma.ordenLaboratorio.update({
    where: { id: ordenId },
    data,
  });

  revalidatePath("/panel/lab/ordenes");
  return { ok: true };
}

export async function asignarTecnico(ordenId: string, tecnicoId: string): Promise<EstadoOrdenLab> {
  const session = await requerirPermisoLab();

  if (!puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para asignar técnico." };
  }

  await prisma.ordenLaboratorio.update({
    where: { id: ordenId },
    data: { tecnicoAsignadoId: tecnicoId || null },
  });

  revalidatePath("/panel/lab/ordenes");
  return { ok: true };
}

export async function listarOrdenesLab() {
  return prisma.ordenLaboratorio.findMany({
    where: { eliminadoEn: null },
    orderBy: { fechaSolicitud: "desc" },
    include: {
      paciente: { select: { nombre: true, apellidos: true } },
      dentista: { select: { nombre: true } },
      tecnicoAsignado: { select: { id: true, nombre: true } },
    },
  });
}

export async function listarTecnicosLab() {
  return prisma.usuario.findMany({
    where: { rol: "TECNICO_LAB", activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}

export async function buscarPacientesParaOrden(query: string) {
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
