import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { puedeGestionarAgenda } from "@/lib/permisos";
import { obtenerCitasDelDia, obtenerDentistas } from "@/actions/agenda";
import { hoyEnZonaClinica } from "@/lib/fecha";
import AgendaDia from "@/components/agenda/AgendaDia";

export default async function AgendaPage() {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarAgenda(session.user.rol)) {
    redirect("/panel");
  }

  const hoy = hoyEnZonaClinica();
  const [citas, dentistas] = await Promise.all([
    obtenerCitasDelDia(hoy),
    obtenerDentistas(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Agenda</h1>
      <AgendaDia citasIniciales={citas} dentistas={dentistas} fechaInicial={hoy} />
    </div>
  );
}
