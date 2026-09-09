import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { obtenerHorarioServicio } from "@/actions/horarioServicio";
import HorarioServicioForm from "@/components/config-landing/HorarioServicioForm";

export default async function HorariosConfigPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const horario = await obtenerHorarioServicio();

  return (
    <div>
      <h1 className="text-[20px] md:text-2xl font-bold text-gray-900 mb-1">Horario de atención</h1>
      <p className="text-sm text-gray-500 mb-6">
        Esto recorta la vista de la Agenda al horario real y evita que se agenden citas fuera de
        horario.
      </p>
      <HorarioServicioForm horarioInicial={horario} />
    </div>
  );
}
