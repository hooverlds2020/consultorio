import Link from "next/link";
import { Clock, Stethoscope } from "lucide-react";
import { ESTATUS_CITA_LABEL, ESTATUS_CITA_COLOR } from "@/lib/validaciones/cita.schema";

type Cita = {
  id: string;
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

export default function AgendaHoyLista({ citas }: { citas: Cita[] }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Agenda de hoy</h3>
        <Link href="/panel/agenda" className="text-xs text-clinica-azul hover:underline">
          Ver agenda completa →
        </Link>
      </div>

      {citas.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock className="mx-auto mb-2" size={28} />
          <p className="text-sm">Sin citas programadas para hoy</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {citas.map((cita) => (
            <li
              key={cita.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition"
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-clinica-azulClaro text-clinica-azulOscuro flex items-center justify-center text-sm font-semibold">
                {iniciales(cita.paciente.nombre, cita.paciente.apellidos)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800 truncate">
                  {cita.paciente.nombre} {cita.paciente.apellidos}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                  <Clock size={12} /> {formatoHora(cita.horaInicio)}
                  <Stethoscope size={12} className="ml-1" /> {cita.tipoTratamiento}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${ESTATUS_CITA_COLOR[cita.estatus]}22`,
                    color: ESTATUS_CITA_COLOR[cita.estatus],
                  }}
                >
                  {ESTATUS_CITA_LABEL[cita.estatus]}
                </span>
                <Link
                  href="/panel/agenda"
                  className="text-[11px] text-clinica-azul hover:underline whitespace-nowrap"
                >
                  Atender →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
