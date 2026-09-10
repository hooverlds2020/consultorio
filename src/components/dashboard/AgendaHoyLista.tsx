import Link from "next/link";
import { Clock, Stethoscope } from "lucide-react";
import { ESTATUS_CITA_LABEL, ESTATUS_CITA_COLOR } from "@/lib/validaciones/cita.schema";

type Cita = {
  id: string;
  fecha: Date | string;
  horaInicio: Date | string;
  tipoTratamiento: string;
  estatus: string;
  paciente: { nombre: string; apellidos: string };
  dentista: { nombre: string };
};

function iniciales(nombre: string, apellidos: string): string {
  return `${nombre[0] ?? ""}${apellidos[0] ?? ""}`.toUpperCase();
}

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
    <ul className="space-y-2">
      {citas.map((cita) => (
        <li key={cita.id} className="flex items-center gap-2">
          <div className="w-7 h-7 shrink-0 rounded-full bg-clinica-azulClaro text-clinica-azulOscuro flex items-center justify-center text-[11px] font-semibold">
            {iniciales(cita.paciente.nombre, cita.paciente.apellidos)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800 truncate">
              {formatoHora(cita.horaInicio)} — {cita.paciente.nombre} {cita.paciente.apellidos}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
              <Stethoscope size={11} /> {cita.tipoTratamiento}
            </p>
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
            style={{
              backgroundColor: `${ESTATUS_CITA_COLOR[cita.estatus]}22`,
              color: ESTATUS_CITA_COLOR[cita.estatus],
            }}
          >
            {ESTATUS_CITA_LABEL[cita.estatus]}
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
        <div className="space-y-4">
          {citasPorDia.map((dia) => (
            <div key={dia.fecha}>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                {etiquetaDia(dia.fecha, hoyISO, mananaISO)}
                {dia.citas.length > 0 && (
                  <span className="ml-1 normal-case font-normal text-gray-400">
                    ({dia.citas.length})
                  </span>
                )}
              </p>
              <ListaCitasDia citas={dia.citas} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
