"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { esSuperAdmin } from "@/lib/permisos";
import { obtenerCitasDelDia } from "@/actions/agenda";
import { hoyEnZonaClinica } from "@/lib/fecha";

export type EstadoTelegram = { ok: boolean; mensaje?: string };

export async function obtenerConfigTelegram() {
  const config = await prisma.configuracionTelegram.findFirst();
  return {
    botTokenGuardado: !!config?.botToken,
    chatId: config?.chatId ?? "",
    activo: config?.activo ?? true,
  };
}

export async function guardarConfigTelegram(
  _prevState: EstadoTelegram,
  formData: FormData
): Promise<EstadoTelegram> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "Solo el Super Admin puede configurar esto." };
  }

  const botToken = (formData.get("botToken") ?? "").toString().trim();
  const chatId = (formData.get("chatId") ?? "").toString().trim();

  if (!botToken || !chatId) {
    return { ok: false, mensaje: "Llena el token del bot y el chat ID." };
  }

  const existente = await prisma.configuracionTelegram.findFirst();
  if (existente) {
    await prisma.configuracionTelegram.update({
      where: { id: existente.id },
      data: { botToken, chatId, activo: true },
    });
  } else {
    await prisma.configuracionTelegram.create({ data: { botToken, chatId, activo: true } });
  }

  revalidatePath("/panel/configuracion/telegram");
  return { ok: true };
}

/** Envía un mensaje de texto simple al chat configurado. */
async function enviarMensajeTelegram(texto: string): Promise<EstadoTelegram> {
  const config = await prisma.configuracionTelegram.findFirst();
  if (!config?.botToken || !config?.chatId) {
    return { ok: false, mensaje: "Telegram no está configurado todavía." };
  }
  if (!config.activo) {
    return { ok: false, mensaje: "Los recordatorios de Telegram están desactivados." };
  }

  const respuesta = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: config.chatId, text: texto, parse_mode: "HTML" }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    return { ok: false, mensaje: `Telegram rechazó el mensaje: ${detalle.slice(0, 200)}` };
  }

  return { ok: true };
}

export async function enviarMensajePruebaTelegram(
  _prevState: EstadoTelegram
): Promise<EstadoTelegram> {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    return { ok: false, mensaje: "No tienes permiso." };
  }
  return enviarMensajeTelegram(
    "✅ Mensaje de prueba — así se van a ver tus recordatorios de citas."
  );
}

/** Arma y envía el resumen del día — la llama el cron job cada mañana. */
export async function enviarRecordatorioDiario(): Promise<EstadoTelegram> {
  const hoy = hoyEnZonaClinica();
  const citas = await obtenerCitasDelDia(hoy);

  if (citas.length === 0) {
    return enviarMensajeTelegram(
      `📅 <b>Agenda de hoy</b> (${new Date().toLocaleDateString("es-MX")})\n\nSin citas programadas.`
    );
  }

  const lineas = citas.map((c) => {
    const hora = new Date(c.horaInicio).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `• ${hora} — ${c.paciente.nombre} ${c.paciente.apellidos} (${c.tipoTratamiento})`;
  });

  const texto =
    `📅 <b>Agenda de hoy</b> (${new Date().toLocaleDateString("es-MX")})\n` +
    `${citas.length} cita(s):\n\n${lineas.join("\n")}`;

  return enviarMensajeTelegram(texto);
}
