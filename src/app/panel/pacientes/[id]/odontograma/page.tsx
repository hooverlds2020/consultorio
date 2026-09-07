import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes, puedeEditarClinico } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { odontogramaVacio } from "@/lib/odontograma";
import { extraerMapaDientes, extraerMotivo, extraerDiff } from "@/components/odontograma/historialUtils";
import OdontogramaConHistorial from "@/components/odontograma/OdontogramaConHistorial";

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
  const dientesActuales = ultimoOdontograma
    ? extraerMapaDientes(ultimoOdontograma.dientesJson)
    : odontogramaVacio(tipo);

  const registrosAnteriores = await prisma.odontograma.findMany({
    where: { pacienteId: paciente.id, eliminadoEn: null },
    orderBy: { fecha: "desc" },
    skip: ultimoOdontograma ? 1 : 0,
    take: 10,
    include: { dentista: { select: { nombre: true } } },
  });

  const versionesAnteriores = registrosAnteriores.map((v) => ({
    id: v.id,
    fecha: v.fecha.toISOString(),
    dentistaNombre: v.dentista.nombre,
    motivo: extraerMotivo(v.dientesJson),
    diff: extraerDiff(v.dientesJson),
    dientes: extraerMapaDientes(v.dientesJson),
  }));

  // Para el panel de detalle por diente, incluimos también la versión más
  // reciente (la que se está editando) — así un cambio recién guardado
  // aparece de inmediato en el historial de esa pieza, sin esperar a que
  // se guarde una versión más.
  const versionesParaDetalle = ultimoOdontograma
    ? [
        {
          id: ultimoOdontograma.id,
          fecha: ultimoOdontograma.fecha.toISOString(),
          dentistaNombre: (
            await prisma.usuario.findUnique({
              where: { id: ultimoOdontograma.dentistaId },
              select: { nombre: true },
            })
          )?.nombre ?? "—",
          motivo: extraerMotivo(ultimoOdontograma.dientesJson),
          diff: extraerDiff(ultimoOdontograma.dientesJson),
          dientes: extraerMapaDientes(ultimoOdontograma.dientesJson),
        },
        ...versionesAnteriores,
      ]
    : versionesAnteriores;

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
            Este paciente aún no tiene odontograma. Marca los dientes y guarda la primera versión.
          </p>
        </div>
      )}

      <OdontogramaConHistorial
        pacienteId={paciente.id}
        tipo={tipo}
        dientesActuales={dientesActuales}
        soloLectura={!puedeEditar}
        versiones={versionesAnteriores}
        versionesDetalle={versionesParaDetalle}
      />
    </div>
  );
}
