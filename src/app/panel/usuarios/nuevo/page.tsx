import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import UsuarioForm from "@/components/usuarios/UsuarioForm";

export default async function NuevoUsuarioPage() {
  const session = await getServerSession(authOptions);

  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Nuevo usuario</h1>
      <UsuarioForm />
    </div>
  );
}
