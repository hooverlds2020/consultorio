import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { puedeGestionarAgenda } from "@/lib/permisos";
import { obtenerCitasDelDia, obtenerDentistas } from "@/actions/agenda";
import { listarServiciosActivos } from "@/actions/catalogo";
import { obtenerHorarioServicio } from "@/actions/horarioServicio";
import { hoyEnZonaClinica } from "@/lib/fecha";
import AgendaDia from "@/components/agenda/AgendaDia";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { fecha?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarAgenda(session.user.rol)) {
    redirect("/panel");
  }

  const hoy = hoyEnZonaClinica();
  // Válida solo si viene bien formada YYYY-MM-DD — si no, usamos hoy.
  const fechaInicial =
    searchParams.fecha && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.fecha) ? searchParams.fecha : hoy;

  const [citas, dentistas, servicios, horarios] = await Promise.all([
    obtenerCitasDelDia(fechaInicial),
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
      fechaInicial={fechaInicial}
    />
  );
}
