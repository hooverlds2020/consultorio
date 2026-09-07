import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes, puedeEditarClinico } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { crearEntradaHistorial } from "@/actions/historial";
import HistorialForm from "@/components/historial/HistorialForm";

export default async function HistorialPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol)) {
    redirect("/panel");
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: params.id } });
  if (!paciente || paciente.eliminadoEn) {
    notFound();
  }

  const entradas = await prisma.historialClinico.findMany({
    where: { pacienteId: paciente.id, eliminadoEn: null },
    orderBy: { fecha: "desc" },
    include: { dentista: { select: { nombre: true } } },
  });

  const crearEntradaConId = crearEntradaHistorial.bind(null, paciente.id);
  const puedeEditar = puedeEditarClinico(session.user.rol);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/panel/pacientes/${paciente.id}`}
          className="text-sm text-clinica-azul hover:underline"
        >
          ← {paciente.nombre} {paciente.apellidos}
        </Link>
        <h1 className="text-2xl font-semibold text-clinica-azulOscuro mt-1">
          Historial clínico
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {entradas.length === 0 && (
            <p className="text-gray-400 text-sm">Sin entradas todavía.</p>
          )}
          {entradas.map((entrada) => (
            <div key={entrada.id} className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{entrada.dentista.nombre}</span>
                <span>{new Date(entrada.fecha).toLocaleDateString("es-MX")}</span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{entrada.notas}</p>
              {entrada.archivosAdjuntos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {entrada.archivosAdjuntos.map((ruta) => (
                    <a
                      key={ruta}
                      href={ruta}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-clinica-azul border border-clinica-azul rounded px-2 py-1 hover:bg-clinica-azulClaro transition"
                    >
                      Ver archivo
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {puedeEditar && (
          <div>
            <HistorialForm accion={crearEntradaConId} />
          </div>
        )}
      </div>
    </div>
  );
}
