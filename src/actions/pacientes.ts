"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeGestionarPacientes, esSuperAdmin } from "@/lib/permisos";
import { pacienteSchema } from "@/lib/validaciones/paciente.schema";

async function requerirPermisoPacientes() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("No autenticado.");
  }
  if (!puedeGestionarPacientes(session.user.rol)) {
    throw new Error("No tienes permiso para gestionar pacientes.");
  }
  return session;
}

export type EstadoFormulario = {
  ok: boolean;
  errores?: Record<string, string[]>;
  mensaje?: string;
};

function limpiarOpcional(valor: FormDataEntryValue | null): string | null {
  const texto = (valor ?? "").toString().trim();
  return texto === "" ? null : texto;
}

export async function crearPaciente(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  await requerirPermisoPacientes();

  const datosCrudos = Object.fromEntries(formData.entries());
  const parseo = pacienteSchema.safeParse(datosCrudos);

  if (!parseo.success) {
    return { ok: false, errores: parseo.error.flatten().fieldErrors };
  }

  const datos = parseo.data;

  await prisma.paciente.create({
    data: {
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      fechaNacimiento: new Date(datos.fechaNacimiento),
      telefono: limpiarOpcional(datos.telefono ?? null),
      whatsapp: limpiarOpcional(datos.whatsapp ?? null),
      direccion: limpiarOpcional(datos.direccion ?? null),
      alergias: limpiarOpcional(datos.alergias ?? null),
      enfermedadesSistemicas: limpiarOpcional(datos.enfermedadesSistemicas ?? null),
      medicamentosActuales: limpiarOpcional(datos.medicamentosActuales ?? null),
      contactoEmergenciaNombre: limpiarOpcional(datos.contactoEmergenciaNombre ?? null),
      contactoEmergenciaTelefono: limpiarOpcional(datos.contactoEmergenciaTelefono ?? null),
    },
  });

  revalidatePath("/panel/pacientes");
  return { ok: true };
}

export async function actualizarPaciente(
  pacienteId: string,
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  await requerirPermisoPacientes();

  const datosCrudos = Object.fromEntries(formData.entries());
  const parseo = pacienteSchema.safeParse(datosCrudos);

  if (!parseo.success) {
    return { ok: false, errores: parseo.error.flatten().fieldErrors };
  }

  const datos = parseo.data;

  const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
  if (!paciente || paciente.eliminadoEn) {
    return { ok: false, mensaje: "El paciente no existe o fue eliminado." };
  }

  await prisma.paciente.update({
    where: { id: pacienteId },
    data: {
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      fechaNacimiento: new Date(datos.fechaNacimiento),
      telefono: limpiarOpcional(datos.telefono ?? null),
      whatsapp: limpiarOpcional(datos.whatsapp ?? null),
      direccion: limpiarOpcional(datos.direccion ?? null),
      alergias: limpiarOpcional(datos.alergias ?? null),
      enfermedadesSistemicas: limpiarOpcional(datos.enfermedadesSistemicas ?? null),
      medicamentosActuales: limpiarOpcional(datos.medicamentosActuales ?? null),
      contactoEmergenciaNombre: limpiarOpcional(datos.contactoEmergenciaNombre ?? null),
      contactoEmergenciaTelefono: limpiarOpcional(datos.contactoEmergenciaTelefono ?? null),
    },
  });

  revalidatePath("/panel/pacientes");
  revalidatePath(`/panel/pacientes/${pacienteId}`);
  return { ok: true };
}

/** Borrado suave — solo Super Admin. Nunca elimina la fila físicamente. */
export async function eliminarPaciente(pacienteId: string): Promise<EstadoFormulario> {
  const session = await requerirPermisoPacientes();

  if (!esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "Solo el Super Admin puede eliminar pacientes." };
  }

  await prisma.paciente.update({
    where: { id: pacienteId },
    data: { eliminadoEn: new Date() },
  });

  revalidatePath("/panel/pacientes");
  return { ok: true };
}

export async function buscarPacientes(query: string) {
  await requerirPermisoPacientes();

  const texto = query.trim();

  if (!texto) {
    return prisma.paciente.findMany({
      where: { eliminadoEn: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  return prisma.paciente.findMany({
    where: {
      eliminadoEn: null,
      OR: [
        { nombre: { contains: texto, mode: "insensitive" } },
        { apellidos: { contains: texto, mode: "insensitive" } },
        { telefono: { contains: texto, mode: "insensitive" } },
        { whatsapp: { contains: texto, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
