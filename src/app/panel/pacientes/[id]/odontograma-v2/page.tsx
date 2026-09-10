import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes, esSuperAdmin } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { listarEstadosCatalogoV2, listarHallazgosPacienteV2, listarRadiografiasV2 } from "@/actions/odontogramaV2";
import { listarServiciosActivos } from "@/actions/catalogo";
import { calcularEdad } from "@/lib/validaciones/paciente.schema";
import OdontogramaV2 from "@/components/odontograma/OdontogramaV2";

/**
 * Vista previa del odontograma nuevo (Paso 3 — ya conectado a las tablas
 * _v2). Ruta separada a propósito de /odontograma (la real, en
 * producción) mientras se construye por fases.
 */
export default async function OdontogramaV2PreviewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol) || !esSuperAdmin(session.user.rol)) {
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

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg p-3 my-4">
        Vista previa en construcción, ya conectada a datos reales (tablas paralelas). El
        odontograma oficial sigue en{" "}
        <Link href={`/panel/pacientes/${params.id}/odontograma`} className="underline font-medium">
          /odontograma
        </Link>
        .
      </div>

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
