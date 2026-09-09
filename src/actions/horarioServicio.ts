"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { esSuperAdmin } from "@/lib/permisos";
import { DIAS_SEMANA, HORARIO_POR_DEFECTO, type HorariosSemana } from "@/lib/horarioServicio";

export type EstadoHorario = { ok: boolean; mensaje?: string };

export async function obtenerHorarioServicio(): Promise<HorariosSemana> {
  const registro = await prisma.horarioServicio.findFirst();
  if (!registro) return HORARIO_POR_DEFECTO;
  return { ...HORARIO_POR_DEFECTO, ...(registro.horariosJson as Partial<HorariosSemana>) };
}

export async function guardarHorarioServicio(
  _prevState: EstadoHorario,
  formData: FormData
): Promise<EstadoHorario> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "Solo el Super Admin puede editar el horario de atención." };
  }

  const horarios: HorariosSemana = {} as HorariosSemana;

  for (const dia of DIAS_SEMANA) {
    const activo = formData.get(`${dia}_activo`) === "on";
    const apertura = (formData.get(`${dia}_apertura`) ?? "09:00").toString();
    const cierre = (formData.get(`${dia}_cierre`) ?? "18:00").toString();
    const comidaInicio = (formData.get(`${dia}_comidaInicio`) ?? "").toString();
    const comidaFin = (formData.get(`${dia}_comidaFin`) ?? "").toString();

    if (activo && apertura >= cierre) {
      return { ok: false, mensaje: `${dia}: la hora de cierre debe ser después de la apertura.` };
    }

    horarios[dia] = {
      activo,
      apertura,
      cierre,
      ...(comidaInicio && comidaFin ? { comidaInicio, comidaFin } : {}),
    };
  }

  const existente = await prisma.horarioServicio.findFirst();
  if (existente) {
    await prisma.horarioServicio.update({
      where: { id: existente.id },
      data: { horariosJson: horarios },
    });
  } else {
    await prisma.horarioServicio.create({ data: { horariosJson: horarios } });
  }

  revalidatePath("/panel/configuracion/horarios");
  revalidatePath("/panel/agenda");
  return { ok: true };
}
