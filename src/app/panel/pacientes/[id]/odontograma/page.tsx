import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes, puedeEditarClinico } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { odontogramaVacio, type DientesJson } from "@/lib/odontograma";
import OdontogramaEditor from "@/components/odontograma/OdontogramaEditor";

export default async function OdontogramaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol)) {
    redirect("/panel");
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: params.id } });
  if (!paciente || paciente.eliminadoEn) {
    notFound();
  }

  const puedeEditar = puedeEditarClinico(session.user.rol);

  const ultimoOdontograma = await prisma.odontograma.findFirst({
    where: { pacienteId: paciente.id, eliminadoEn: null },
    orderBy: { fecha: "desc" },
  });

  const tipo = ultimoOdontograma?.tipo ?? "ADULTO_32";
  const dientesIniciales =
    (ultimoOdontograma?.dientesJson as unknown as DientesJson) ?? odontogramaVacio(tipo);

  const versionesAnteriores = await prisma.odontograma.findMany({
    where: { pacienteId: paciente.id, eliminadoEn: null },
    orderBy: { fecha: "desc" },
    skip: ultimoOdontograma ? 1 : 0,
    take: 10,
    include: { dentista: { select: { nombre: true } } },
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/panel/pacientes/${paciente.id}`}
          className="text-sm text-clinica-azul hover:underline"
        >
          ← {paciente.nombre} {paciente.apellidos}
        </Link>
        <h1 className="text-2xl font-semibold text-clinica-azulOscuro mt-1">Odontograma</h1>
        {!puedeEditar && (
          <p className="text-sm text-gray-500 mt-1">
            Solo lectura — tu rol no puede modificar el odontograma.
          </p>
        )}
      </div>

      {!ultimoOdontograma && puedeEditar && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Este paciente aún no tiene odontograma. Selecciona el tipo para empezar:
          </p>
        </div>
      )}

      <OdontogramaEditor
        pacienteId={paciente.id}
        tipo={tipo}
        dientesIniciales={dientesIniciales}
        soloLectura={!puedeEditar}
      />

      {versionesAnteriores.length > 0 && (
        <div className="mt-10">
          <h2 className="font-medium text-clinica-azulOscuro mb-3">Versiones anteriores</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            {versionesAnteriores.map((v) => (
              <li key={v.id}>
                {new Date(v.fecha).toLocaleDateString("es-MX")} — {v.dentista.nombre}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
