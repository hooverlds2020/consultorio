"use client";

import { useState, useTransition } from "react";
import { crearCita, buscarPacientesParaCita } from "@/actions/agenda";

type Dentista = { id: string; nombre: string };
type Servicio = { id: string; nombre: string };

const DURACIONES = [15, 30, 45, 60, 90, 120];

export default function NuevaCitaModal({
  dentistas,
  servicios,
  fechaInicial,
  onCerrar,
  onCreada,
}: {
  dentistas: Dentista[];
  servicios: Servicio[];
  fechaInicial: string;
  onCerrar: () => void;
  onCreada: () => void;
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<{ id: string; nombre: string; apellidos: string }[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<{ id: string; nombre: string } | null>(null);
  const [dentistaId, setDentistaId] = useState("");
  const [sillon, setSillon] = useState("1");
  const [fecha, setFecha] = useState(fechaInicial);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [duracion, setDuracion] = useState("30");
  const [tratamiento, setTratamiento] = useState(servicios[0]?.nombre ?? "");
  const [tratamientoLibre, setTratamientoLibre] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isPendingBusqueda, startTransitionBusqueda] = useTransition();

  function calcularHoraFin(): string {
    const [h, m] = horaInicio.split(":").map(Number);
    const totalMin = h * 60 + m + Number(duracion);
    const hf = Math.floor(totalMin / 60) % 24;
    const mf = totalMin % 60;
    return `${String(hf).padStart(2, "0")}:${String(mf).padStart(2, "0")}`;
  }

  function handleBuscar(valor: string) {
    setQuery(valor);
    setPacienteSeleccionado(null);
    if (valor.trim().length < 2) {
      setResultados([]);
      return;
    }
    startTransitionBusqueda(async () => {
      const res = await buscarPacientesParaCita(valor);
      setResultados(res);
    });
  }

  function handleGuardar() {
    setError("");
    if (!pacienteSeleccionado) {
      setError("Selecciona un paciente.");
      return;
    }
    if (!dentistaId) {
      setError("Selecciona un dentista.");
      return;
    }
    const tipoFinal = tratamiento === "__otro__" ? tratamientoLibre.trim() : tratamiento;
    if (!tipoFinal) {
      setError("Indica el tratamiento.");
      return;
    }

    const formData = new FormData();
    formData.set("pacienteId", pacienteSeleccionado.id);
    formData.set("dentistaId", dentistaId);
    formData.set("sillon", sillon);
    formData.set("fecha", fecha);
    formData.set("horaInicio", horaInicio);
    formData.set("horaFin", calcularHoraFin());
    formData.set("tipoTratamiento", tipoFinal);
    formData.set("notas", notas);

    startTransition(async () => {
      const resultado = await crearCita({ ok: false }, formData);
      if (resultado.ok) {
        onCreada();
      } else {
        // Aquí llega, por ejemplo, el aviso de choque de horario que ya
        // valida el servidor — no duplicamos esa lógica en el cliente.
        setError(resultado.mensaje ?? "No se pudo crear la cita.");
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={onCerrar}>
      <div
        className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-clinica-azulOscuro">Nueva cita</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>}

        <div className="space-y-3">
          <div className="relative">
            <label className="block text-sm text-gray-700 mb-1">Paciente</label>
            {pacienteSeleccionado ? (
              <div className="flex items-center justify-between border border-gray-300 rounded-lg h-11 px-3">
                <span className="text-sm">{pacienteSeleccionado.nombre}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPacienteSeleccionado(null);
                    setQuery("");
                  }}
                  className="text-xs text-red-500"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleBuscar(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-clinica-azul"
                />
                {resultados.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-md w-full mt-1 max-h-40 overflow-y-auto">
                    {resultados.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setPacienteSeleccionado({ id: p.id, nombre: `${p.nombre} ${p.apellidos}` });
                            setResultados([]);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-clinica-azulClaro"
                        >
                          {p.nombre} {p.apellidos}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Tratamiento</label>
            <select
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            >
              {servicios.map((s) => (
                <option key={s.id} value={s.nombre}>
                  {s.nombre}
                </option>
              ))}
              <option value="__otro__">Otro (especificar)</option>
            </select>
            {tratamiento === "__otro__" && (
              <input
                type="text"
                value={tratamientoLibre}
                onChange={(e) => setTratamientoLibre(e.target.value)}
                placeholder="Describe el tratamiento"
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px] mt-2"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Dentista</label>
              <select
                value={dentistaId}
                onChange={(e) => setDentistaId(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
              >
                <option value="">Selecciona...</option>
                {dentistas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Sillón</label>
              <select
                value={sillon}
                onChange={(e) => setSillon(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
              >
                <option value="1">Sillón 1</option>
                <option value="2">Sillón 2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Hora inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Duración</label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
              >
                {DURACIONES.map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400">Termina a las {calcularHoraFin()}</p>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
            />
          </div>

          <button
            onClick={handleGuardar}
            disabled={isPending}
            className="w-full h-12 bg-clinica-azul text-white rounded-lg font-medium text-[16px] hover:bg-clinica-azulOscuro transition disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Crear cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
