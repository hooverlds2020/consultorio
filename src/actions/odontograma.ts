"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeEditarClinico } from "@/lib/permisos";
import type { DientesJson } from "@/lib/odontograma";
import type { Prisma } from "@prisma/client";

export async function guardarOdontograma(
  pacienteId: string,
  tipo: "ADULTO_32" | "INFANTIL_20",
  dientes: DientesJson
): Promise<{ ok: boolean; mensaje?: string }> {
  const session = await getServerSession(authOptions);

  if (!session || !puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para editar el odontograma." };
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
  if (!paciente || paciente.eliminadoEn) {
    return { ok: false, mensaje: "El paciente no existe." };
  }

  await prisma.odontograma.create({
    data: {
      pacienteId,
      dentistaId: session.user.id,
      tipo,
      dientesJson: dientes as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/panel/pacientes/${pacienteId}/odontograma`);
  return { ok: true };
}

export async function obtenerHistorialOdontogramas(pacienteId: string) {
  return prisma.odontograma.findMany({
    where: { pacienteId, eliminadoEn: null },
    orderBy: { fecha: "desc" },
    include: { dentista: { select: { nombre: true } } },
  });
}
