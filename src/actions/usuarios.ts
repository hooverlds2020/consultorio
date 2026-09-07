"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { esSuperAdmin } from "@/lib/permisos";
import { usuarioSchema, generarPasswordTemporal } from "@/lib/validaciones/usuario.schema";

export type EstadoUsuario = {
  ok: boolean;
  errores?: Record<string, string[]>;
  mensaje?: string;
  passwordTemporal?: string;
};

async function requerirSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autenticado.");
  if (!esSuperAdmin(session.user.rol)) {
    throw new Error("Solo el Super Admin puede gestionar usuarios.");
  }
  return session;
}

export async function crearUsuario(
  _prevState: EstadoUsuario,
  formData: FormData
): Promise<EstadoUsuario> {
  await requerirSuperAdmin();

  const datosCrudos = Object.fromEntries(formData.entries());
  const parseo = usuarioSchema.safeParse(datosCrudos);

  if (!parseo.success) {
    return { ok: false, errores: parseo.error.flatten().fieldErrors };
  }

  const datos = parseo.data;
  const emailNormalizado = datos.email.toLowerCase().trim();

  const existente = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });
  if (existente) {
    return { ok: false, mensaje: "Ya existe un usuario con ese correo." };
  }

  const passwordTemporal = generarPasswordTemporal();
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  await prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      email: emailNormalizado,
      rol: datos.rol,
      passwordHash,
      activo: true,
    },
  });

  revalidatePath("/panel/usuarios");
  return { ok: true, passwordTemporal };
}

export async function cambiarEstadoActivo(
  usuarioId: string,
  activo: boolean
): Promise<EstadoUsuario> {
  const session = await requerirSuperAdmin();

  if (session.user.id === usuarioId && !activo) {
    return { ok: false, mensaje: "No puedes desactivar tu propia cuenta." };
  }

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { activo },
  });

  revalidatePath("/panel/usuarios");
  return { ok: true };
}

export async function restablecerPassword(usuarioId: string): Promise<EstadoUsuario> {
  await requerirSuperAdmin();

  const passwordTemporal = generarPasswordTemporal();
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { passwordHash },
  });

  return { ok: true, passwordTemporal };
}
