"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeEditarClinico } from "@/lib/permisos";

export type EstadoHallazgoV2 = { ok: boolean; mensaje?: string };

export async function listarEstadosCatalogoV2() {
  return prisma.catalogoEstadoOdontogramaV2.findMany({
    where: { activo: true },
    orderBy: { label: "asc" },
  });
}

export async function listarHallazgosPacienteV2(pacienteId: string) {
  return prisma.odontogramaHallazgoV2.findMany({
    where: { pacienteId },
    orderBy: { fecha: "desc" },
    include: { estado: true, creadoPor: { select: { nombre: true } } },
  });
}

export async function crearHallazgoV2(
  pacienteId: string,
  datos: {
    dienteFdi: number;
    cara: string;
    estadoKey: string;
    cie10: string;
    tratamientoId: string;
    tratamientoNombre: string;
    comentario: string;
  }
): Promise<EstadoHallazgoV2> {
  const session = await getServerSession(authOptions);
  if (!session || !puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para editar el odontograma." };
  }

  const estado = await prisma.catalogoEstadoOdontogramaV2.findUnique({
    where: { key: datos.estadoKey },
  });
  if (!estado) {
    return { ok: false, mensaje: "Selecciona un estado válido." };
  }

  await prisma.odontogramaHallazgoV2.create({
    data: {
      pacienteId,
      denticion: "permanente",
      dienteFdi: datos.dienteFdi,
      cara: datos.cara,
      estadoKey: datos.estadoKey,
      estadoLabel: estado.label,
      colorHex: estado.colorHex,
      cie10Codigo: datos.cie10 || null,
      tratamientoId: datos.tratamientoId || null,
      tratamientoNombre: datos.tratamientoNombre || null,
      comentario: datos.comentario || null,
      creadoPorId: session.user.id,
    },
  });

  revalidatePath(`/panel/pacientes/${pacienteId}/odontograma-v2`);
  return { ok: true };
}

export async function eliminarHallazgoV2(
  hallazgoId: string,
  pacienteId: string
): Promise<EstadoHallazgoV2> {
  const session = await getServerSession(authOptions);
  if (!session || !puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para editar el odontograma." };
  }

  await prisma.odontogramaHallazgoV2.delete({ where: { id: hallazgoId } });

  revalidatePath(`/panel/pacientes/${pacienteId}/odontograma-v2`);
  return { ok: true };
}
