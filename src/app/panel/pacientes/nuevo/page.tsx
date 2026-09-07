import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes } from "@/lib/permisos";
import { crearPaciente } from "@/actions/pacientes";
import PacienteForm from "@/components/pacientes/PacienteForm";

export default async function NuevoPacientePage() {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol)) {
    redirect("/panel");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Nuevo paciente</h1>
      <PacienteForm accion={crearPaciente} redirigirA="/panel/pacientes" />
    </div>
  );
}
