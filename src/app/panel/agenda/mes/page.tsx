import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { puedeGestionarAgenda } from "@/lib/permisos";
import { obtenerConteoCitasDelMes } from "@/actions/agenda";
import { obtenerHorarioServicio } from "@/actions/horarioServicio";
import AgendaMes from "@/components/agenda/AgendaMes";

export default async function AgendaMesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarAgenda(session.user.rol)) {
    redirect("/panel");
  }

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;

  const [conteo, horarios] = await Promise.all([
    obtenerConteoCitasDelMes(anio, mes),
    obtenerHorarioServicio(),
  ]);

  return (
    <AgendaMes anioInicial={anio} mesInicial={mes} conteoInicial={conteo} horarios={horarios} />
  );
}
