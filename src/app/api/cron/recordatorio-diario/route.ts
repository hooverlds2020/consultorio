import { NextRequest, NextResponse } from "next/server";
import { enviarRecordatorioDiario } from "@/actions/telegram";

/**
 * Ruta pública, pero protegida por un secreto en la URL. El VPS la llama
 * una vez al día vía crontab (ver instrucciones en Configuración → Telegram).
 * No requiere sesión de usuario porque nadie la abre desde el navegador.
 */
export async function GET(request: NextRequest) {
  const secreto = request.nextUrl.searchParams.get("secret");

  if (!process.env.CRON_SECRET || secreto !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, mensaje: "Secreto inválido." }, { status: 401 });
  }

  const resultado = await enviarRecordatorioDiario();
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 500 });
}
