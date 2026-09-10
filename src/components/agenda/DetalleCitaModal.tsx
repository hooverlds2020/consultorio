"use client";

import { useState, useTransition } from "react";
import { ESTATUS_CITA_LABEL, ESTATUS_CITA_COLOR } from "@/lib/validaciones/cita.schema";
import { construirLinkWhatsapp, mensajeRecordatorioCita } from "@/lib/whatsapp";
import { eliminarCita } from "@/actions/agenda";
import type { EstatusCita } from "@prisma/client";

const OPCIONES_ESTATUS: EstatusCita[] = [
  "PROGRAMADA",
  "CONFIRMADA",
  "COMPLETADA",
  "CANCELADA",
  "NO_ASISTIO",
];

function formatoHora(fecha: Date | string): string {
  return new Date(fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

type Cita = {
  id: string;
  horaInicio: Date | string;
  horaFin: Date | string;
  tipoTratamiento: string;
  estatus: string;
  sillon: number;
  notas?: string | null;
  fecha: Date | string;
  paciente: { nombre: string; apellidos: string; whatsapp?: string | null };
  dentista: { nombre: string };
};

export default function DetalleCitaModal({
  cita,
  onCambiarEstatus,
  onCerrar,
  onEliminada,
}: {
  cita: Cita;
  onCambiarEstatus: (id: string, estatus: EstatusCita) => void;
  onCerrar: () => void;
  onEliminada: () => void;
}) {
  const [estatus, setEstatus] = useState(cita.estatus as EstatusCita);
  const [isPending, startTransition] = useTransition();
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, startTransitionEliminar] = useTransition();

  function handleCambiarEstatus(nuevo: EstatusCita) {
    setEstatus(nuevo);
    startTransition(() => {
      onCambiarEstatus(cita.id, nuevo);
    });
  }

  function handleEliminar() {
    startTransitionEliminar(async () => {
      await eliminarCita(cita.id);
      onEliminada();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={onCerrar}>
      <div
        className="bg-white w-full md:max-w-sm md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-clinica-azulOscuro">
            {cita.paciente.nombre} {cita.paciente.apellidos}
          </h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        <p className="text-sm text-clinica-azul font-medium mb-4">{cita.tipoTratamiento}</p>

        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <p>
            <span className="font-medium">Horario:</span> {formatoHora(cita.horaInicio)}–
            {formatoHora(cita.horaFin)}
          </p>
          <p>
            <span className="font-medium">Dentista:</span> {cita.dentista.nombre}
          </p>
          <p>
            <span className="font-medium">Sillón:</span> {cita.sillon}
          </p>
          {cita.notas && (
            <p>
              <span className="font-medium">Notas:</span> {cita.notas}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Estatus</label>
          <select
            value={estatus}
            onChange={(e) => handleCambiarEstatus(e.target.value as EstatusCita)}
            disabled={isPending}
            className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            style={{ borderLeftColor: ESTATUS_CITA_COLOR[estatus], borderLeftWidth: 4 }}
          >
            {OPCIONES_ESTATUS.map((e) => (
              <option key={e} value={e}>
                {ESTATUS_CITA_LABEL[e]}
              </option>
            ))}
          </select>
        </div>

        {cita.paciente.whatsapp && (
          <a
            href={construirLinkWhatsapp(
              cita.paciente.whatsapp,
              mensajeRecordatorioCita({
                nombrePaciente: cita.paciente.nombre,
                fecha: cita.fecha,
                horaInicio: cita.horaInicio,
                tipoTratamiento: cita.tipoTratamiento,
              })
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 w-full h-11 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium hover:bg-green-100 transition"
          >
            Enviar recordatorio por WhatsApp
          </a>
        )}

        <div className="border-t mt-4 pt-4">
          {confirmandoEliminar ? (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm text-red-700 mb-2">¿Eliminar esta cita? No se puede deshacer.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleEliminar}
                  disabled={eliminando}
                  className="flex-1 h-10 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-60"
                >
                  {eliminando ? "Eliminando..." : "Sí, eliminar"}
                </button>
                <button
                  onClick={() => setConfirmandoEliminar(false)}
                  className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmandoEliminar(true)}
              className="w-full h-10 text-sm text-red-500 hover:underline"
            >
              Eliminar cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
