import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { obtenerConfigTelegram } from "@/actions/telegram";
import TelegramConfigForm from "@/components/config-landing/TelegramConfigForm";

export default async function ConfigTelegramPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const config = await obtenerConfigTelegram();

  return (
    <div>
      <h1 className="text-[20px] md:text-2xl font-bold text-gray-900 mb-1">
        Recordatorios por Telegram
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Gratis, sin límite de mensajes, y avisa aunque el celular esté bloqueado.
      </p>
      <TelegramConfigForm botTokenGuardado={config.botTokenGuardado} chatIdGuardado={config.chatId} />
    </div>
  );
}
