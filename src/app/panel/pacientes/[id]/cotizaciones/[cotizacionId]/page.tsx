import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarCotizaciones } from "@/lib/permisos";
import { obtenerCotizacion } from "@/actions/cotizaciones";
import GenerarPdfBoton from "@/components/cotizaciones/GenerarPdfBoton";
import AccionesCotizacion from "@/components/cotizaciones/AccionesCotizacion";

const ESTATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
};

export default async function DetalleCotizacionPage({
  params,
}: {
  params: { id: string; cotizacionId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarCotizaciones(session.user.rol)) {
    redirect("/panel");
  }

  const cotizacion = await obtenerCotizacion(params.cotizacionId);
  if (!cotizacion) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/panel/pacientes/${params.id}/cotizaciones`}
          className="text-sm text-clinica-azul hover:underline"
        >
          ← Cotizaciones
        </Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-semibold text-clinica-azulOscuro">
            Cotización — {cotizacion.paciente.nombre} {cotizacion.paciente.apellidos}
          </h1>
          <GenerarPdfBoton cotizacion={cotizacion as any} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(cotizacion.fecha).toLocaleDateString("es-MX")} · Creada por{" "}
          {cotizacion.creadaPor.nombre} · Estatus: {ESTATUS_LABEL[cotizacion.estatus]}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Servicio</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Precio unitario</th>
              <th className="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.servicio.nombre}</td>
                <td className="px-4 py-3">{item.cantidad}</td>
                <td className="px-4 py-3">
                  ${Number(item.precioUnitario).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  ${Number(item.subtotal).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t px-4 py-3 flex justify-end">
          <span className="font-semibold text-lg text-clinica-azulOscuro">
            Total: ${Number(cotizacion.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {cotizacion.estatus === "PENDIENTE" && (
        <AccionesCotizacion cotizacionId={cotizacion.id} />
      )}

      {cotizacion.estatus === "ACEPTADA" && cotizacion.planTratamiento && (
        <p className="text-sm text-green-600">
          ✓ Se generó un Plan de Tratamiento a partir de esta cotización.
        </p>
      )}
    </div>
  );
}
