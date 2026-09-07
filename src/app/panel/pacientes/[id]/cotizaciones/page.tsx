import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarCotizaciones } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { listarServiciosActivos } from "@/actions/catalogo";
import CotizacionForm from "@/components/cotizaciones/CotizacionForm";

const ESTATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
};

const ESTATUS_COLOR: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  ACEPTADA: "bg-green-100 text-green-700",
  RECHAZADA: "bg-red-100 text-red-700",
};

export default async function CotizacionesPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarCotizaciones(session.user.rol)) {
    redirect("/panel");
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: params.id } });
  if (!paciente || paciente.eliminadoEn) {
    notFound();
  }

  const [cotizaciones, servicios] = await Promise.all([
    prisma.cotizacion.findMany({
      where: { pacienteId: paciente.id },
      orderBy: { fecha: "desc" },
    }),
    listarServiciosActivos(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/panel/pacientes/${paciente.id}`}
          className="text-sm text-clinica-azul hover:underline"
        >
          ← {paciente.nombre} {paciente.apellidos}
        </Link>
        <h1 className="text-2xl font-semibold text-clinica-azulOscuro mt-1">Cotizaciones</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium text-gray-700 mb-3">Historial</h2>
          <div className="space-y-2">
            {cotizaciones.length === 0 && (
              <p className="text-gray-400 text-sm">Sin cotizaciones todavía.</p>
            )}
            {cotizaciones.map((c) => (
              <Link
                key={c.id}
                href={`/panel/pacientes/${paciente.id}/cotizaciones/${c.id}`}
                className="block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(c.fecha).toLocaleDateString("es-MX")}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${ESTATUS_COLOR[c.estatus]}`}>
                    {ESTATUS_LABEL[c.estatus]}
                  </span>
                </div>
                <p className="text-lg font-semibold text-clinica-azulOscuro mt-1">
                  ${Number(c.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-gray-700 mb-3">Nueva cotización</h2>
          <CotizacionForm pacienteId={paciente.id} servicios={servicios as any} />
        </div>
      </div>
    </div>
  );
}
