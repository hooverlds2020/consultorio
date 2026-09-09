import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes, puedeEditarClinico } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { listarConsentimientosPaciente } from "@/actions/consentimientos";
import ConsentimientosCliente from "@/components/consentimientos/ConsentimientosCliente";

export default async function ConsentimientosPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol)) {
    redirect("/panel");
  }

  const paciente = await prisma.paciente.findUnique({ where: { id: params.id } });
  if (!paciente || paciente.eliminadoEn) {
    notFound();
  }

  const consentimientos = await listarConsentimientosPaciente(paciente.id);
  const puedeCrear = puedeEditarClinico(session.user.rol);

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
          Consentimientos informados
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {consentimientos.length === 0 && (
            <p className="text-gray-400 text-sm">Sin consentimientos firmados todavía.</p>
          )}
          {consentimientos.map((c) => (
            <div key={c.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-clinica-azulOscuro">{c.tipoTratamiento}</span>
                {c.firmaImagenPath ? (
                  <span className="text-xs text-gray-500">
                    {c.fechaFirma ? new Date(c.fechaFirma).toLocaleDateString("es-MX") : ""}
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    Pendiente de firma
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">{c.dentista.nombre}</p>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{c.textoConsentimiento}</p>
              {c.firmaImagenPath ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.firmaImagenPath}
                    alt="Firma del paciente"
                    className="border border-gray-200 rounded bg-white max-h-24"
                  />
                  {c.ipFirma && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Firmado desde IP {c.ipFirma}
                      {c.hashDocumento && ` · Verificación: ${c.hashDocumento.slice(0, 12)}...`}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Se envió al paciente por WhatsApp. Esperando que lo firme desde su celular.
                </p>
              )}
            </div>
          ))}
        </div>

        {puedeCrear && (
          <div>
            <ConsentimientosCliente pacienteId={paciente.id} />
          </div>
        )}
      </div>
    </div>
  );
}
