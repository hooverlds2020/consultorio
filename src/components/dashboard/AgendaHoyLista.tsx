import Link from "next/link";
import { Clock, AlertCircle } from "lucide-react";

type Cita = {
  id: string;
  horaInicio: Date | string;
  paciente: { nombre: string; apellidos: string };
};

function formatoHora(fecha: Date | string): string {
  return new Date(fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function etiquetaDia(fechaISO: string, hoyISO: string, mananaISO: string): string {
  if (fechaISO === hoyISO) return "Hoy";
  if (fechaISO === mananaISO) return "Mañana";
  return new Date(`${fechaISO}T12:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function ListaCitasDia({ citas }: { citas: Cita[] }) {
  if (citas.length === 0) {
    return <p className="text-xs text-gray-400 italic py-1">Sin citas programadas</p>;
  }
  return (
    <ul className="space-y-1.5">
      {citas.map((cita) => (
        <li key={cita.id} className="flex items-baseline gap-2 text-sm">
          <span className="font-medium text-gray-700 tabular-nums shrink-0">
            {formatoHora(cita.horaInicio)}
          </span>
          <span className="text-gray-600 truncate">
            {cita.paciente.nombre} {cita.paciente.apellidos}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function AgendaHoyLista({ citasPorDia }: { citasPorDia: { fecha: string; citas: Cita[] }[] }) {
  const hoyISO = citasPorDia[0]?.fecha ?? "";
  const mananaISO = citasPorDia[1]?.fecha ?? "";
  const totalCitas = citasPorDia.reduce((suma, d) => suma + d.citas.length, 0);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Próximos 3 días</h3>
        <Link href="/panel/agenda" className="text-xs text-clinica-azul hover:underline">
          Ver agenda completa →
        </Link>
      </div>

      {totalCitas === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock className="mx-auto mb-2" size={28} />
          <p className="text-sm">Sin citas en los próximos 3 días</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {citasPorDia.map((dia, i) => {
            const esHoy = i === 0;
            return (
              <div
                key={dia.fecha}
                className={`rounded-lg p-3 ${
                  esHoy && dia.citas.length > 0
                    ? "bg-orange-50 border-2 border-orange-300"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase mb-2 flex items-center gap-1 ${
                    esHoy && dia.citas.length > 0 ? "text-orange-700" : "text-gray-500"
                  }`}
                >
                  {esHoy && dia.citas.length > 0 && <AlertCircle size={12} />}
                  {etiquetaDia(dia.fecha, hoyISO, mananaISO)}
                  {dia.citas.length > 0 && (
                    <span className="normal-case font-normal opacity-70">({dia.citas.length})</span>
                  )}
                </p>
                <ListaCitasDia citas={dia.citas} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
