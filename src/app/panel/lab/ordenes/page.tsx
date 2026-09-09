import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { puedeGestionarOrdenesLab, puedeEditarClinico } from "@/lib/permisos";
import { listarOrdenesLab, listarTecnicosLab, obtenerResumenDeudaLaboratorio } from "@/actions/ordenesLab";
import TableroOrdenesLab from "@/components/lab/TableroOrdenesLab";

export default async function OrdenesLabPage() {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarOrdenesLab(session.user.rol)) {
    redirect("/panel");
  }

  const [ordenes, tecnicos, resumenDeuda] = await Promise.all([
    listarOrdenesLab(),
    listarTecnicosLab(),
    obtenerResumenDeudaLaboratorio(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">
        Órdenes de Laboratorio
      </h1>
      <TableroOrdenesLab
        ordenes={ordenes}
        tecnicos={tecnicos}
        puedeCrear={puedeEditarClinico(session.user.rol)}
        resumenDeuda={resumenDeuda}
      />
    </div>
  );
}
