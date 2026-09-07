import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes, esSuperAdmin } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { actualizarPaciente } from "@/actions/pacientes";
import PacienteForm from "@/components/pacientes/PacienteForm";
import { calcularEdad } from "@/lib/validaciones/paciente.schema";
import EliminarPacienteBoton from "@/components/pacientes/EliminarPacienteBoton";

export default async function FichaPacientePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol)) {
    redirect("/panel");
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: params.id } });

  if (!paciente || paciente.eliminadoEn) {
    notFound();
  }

  const actualizarConId = actualizarPaciente.bind(null, paciente.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-clinica-azulOscuro">
            {paciente.nombre} {paciente.apellidos}
          </h1>
          <p className="text-gray-500 text-sm">{calcularEdad(paciente.fechaNacimiento)} años</p>
        </div>
        {esSuperAdmin(session.user.rol) && (
          <EliminarPacienteBoton pacienteId={paciente.id} />
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <Link
          href={`/panel/pacientes/${paciente.id}/historial`}
          className="text-sm border border-clinica-azul text-clinica-azul px-4 py-2 rounded-md hover:bg-clinica-azulClaro transition"
        >
          Historial clínico
        </Link>
        <Link
          href={`/panel/pacientes/${paciente.id}/odontograma`}
          className="text-sm border border-clinica-azul text-clinica-azul px-4 py-2 rounded-md hover:bg-clinica-azulClaro transition"
        >
          Odontograma
        </Link>
        <Link
          href={`/panel/pacientes/${paciente.id}/cotizaciones`}
          className="text-sm border border-clinica-azul text-clinica-azul px-4 py-2 rounded-md hover:bg-clinica-azulClaro transition"
        >
          Cotizaciones
        </Link>
        <Link
          href={`/panel/pacientes/${paciente.id}/pagos`}
          className="text-sm border border-clinica-azul text-clinica-azul px-4 py-2 rounded-md hover:bg-clinica-azulClaro transition"
        >
          Pagos
        </Link>
        <Link
          href={`/panel/pacientes/${paciente.id}/consentimientos`}
          className="text-sm border border-clinica-azul text-clinica-azul px-4 py-2 rounded-md hover:bg-clinica-azulClaro transition"
        >
          Consentimientos
        </Link>
      </div>

      <PacienteForm
        accion={actualizarConId}
        paciente={paciente}
        redirigirA={`/panel/pacientes/${paciente.id}`}
      />
    </div>
  );
}
