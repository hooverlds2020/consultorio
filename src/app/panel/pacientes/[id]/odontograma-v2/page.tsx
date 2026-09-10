import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { listarEstadosCatalogoV2, listarHallazgosPacienteV2, listarRadiografiasV2 } from "@/actions/odontogramaV2";
import { listarServiciosActivos } from "@/actions/catalogo";
import { calcularEdad } from "@/lib/validaciones/paciente.schema";
import OdontogramaV2 from "@/components/odontograma/OdontogramaV2";

/** Odontograma oficial del sistema (odontograma "Pro" — 5 caras, CIE-10, etc). */
export default async function OdontogramaV2Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol)) {
    redirect("/panel");
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: params.id } });
  if (!paciente || paciente.eliminadoEn) {
    notFound();
  }

  const [estados, hallazgos, servicios, radiografias] = await Promise.all([
    listarEstadosCatalogoV2(),
    listarHallazgosPacienteV2(paciente.id),
    listarServiciosActivos(),
    listarRadiografiasV2(paciente.id),
  ]);

  const edad = calcularEdad(paciente.fechaNacimiento);
  const vistaInicial = edad <= 5 ? "temporal" : edad <= 12 ? "mixta" : "permanente";

  return (
    <div>
      <Link
        href={`/panel/pacientes/${params.id}`}
        className="text-sm text-clinica-azul hover:underline"
      >
        ← {paciente.nombre} {paciente.apellidos}
      </Link>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mt-1 mb-4">Odontograma</h1>

      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <OdontogramaV2
          pacienteId={paciente.id}
          hallazgosIniciales={hallazgos as any}
          estados={estados}
          servicios={servicios as any}
          vistaInicial={vistaInicial}
          radiografiasIniciales={radiografias as any}
        />
      </div>
    </div>
  );
}
