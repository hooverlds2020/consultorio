"use client";

import { useState, useTransition } from "react";
import { actualizarOrdenLab } from "@/actions/ordenesLab";
import { crearCita } from "@/actions/agenda";
import { TIPO_TRABAJO_LABEL, ESTATUS_LAB_LABEL } from "@/lib/validaciones/orden-lab.schema";
import type { listarOrdenesLab, listarTecnicosLab } from "@/actions/ordenesLab";

type Orden = Awaited<ReturnType<typeof listarOrdenesLab>>[number];
type Tecnico = Awaited<ReturnType<typeof listarTecnicosLab>>[number];

function fechaParaInput(fecha: Date | string | null): string {
  if (!fecha) return "";
  return new Date(fecha).toISOString().split("T")[0];
}

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hf = Math.floor(total / 60) % 24;
  const mf = total % 60;
  return `${String(hf).padStart(2, "0")}:${String(mf).padStart(2, "0")}`;
}

export default function DetalleOrdenModal({
  orden,
  tecnicos,
  onCerrar,
}: {
  orden: Orden;
  tecnicos: Tecnico[];
  onCerrar: () => void;
}) {
  const [tecnicoAsignadoId, setTecnicoAsignadoId] = useState(orden.tecnicoAsignado?.id ?? "");
  const [tonoDiente, setTonoDiente] = useState(orden.tonoDiente ?? "");
  const [material, setMaterial] = useState(orden.material ?? "");
  const [notas, setNotas] = useState(orden.notas ?? "");
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState(
    fechaParaInput(orden.fechaEntregaEstimada)
  );
  const [costoLaboratorio, setCostoLaboratorio] = useState(
    orden.costoLaboratorio ? String(orden.costoLaboratorio) : ""
  );
  const [anticipoLaboratorio, setAnticipoLaboratorio] = useState(
    orden.anticipoLaboratorio ? String(orden.anticipoLaboratorio) : ""
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);

  const [mostrarAgendar, setMostrarAgendar] = useState(false);
  const [horaEntrega, setHoraEntrega] = useState("10:00");
  const [sillonEntrega, setSillonEntrega] = useState("1");
  const [agendando, startTransitionAgendar] = useTransition();
  const [citaCreada, setCitaCreada] = useState(false);
  const [errorAgendar, setErrorAgendar] = useState("");

  const saldoLab = Number(costoLaboratorio || 0) - Number(anticipoLaboratorio || 0);

  function handleGuardar() {
    setError("");
    startTransition(async () => {
      const resultado = await actualizarOrdenLab(orden.id, {
        tecnicoAsignadoId: tecnicoAsignadoId || null,
        tonoDiente,
        material,
        notas,
        fechaEntregaEstimada,
        costoLaboratorio,
        anticipoLaboratorio,
      });
      if (resultado.ok) {
        setGuardado(true);
      } else {
        setError(resultado.mensaje ?? "No se pudo guardar.");
      }
    });
  }

  function handleAgendarEntrega() {
    setErrorAgendar("");
    if (!fechaEntregaEstimada) {
      setErrorAgendar("Primero define y guarda la fecha promesa.");
      return;
    }

    const formData = new FormData();
    formData.set("pacienteId", orden.pacienteId);
    formData.set("dentistaId", orden.dentistaId);
    formData.set("sillon", sillonEntrega);
    formData.set("fecha", fechaEntregaEstimada);
    formData.set("horaInicio", horaEntrega);
    formData.set("horaFin", sumarMinutos(horaEntrega, 30));
    formData.set(
      "tipoTratamiento",
      `Entrega Lab - ${orden.paciente.nombre} ${orden.paciente.apellidos} - ${TIPO_TRABAJO_LABEL[orden.tipoTrabajo]}`
    );
    formData.set("notas", "Creada automáticamente desde Órdenes de Laboratorio.");

    startTransitionAgendar(async () => {
      const resultado = await crearCita({ ok: false }, formData);
      if (resultado.ok) {
        setCitaCreada(true);
      } else {
        setErrorAgendar(resultado.mensaje ?? "No se pudo crear la cita.");
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={onCerrar}>
      <div
        className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-clinica-azulOscuro">
            {orden.paciente.nombre} {orden.paciente.apellidos}
          </h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2">
            ×
          </button>
        </div>
        <p className="text-sm text-clinica-azul font-medium mb-4">
          {TIPO_TRABAJO_LABEL[orden.tipoTrabajo]} · {ESTATUS_LAB_LABEL[orden.estatus]}
        </p>

        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>}
        {guardado && <p className="text-green-600 text-sm mb-4">Guardado ✓</p>}

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Técnico asignado</label>
            <select
              value={tecnicoAsignadoId}
              onChange={(e) => setTecnicoAsignadoId(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            >
              <option value="">Sin asignar</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tono</label>
              <input
                type="text"
                value={tonoDiente}
                onChange={(e) => setTonoDiente(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Material</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Fecha promesa de entrega</label>
            <input
              type="date"
              value={fechaEntregaEstimada}
              required
              onChange={(e) => setFechaEntregaEstimada(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Costo laboratorio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costoLaboratorio}
                onChange={(e) => setCostoLaboratorio(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Anticipo pagado</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={anticipoLaboratorio}
                onChange={(e) => setAnticipoLaboratorio(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
              />
            </div>
          </div>

          {Number(costoLaboratorio) > 0 && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
              Saldo pendiente con el laboratorio: <span className="font-semibold">${saldoLab.toFixed(2)}</span>
            </p>
          )}

          <div>
            <label className="block text-sm text-gray-700 mb-1">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
            />
          </div>

          <div className="border-t pt-3">
            {citaCreada ? (
              <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3">
                ✓ Cita de entrega creada en la Agenda.
              </p>
            ) : mostrarAgendar ? (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {errorAgendar && <p className="text-red-600 text-xs">{errorAgendar}</p>}
                <p className="text-xs text-gray-500">
                  Se creará el {fechaEntregaEstimada || "(define la fecha promesa primero)"} con el
                  título "Entrega Lab - {orden.paciente.nombre} {orden.paciente.apellidos} -{" "}
                  {TIPO_TRABAJO_LABEL[orden.tipoTrabajo]}".
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hora</label>
                    <input
                      type="time"
                      value={horaEntrega}
                      onChange={(e) => setHoraEntrega(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg px-2 text-[16px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sillón</label>
                    <select
                      value={sillonEntrega}
                      onChange={(e) => setSillonEntrega(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg px-2 text-[16px]"
                    >
                      <option value="1">Sillón 1</option>
                      <option value="2">Sillón 2</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAgendarEntrega}
                  disabled={agendando}
                  className="w-full h-10 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                >
                  {agendando ? "Agendando..." : "Confirmar cita de entrega"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMostrarAgendar(true)}
                className="w-full h-11 border border-clinica-azul text-clinica-azul rounded-lg font-medium hover:bg-clinica-azulClaro transition"
              >
                Agendar entrega
              </button>
            )}
          </div>

          <button
            onClick={handleGuardar}
            disabled={isPending}
            className="w-full h-12 bg-clinica-azul text-white rounded-lg font-medium text-[16px] hover:bg-clinica-azulOscuro transition disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
