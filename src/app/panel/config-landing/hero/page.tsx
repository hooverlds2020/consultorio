import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { obtenerConfigLanding, guardarConfigLanding } from "@/actions/landing";
import ConfigSeccionForm from "@/components/config-landing/ConfigSeccionForm";

export default async function HeroConfigPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const config = await obtenerConfigLanding("HERO");
  const valores = (config?.contenidoJson as Record<string, string>) ?? {};
  const accion = guardarConfigLanding.bind(null, "HERO");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Inicio (Hero)</h1>
      <ConfigSeccionForm
        accion={accion}
        valoresIniciales={valores}
        campos={[
          { name: "titulo", label: "Título principal", placeholder: "Tu sonrisa es nuestra prioridad" },
          {
            name: "subtitulo",
            label: "Subtítulo",
            placeholder: "Atención dental de calidad para toda la familia en Chiapas",
            textarea: true,
          },
          { name: "textoBoton", label: "Texto del botón de contacto", placeholder: "Agenda tu cita por WhatsApp" },
          { name: "whatsappCta", label: "Número de WhatsApp (10 dígitos)", placeholder: "9611234567" },
        ]}
      />
    </div>
  );
}
