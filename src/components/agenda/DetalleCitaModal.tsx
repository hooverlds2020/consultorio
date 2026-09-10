"use client";

import { useState, useTransition } from "react";
import { ESTATUS_CITA_LABEL, ESTATUS_CITA_COLOR } from "@/lib/validaciones/cita.schema";
import { construirLinkWhatsapp, mensajeRecordatorioCita } from "@/lib/whatsapp";
import { eliminarCita } from "@/actions/agenda";
import { registrarCobroCita } from "@/actions/pagos";
import type { EstatusCita } from "@prisma/client";

const OPCIONES_ESTATUS: EstatusCita[] = [
  "PROGRAMADA",
  "CONFIRMADA",
  "COMPLETADA",
  "CANCELADA",
  "NO_ASISTIO",
];

const METODOS_PAGO = [
  { valor: "EFECTIVO", etiqueta: "Efectivo" },
  { valor: "TARJETA", etiqueta: "Tarjeta" },
  { valor: "TRANSFERENCIA", etiqueta: "Transferencia" },
] as const;

function formatoHora(fecha: Date | string): string {
  return new Date(fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

type Cita = {
  id: string;
  pacienteId: string;
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

  const [mostrarCobrar, setMostrarCobrar] = useState(false);
  const [montoCobro, setMontoCobro] = useState("");
  const [metodoCobro, setMetodoCobro] = useState<"EFECTIVO" | "TARJETA" | "TRANSFERENCIA">("EFECTIVO");
  const [conceptoCobro, setConceptoCobro] = useState(`Cobro — ${cita.tipoTratamiento}`);
  const [cobrando, startTransitionCobrar] = useTransition();
  const [cobroRealizado, setCobroRealizado] = useState(false);
  const [errorCobro, setErrorCobro] = useState("");

  function handleCobrar() {
    setErrorCobro("");
    const monto = Number(montoCobro);
    if (!monto || monto <= 0) {
      setErrorCobro("Indica un monto válido.");
      return;
    }
    startTransitionCobrar(async () => {
      const resultado = await registrarCobroCita(
        cita.id,
        cita.pacienteId,
        monto,
        metodoCobro,
        conceptoCobro
      );
      if (resultado.ok) {
        setCobroRealizado(true);
      } else {
        setErrorCobro(resultado.mensaje ?? "No se pudo registrar el cobro.");
      }
    });
  }

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

        <div className="mb-4">
          {cobroRealizado ? (
            <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3">
              ✓ Cobro de ${Number(montoCobro).toLocaleString("es-MX")} registrado en Caja.
            </p>
          ) : mostrarCobrar ? (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {errorCobro && <p className="text-red-600 text-xs">{errorCobro}</p>}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montoCobro}
                  onChange={(e) => setMontoCobro(e.target.value)}
                  placeholder="800.00"
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Método</label>
                <select
                  value={metodoCobro}
                  onChange={(e) => setMetodoCobro(e.target.value as typeof metodoCobro)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
                >
                  {METODOS_PAGO.map((m) => (
                    <option key={m.valor} value={m.valor}>
                      {m.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Concepto</label>
                <input
                  type="text"
                  value={conceptoCobro}
                  onChange={(e) => setConceptoCobro(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
                />
              </div>
              <button
                onClick={handleCobrar}
                disabled={cobrando}
                className="w-full h-11 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-60"
              >
                {cobrando ? "Registrando..." : "Confirmar cobro"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMostrarCobrar(true)}
              className="w-full h-12 bg-green-600 text-white rounded-lg font-medium text-[16px] hover:bg-green-700 transition"
            >
              Cobrar
            </button>
          )}
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
