import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes, esSuperAdmin } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { actualizarPaciente } from "@/actions/pacientes";
import { obtenerTimelinePaciente } from "@/actions/timeline";
import PacienteForm from "@/components/pacientes/PacienteForm";
import BannerAlertasClinicas from "@/components/pacientes/BannerAlertasClinicas";
import TimelinePaciente from "@/components/pacientes/TimelinePaciente";
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
  const eventosTimeline = await obtenerTimelinePaciente(paciente.id);

  const pestanas = [
    { href: `/panel/pacientes/${paciente.id}/historial`, label: "Historial clínico" },
    { href: `/panel/pacientes/${paciente.id}/odontograma`, label: "Odontograma" },
    { href: `/panel/pacientes/${paciente.id}/cotizaciones`, label: "Cotizaciones" },
    { href: `/panel/pacientes/${paciente.id}/pagos`, label: "Pagos" },
    { href: `/panel/pacientes/${paciente.id}/consentimientos`, label: "Consentimientos" },
  ];

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold text-clinica-azulOscuro truncate">
            {paciente.nombre} {paciente.apellidos}
          </h1>
          <p className="text-gray-500 text-sm">{calcularEdad(paciente.fechaNacimiento)} años</p>
        </div>
        {esSuperAdmin(session.user.rol) && (
          <div className="w-full md:w-auto">
            <EliminarPacienteBoton pacienteId={paciente.id} />
          </div>
        )}
      </div>

      <BannerAlertasClinicas
        alergias={paciente.alergias}
        enfermedadesSistemicas={paciente.enfermedadesSistemicas}
        medicamentosActuales={paciente.medicamentosActuales}
      />

      {/* Pestañas — scrolleables horizontalmente en móvil, nunca se cortan */}
      <div className="w-full overflow-x-auto -mx-4 px-4 mb-6">
        <div className="flex gap-2 min-w-max py-1">
          {pestanas.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="whitespace-nowrap h-11 flex items-center text-sm border border-clinica-azul text-clinica-azul px-4 rounded-lg hover:bg-clinica-azulClaro transition"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PacienteForm
            accion={actualizarConId}
            paciente={paciente}
            redirigirA={`/panel/pacientes/${paciente.id}`}
          />
        </div>
        <div>
          <TimelinePaciente eventos={eventosTimeline} />
        </div>
      </div>
    </div>
  );
}
