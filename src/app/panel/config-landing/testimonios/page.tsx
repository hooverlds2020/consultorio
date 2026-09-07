import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { listarTodosTestimonios } from "@/actions/landing";
import TestimonioForm from "@/components/config-landing/TestimonioForm";
import DesactivarTestimonioBoton from "@/components/config-landing/DesactivarTestimonioBoton";

export default async function TestimoniosConfigPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const testimonios = await listarTodosTestimonios();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Testimonios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {testimonios.length === 0 && (
            <p className="text-gray-400 text-sm">Sin testimonios todavía.</p>
          )}
          {testimonios.map((t) => (
            <div key={t.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-800">{t.nombrePaciente}</span>
                {!t.activo && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Oculto
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{t.texto}</p>
              {t.activo && <DesactivarTestimonioBoton id={t.id} />}
            </div>
          ))}
        </div>

        <div>
          <TestimonioForm />
        </div>
      </div>
    </div>
  );
}
