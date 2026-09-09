import Link from "next/link";
import { Calendar, FileText, DollarSign, PenTool, Stethoscope } from "lucide-react";
import type { EventoTimeline } from "@/actions/timeline";

const ICONO_POR_TIPO = {
  cita: Calendar,
  cotizacion: FileText,
  pago: DollarSign,
  consentimiento: PenTool,
  historial: Stethoscope,
};

const COLOR_POR_TIPO = {
  cita: "bg-blue-100 text-blue-600",
  cotizacion: "bg-purple-100 text-purple-600",
  pago: "bg-green-100 text-green-600",
  consentimiento: "bg-orange-100 text-orange-600",
  historial: "bg-gray-100 text-gray-600",
};

export default function TimelinePaciente({ eventos }: { eventos: EventoTimeline[] }) {
  if (eventos.length === 0) {
    return (
      <p className="text-sm text-gray-400 bg-white rounded-xl border p-6 text-center">
        Sin actividad registrada todavía para este paciente.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Historial de actividad</h3>
      <ul className="space-y-3">
        {eventos.map((ev, i) => {
          const Icono = ICONO_POR_TIPO[ev.tipo];
          return (
            <li key={i} className="flex gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${COLOR_POR_TIPO[ev.tipo]}`}
              >
                <Icono size={15} />
              </div>
              <div className="min-w-0 flex-1 pb-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  {ev.href ? (
                    <Link href={ev.href} className="text-sm font-medium text-gray-800 hover:text-clinica-azul truncate">
                      {ev.titulo}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 truncate">{ev.titulo}</p>
                  )}
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {new Date(ev.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{ev.detalle}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
