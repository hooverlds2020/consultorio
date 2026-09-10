import { Cake } from "lucide-react";
import { construirLinkWhatsapp } from "@/lib/whatsapp";

type Cumple = { id: string; nombre: string; apellidos: string; whatsapp: string | null; diferenciaDias: number };

export default function CumpleanosProximos({ cumpleanos }: { cumpleanos: Cumple[] }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-3">
        <Cake size={16} className="text-pink-500" />
        Cumpleaños próximos
      </h3>

      {cumpleanos.length === 0 ? (
        <p className="text-sm text-gray-400">Sin cumpleaños en los próximos 7 días.</p>
      ) : (
        <ul className="space-y-2">
          {cumpleanos.slice(0, 5).map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="text-gray-800 truncate">
                  {p.nombre} {p.apellidos}
                </p>
                <p className="text-xs text-gray-400">
                  {p.diferenciaDias === 0 ? "¡Hoy!" : `En ${p.diferenciaDias} día(s)`}
                </p>
              </div>
              {p.whatsapp && (
                <a
                  href={construirLinkWhatsapp(
                    p.whatsapp,
                    `¡Feliz cumpleaños, ${p.nombre}! Todo el equipo de Consultorio Dental te desea un excelente día. 🎉`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[11px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-1 hover:bg-green-100 transition whitespace-nowrap"
                >
                  WhatsApp
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
