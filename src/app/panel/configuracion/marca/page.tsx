import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { obtenerLogoNegocio } from "@/actions/marca";
import LogoNegocioForm from "@/components/config-landing/LogoNegocioForm";

export default async function ConfigMarcaPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const logoActual = await obtenerLogoNegocio();

  return (
    <div>
      <h1 className="text-[20px] md:text-2xl font-bold text-gray-900 mb-1">Logo del negocio</h1>
      <LogoNegocioForm logoActual={logoActual} />
    </div>
  );
}
