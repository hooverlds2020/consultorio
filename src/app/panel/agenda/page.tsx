import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { puedeGestionarAgenda } from "@/lib/permisos";
import { obtenerCitasDelDia, obtenerDentistas } from "@/actions/agenda";
import { listarServiciosActivos } from "@/actions/catalogo";
import { obtenerHorarioServicio } from "@/actions/horarioServicio";
import { hoyEnZonaClinica } from "@/lib/fecha";
import AgendaDia from "@/components/agenda/AgendaDia";

export default async function AgendaPage() {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarAgenda(session.user.rol)) {
    redirect("/panel");
  }

  const hoy = hoyEnZonaClinica();
  const [citas, dentistas, servicios, horarios] = await Promise.all([
    obtenerCitasDelDia(hoy),
    obtenerDentistas(),
    listarServiciosActivos(),
    obtenerHorarioServicio(),
  ]);

  return (
    <AgendaDia
      citasIniciales={citas}
      dentistas={dentistas}
      servicios={servicios}
      horarios={horarios}
      fechaInicial={hoy}
    />
  );
}
