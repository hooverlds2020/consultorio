"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { puedeEditarClinico, esSuperAdmin } from "@/lib/permisos";

export type EstadoHallazgoV2 = { ok: boolean; mensaje?: string };

const CARPETA_RX_V2 = path.join(process.cwd(), "public", "uploads", "radiografias-v2");

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
    denticion: "permanente" | "temporal";
    dienteFdi: number;
    cara: string;
    estadoKey: string;
    cie10Codigo: string;
    cie10Desc: string;
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
      denticion: datos.denticion,
      dienteFdi: datos.dienteFdi,
      cara: datos.cara,
      estadoKey: datos.estadoKey,
      estadoLabel: estado.label,
      colorHex: estado.colorHex,
      cie10Codigo: datos.cie10Codigo || null,
      cie10Desc: datos.cie10Desc || null,
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

// ==========================================
// Catálogo de estados — configurable (Paso 5)
// ==========================================

function slugificar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function listarTodosEstadosV2() {
  return prisma.catalogoEstadoOdontogramaV2.findMany({ orderBy: { label: "asc" } });
}

export async function crearEstadoV2(
  _prevState: EstadoHallazgoV2,
  formData: FormData
): Promise<EstadoHallazgoV2> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "Solo el Super Admin puede editar el catálogo." };
  }

  const label = (formData.get("label") ?? "").toString().trim();
  const descripcion = (formData.get("descripcion") ?? "").toString().trim();
  const colorHex = (formData.get("colorHex") ?? "#000000").toString();

  if (!label) {
    return { ok: false, mensaje: "El nombre es obligatorio." };
  }

  const key = slugificar(label);
  const yaExiste = await prisma.catalogoEstadoOdontogramaV2.findUnique({ where: { key } });
  if (yaExiste) {
    return { ok: false, mensaje: "Ya existe un estado con ese nombre." };
  }

  await prisma.catalogoEstadoOdontogramaV2.create({
    data: { key, label, descripcion: descripcion || null, colorHex, esSistema: false },
  });

  revalidatePath("/panel/configuracion/odontograma");
  return { ok: true };
}

export async function actualizarEstadoV2(
  key: string,
  datos: { label: string; descripcion: string; colorHex: string }
): Promise<EstadoHallazgoV2> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "Solo el Super Admin puede editar el catálogo." };
  }

  const estado = await prisma.catalogoEstadoOdontogramaV2.findUnique({ where: { key } });
  if (!estado) {
    return { ok: false, mensaje: "Estado no encontrado." };
  }

  // Los 20 estados oficiales del sistema solo permiten cambiar el color —
  // el nombre y la descripción son parte del catálogo clínico estándar.
  await prisma.catalogoEstadoOdontogramaV2.update({
    where: { key },
    data: estado.esSistema
      ? { colorHex: datos.colorHex }
      : { label: datos.label, descripcion: datos.descripcion || null, colorHex: datos.colorHex },
  });

  revalidatePath("/panel/configuracion/odontograma");
  return { ok: true };
}

export async function desactivarEstadoV2(key: string): Promise<EstadoHallazgoV2> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "Solo el Super Admin puede editar el catálogo." };
  }

  const estado = await prisma.catalogoEstadoOdontogramaV2.findUnique({ where: { key } });
  if (!estado) {
    return { ok: false, mensaje: "Estado no encontrado." };
  }
  if (estado.esSistema) {
    return { ok: false, mensaje: "Los estados oficiales del sistema no se pueden borrar." };
  }

  // Se desactiva, no se borra — si ya hay hallazgos guardados con este
  // estado, el historial clínico no debe perder esa información.
  await prisma.catalogoEstadoOdontogramaV2.update({ where: { key }, data: { activo: false } });

  revalidatePath("/panel/configuracion/odontograma");
  return { ok: true };
}

// ==========================================
// Radiografías (Paso 5)
// ==========================================

export async function subirRadiografiaV2(
  pacienteId: string,
  _prevState: EstadoHallazgoV2,
  formData: FormData
): Promise<EstadoHallazgoV2> {
  const session = await getServerSession(authOptions);
  if (!session || !puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para subir radiografías." };
  }

  const tipo = (formData.get("tipo") ?? "").toString();
  const piezaTexto = (formData.get("pieza") ?? "").toString();
  const comentario = (formData.get("comentario") ?? "").toString().trim();
  const archivo = formData.get("archivo") as File | null;

  if (!tipo) {
    return { ok: false, mensaje: "Selecciona el tipo de radiografía." };
  }
  if (!archivo || archivo.size === 0) {
    return { ok: false, mensaje: "Selecciona una imagen." };
  }

  await mkdir(CARPETA_RX_V2, { recursive: true });
  const extension = path.extname(archivo.name).toLowerCase() || ".jpg";
  const nombreArchivo = `${crypto.randomUUID()}${extension}`;
  const bytes = Buffer.from(await archivo.arrayBuffer());
  await writeFile(path.join(CARPETA_RX_V2, nombreArchivo), bytes);

  await prisma.pacienteRadiografia.create({
    data: {
      pacienteId,
      tipo,
      pieza: piezaTexto ? Number(piezaTexto) : null,
      url: `/uploads/radiografias-v2/${nombreArchivo}`,
      comentario: comentario || null,
    },
  });

  revalidatePath(`/panel/pacientes/${pacienteId}/odontograma-v2`);
  return { ok: true };
}

export async function listarRadiografiasV2(pacienteId: string) {
  return prisma.pacienteRadiografia.findMany({
    where: { pacienteId },
    orderBy: { fecha: "desc" },
  });
}

export async function eliminarRadiografiaV2(
  radiografiaId: string,
  pacienteId: string
): Promise<EstadoHallazgoV2> {
  const session = await getServerSession(authOptions);
  if (!session || !puedeEditarClinico(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso para eliminar radiografías." };
  }

  const radiografia = await prisma.pacienteRadiografia.findUnique({
    where: { id: radiografiaId },
  });
  if (!radiografia) {
    return { ok: false, mensaje: "Esa radiografía ya no existe." };
  }

  await prisma.pacienteRadiografia.delete({ where: { id: radiografiaId } });

  // Borra también el archivo físico, para no dejar basura en el disco.
  // Si falla (archivo ya no existe, permisos, etc.) no es grave — el
  // registro ya se borró, que es lo que le importa al usuario.
  try {
    const rutaArchivo = path.join(process.cwd(), "public", radiografia.url.replace(/^\//, ""));
    await unlink(rutaArchivo);
  } catch {
    // silenciosamente ignorado
  }

  revalidatePath(`/panel/pacientes/${pacienteId}/odontograma-v2`);
  return { ok: true };
}

// ==========================================
// CIE-10 dental (Paso 6)
// ==========================================

export async function buscarCie10V2(query: string) {
  const texto = query.trim();
  if (texto.length < 2) return [];

  return prisma.cie10DiagnosticoV2.findMany({
    where: {
      OR: [
        { codigo: { contains: texto, mode: "insensitive" } },
        { descripcion: { contains: texto, mode: "insensitive" } },
      ],
    },
    orderBy: { codigo: "asc" },
    take: 15,
  });
}
