import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { obtenerConfigLanding, guardarConfigLanding } from "@/actions/landing";
import ConfigSeccionForm from "@/components/config-landing/ConfigSeccionForm";

export default async function NosotrosConfigPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const config = await obtenerConfigLanding("NOSOTROS");
  const valores = (config?.contenidoJson as Record<string, string>) ?? {};
  const accion = guardarConfigLanding.bind(null, "NOSOTROS");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Nosotros</h1>
      <ConfigSeccionForm
        accion={accion}
        valoresIniciales={valores}
        campos={[
          {
            name: "texto",
            label: "Texto sobre la clínica",
            placeholder: "Somos un consultorio dental comprometido con la salud bucal de nuestros pacientes...",
            textarea: true,
          },
        ]}
      />
    </div>
  );
}
