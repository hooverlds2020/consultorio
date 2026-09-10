import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes, esSuperAdmin } from "@/lib/permisos";
import OdontogramaV2 from "@/components/odontograma/OdontogramaV2";

/**
 * Vista previa del odontograma nuevo (Paso 2). Ruta separada a propósito
 * de /odontograma (la real, en producción) para no interferir con nada
 * mientras se construye por fases. Solo visual — no guarda datos todavía.
 */
export default async function OdontogramaV2PreviewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol) || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  return (
    <div>
      <Link
        href={`/panel/pacientes/${params.id}`}
        className="text-sm text-clinica-azul hover:underline"
      >
        ← Volver a la ficha del paciente
      </Link>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg p-3 my-4">
        Vista previa en construcción — todavía no guarda nada en la base de datos. El
        odontograma real sigue en <Link href={`/panel/pacientes/${params.id}/odontograma`} className="underline font-medium">/odontograma</Link>.
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <OdontogramaV2 />
      </div>
    </div>
  );
}
