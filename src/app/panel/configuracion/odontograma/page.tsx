import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { listarTodosEstadosV2 } from "@/actions/odontogramaV2";
import CatalogoEstadosV2Admin from "@/components/config-landing/CatalogoEstadosV2Admin";

export default async function ConfigOdontogramaPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const estados = await listarTodosEstadosV2();

  return (
    <div>
      <h1 className="text-[20px] md:text-2xl font-bold text-gray-900 mb-1">
        Estados del Odontograma
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Los 20 estados oficiales solo permiten cambiar el color. Puedes agregar tus propios
        estados personalizados y editarlos o borrarlos libremente.
      </p>
      <CatalogoEstadosV2Admin estadosIniciales={estados} />
    </div>
  );
}
