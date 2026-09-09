import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPagos } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import {
  registrarPago,
  listarPagosPaciente,
  listarPlanesActivosPaciente,
} from "@/actions/pagos";
import { METODO_PAGO_LABEL } from "@/lib/validaciones/pago.schema";
import PagoForm from "@/components/pagos/PagoForm";
import ReciboPdfBoton from "@/components/pagos/ReciboPdfBoton";

export default async function PagosPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPagos(session.user.rol)) {
    redirect("/panel");
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: params.id } });
  if (!paciente || paciente.eliminadoEn) {
    notFound();
  }

  const [pagos, planes] = await Promise.all([
    listarPagosPaciente(paciente.id),
    listarPlanesActivosPaciente(paciente.id),
  ]);

  const registrarPagoConId = registrarPago.bind(null, paciente.id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/panel/pacientes/${paciente.id}`}
          className="text-sm text-clinica-azul hover:underline"
        >
          ← {paciente.nombre} {paciente.apellidos}
        </Link>
        <h1 className="text-2xl font-semibold text-clinica-azulOscuro mt-1">Pagos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium text-gray-700 mb-3">Historial de pagos</h2>
          <div className="space-y-2">
            {pagos.length === 0 && <p className="text-gray-400 text-sm">Sin pagos todavía.</p>}
            {pagos.map((pago) => {
              const saldoRestante = pago.planTratamiento
                ? Number(pago.planTratamiento.totalPlan) - Number(pago.planTratamiento.totalPagado)
                : null;
              return (
                <div key={pago.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-clinica-azulOscuro">
                      ${Number(pago.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(pago.fecha).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{METODO_PAGO_LABEL[pago.metodo]}</p>
                  <p className="text-xs text-gray-400">Folio: {pago.folioRecibo}</p>
                  {pago.planTratamiento ? (
                    <p className="text-xs mt-1 inline-block bg-clinica-azulClaro text-clinica-azulOscuro px-2 py-0.5 rounded-full">
                      Abono a plan · Saldo restante: $
                      {saldoRestante!.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  ) : (
                    <p className="text-xs mt-1 text-gray-400">Pago directo (sin plan)</p>
                  )}
                  <div className="mt-2">
                    <ReciboPdfBoton pago={pago as any} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <PagoForm accion={registrarPagoConId} planes={planes as any} />
        </div>
      </div>
    </div>
  );
}
