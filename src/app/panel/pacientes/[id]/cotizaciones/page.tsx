import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarCotizaciones } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { listarServiciosActivos } from "@/actions/catalogo";
import { NOMBRE_ESTADO, type EstadoDiente } from "@/lib/odontograma";
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

export default async function CotizacionesPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { sugerido?: string };
}) {
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

  // Si venimos del odontograma con cambios recién guardados, sugerimos
  // líneas de cotización buscando un servicio del catálogo cuyo nombre
  // coincida con el nuevo estado del diente (ej. diente pasó a "Corona"
  // → busca un servicio que contenga "corona" en el nombre). Si no hay
  // coincidencia, simplemente no se sugiere esa línea — no se inventa nada.
  let lineasSugeridas: { servicioId: string; cantidad: number }[] = [];
  let huboSugerenciasSinMatch = false;

  if (searchParams.sugerido) {
    try {
      const diff = JSON.parse(decodeURIComponent(searchParams.sugerido)) as {
        diente: string;
        a: EstadoDiente;
      }[];

      for (const cambio of diff) {
        const nombreEstado = NOMBRE_ESTADO[cambio.a]?.toLowerCase();
        if (!nombreEstado || nombreEstado === "sano") continue;
        const match = servicios.find((s) => s.nombre.toLowerCase().includes(nombreEstado));
        if (match) {
          lineasSugeridas.push({ servicioId: match.id, cantidad: 1 });
        } else {
          huboSugerenciasSinMatch = true;
        }
      }
    } catch {
      // Parámetro corrupto o manipulado — simplemente lo ignoramos, no rompe la página.
    }
  }

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
          {lineasSugeridas.length > 0 && (
            <p className="text-xs bg-blue-50 text-blue-700 rounded-md p-2 mb-2">
              Se prellenaron {lineasSugeridas.length} línea(s) a partir de los cambios del
              odontograma. Revísalas antes de guardar.
            </p>
          )}
          {huboSugerenciasSinMatch && (
            <p className="text-xs bg-yellow-50 text-yellow-700 rounded-md p-2 mb-2">
              Algún cambio del odontograma no tiene un servicio equivalente en el catálogo —
              agrégalo manualmente si aplica.
            </p>
          )}
          <CotizacionForm
            pacienteId={paciente.id}
            servicios={servicios as any}
            lineasIniciales={lineasSugeridas}
          />
        </div>
      </div>
    </div>
  );
}
