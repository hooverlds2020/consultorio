import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { obtenerConfigLanding, guardarConfigLanding } from "@/actions/landing";
import ConfigSeccionForm from "@/components/config-landing/ConfigSeccionForm";

export default async function ContactoConfigPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const config = await obtenerConfigLanding("CONTACTO");
  const valores = (config?.contenidoJson as Record<string, string>) ?? {};
  const accion = guardarConfigLanding.bind(null, "CONTACTO");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Contacto</h1>
      <ConfigSeccionForm
        accion={accion}
        valoresIniciales={valores}
        campos={[
          { name: "direccion", label: "Dirección", placeholder: "Calle, número, colonia, ciudad" },
          { name: "telefono", label: "Teléfono", placeholder: "961 123 4567" },
          { name: "whatsapp", label: "WhatsApp (10 dígitos)", placeholder: "9611234567" },
          { name: "horario", label: "Horario de atención", placeholder: "Lunes a viernes 9am - 7pm" },
          {
            name: "mapaUrl",
            label: "Enlace de Google Maps (opcional)",
            placeholder: "https://maps.google.com/...",
          },
        ]}
      />
    </div>
  );
}
