import { obtenerSolicitudPorToken } from "@/actions/firmaRemota";
import FirmarRemotoForm from "@/components/consentimientos/FirmarRemotoForm";

// Esta página se consulta contra la base de datos en cada visita (el
// token puede caducar o ya haber sido usado), así que no debe
// pre-construirse como página estática en build time.
export const dynamic = "force-dynamic";

export default async function FirmarPage({ params }: { params: { token: string } }) {
  const solicitud = await obtenerSolicitudPorToken(params.token);

  return (
    <main className="min-h-screen bg-clinica-azulClaro flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-center text-[18px] font-bold text-clinica-azulOscuro mb-1">
          Laboratorio y Consultorio Dental
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">Consentimiento informado</p>

        {solicitud.estado === "no_encontrado" && (
          <p className="text-center text-gray-600 text-sm">
            Este enlace no es válido. Pide uno nuevo a tu dentista.
          </p>
        )}

        {solicitud.estado === "ya_firmado" && (
          <p className="text-center text-gray-600 text-sm">
            Este documento ya fue firmado anteriormente. Si crees que es un error, contacta al
            consultorio.
          </p>
        )}

        {solicitud.estado === "expirado" && (
          <p className="text-center text-gray-600 text-sm">
            Este enlace ya expiró. Pide uno nuevo a tu dentista.
          </p>
        )}

        {solicitud.estado === "pendiente" && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Paciente:</span> {solicitud.pacienteNombre}
              </p>
              <p>
                <span className="font-medium">Tratamiento:</span> {solicitud.tipoTratamiento}
              </p>
              <p>
                <span className="font-medium">Dentista:</span> {solicitud.dentistaNombre}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-5 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {solicitud.textoConsentimiento}
            </div>

            <FirmarRemotoForm token={params.token} />
          </>
        )}
      </div>
    </main>
  );
}
