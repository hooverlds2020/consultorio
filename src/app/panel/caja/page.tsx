import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { puedeVerFinanzas } from "@/lib/permisos";
import { obtenerReporteCaja } from "@/actions/pagos";
import { hoyEnZonaClinica } from "@/lib/fecha";
import ReporteCaja from "@/components/pagos/ReporteCaja";

export default async function CajaPage() {
  const session = await getServerSession(authOptions);

  if (!session || !puedeVerFinanzas(session.user.rol)) {
    redirect("/panel");
  }

  const hoy = hoyEnZonaClinica();
  const reporte = await obtenerReporteCaja(hoy, hoy);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Corte de Caja</h1>
      <ReporteCaja reporteInicial={reporte} />
    </div>
  );
}
