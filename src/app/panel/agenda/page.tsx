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

  return <AgendaDia citasIniciales={citas} dentistas={dentistas} fechaInicial={hoy} />;
}
