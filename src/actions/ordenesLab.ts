"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeGestionarOrdenesLab, puedeEditarClinico } from "@/lib/permisos";
import { ordenLabSchema, TIPO_TRABAJO_LABEL } from "@/lib/validaciones/orden-lab.schema";
import { generarFolioRecibo } from "@/lib/validaciones/pago.schema";
import type { EstatusOrdenLab } from "@prisma/client";

export type EstadoOrdenLab = {
  ok: boolean;
  errores?: Record<string, string[]>;
  mensaje?: string;
  ordenId?: string;
};

async function requerirPermisoLab() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autenticado.");
  if (!puedeGestionarOrdenesLab(session.user.rol)) {
    throw new Error("No tienes permiso para gestionar órdenes de laboratorio.");
  }
  return session;
}

/**
 * Registra en Caja, como egreso, el anticipo que ya se le pagó al
 * laboratorio externo — solo el dinero que de verdad salió, no el costo
 * total comprometido (eso se ve aparte en el banner de deuda).
 * Se crea una sola vez por orden: si ya existe un egreso ligado a esta
 * orden, no se duplica ni se ajusta en ediciones posteriores.
 */
async function asegurarEgresoAnticipoLab(
  ordenId: string,
  pacienteId: string,
  anticipo: number,
  registradoPorId: string,
  descripcionOrden: string
) {
  if (anticipo <= 0) return;

  const yaExiste = await prisma.pago.findFirst({
    where: { ordenLaboratorioId: ordenId, tipo: "EGRESO" },
  });
  if (yaExiste) return;

  await prisma.pago.create({
    data: {
      pacienteId,
      ordenLaboratorioId: ordenId,
      registradoPorId,
      tipo: "EGRESO",
      concepto: `Anticipo a laboratorio — ${descripcionOrden}`,
      monto: anticipo.toFixed(2),
      metodo: "EFECTIVO",
      folioRecibo: generarFolioRecibo(),
    },
  });
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

  const orden = await prisma.ordenLaboratorio.create({
    data: {
      pacienteId: datos.pacienteId,
      dentistaId: session.user.id,
      tipoTrabajo: datos.tipoTrabajo,
      tonoDiente: datos.tonoDiente || null,
      material: datos.material || null,
      diente: datos.diente || null,
      notas: datos.notas || null,
      fechaEntregaEstimada: datos.fechaEntregaEstimada
        ? new Date(`${datos.fechaEntregaEstimada}T12:00:00`)
        : null,
      costoLaboratorio:
        datos.costoLaboratorio !== undefined && datos.costoLaboratorio !== ""
          ? Number(datos.costoLaboratorio).toFixed(2)
          : null,
      anticipoLaboratorio:
        datos.anticipoLaboratorio !== undefined && datos.anticipoLaboratorio !== ""
          ? Number(datos.anticipoLaboratorio).toFixed(2)
          : null,
    },
  });

  const anticipoInicial =
    datos.anticipoLaboratorio !== undefined && datos.anticipoLaboratorio !== ""
      ? Number(datos.anticipoLaboratorio)
      : 0;
  if (anticipoInicial > 0) {
    await asegurarEgresoAnticipoLab(
      orden.id,
      datos.pacienteId,
      anticipoInicial,
      session.user.id,
      TIPO_TRABAJO_LABEL[datos.tipoTrabajo]
    );
  }

  revalidatePath("/panel/lab/ordenes");
  revalidatePath("/panel/caja");
  return { ok: true, ordenId: orden.id };
}

/** Edición completa desde el modal de detalle (todo lo que NO es el estatus, que se mueve con drag&drop). */
export async function actualizarOrdenLab(
  ordenId: string,
  datos: {
    tecnicoAsignadoId: string | null;
    tonoDiente: string;
    material: string;
    notas: string;
    fechaEntregaEstimada: string;
    costoLaboratorio: string;
    anticipoLaboratorio: string;
  }
): Promise<EstadoOrdenLab> {
  const session = await requerirPermisoLab();
  if (!puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para editar esta orden." };
  }

  if (!datos.fechaEntregaEstimada) {
    return { ok: false, mensaje: "Define fecha promesa para control de retrasos" };
  }

  const ordenActualizada = await prisma.ordenLaboratorio.update({
    where: { id: ordenId },
    data: {
      tecnicoAsignadoId: datos.tecnicoAsignadoId || null,
      tonoDiente: datos.tonoDiente || null,
      material: datos.material || null,
      notas: datos.notas || null,
      fechaEntregaEstimada: datos.fechaEntregaEstimada
        ? new Date(`${datos.fechaEntregaEstimada}T12:00:00`)
        : null,
      costoLaboratorio: datos.costoLaboratorio ? Number(datos.costoLaboratorio).toFixed(2) : null,
      anticipoLaboratorio: datos.anticipoLaboratorio
        ? Number(datos.anticipoLaboratorio).toFixed(2)
        : null,
    },
  });

  const anticipoActual = datos.anticipoLaboratorio ? Number(datos.anticipoLaboratorio) : 0;
  if (anticipoActual > 0) {
    await asegurarEgresoAnticipoLab(
      ordenId,
      ordenActualizada.pacienteId,
      anticipoActual,
      session.user.id,
      TIPO_TRABAJO_LABEL[ordenActualizada.tipoTrabajo]
    );
  }

  revalidatePath("/panel/lab/ordenes");
  revalidatePath("/panel/caja");
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

/** Responde "¿cuánto le debo al laboratorio externo hoy?" — suma de costo
 * menos anticipo en todas las órdenes que todavía no se entregan. */
export async function obtenerResumenDeudaLaboratorio() {
  const ordenes = await prisma.ordenLaboratorio.findMany({
    where: { eliminadoEn: null, estatus: { not: "ENTREGADO" }, costoLaboratorio: { not: null } },
    select: { costoLaboratorio: true, anticipoLaboratorio: true },
  });

  const total = ordenes.reduce((suma, o) => {
    const costo = Number(o.costoLaboratorio ?? 0);
    const anticipo = Number(o.anticipoLaboratorio ?? 0);
    return suma + Math.max(0, costo - anticipo);
  }, 0);

  return { totalAdeudado: total, cantidadOrdenes: ordenes.length };
}
