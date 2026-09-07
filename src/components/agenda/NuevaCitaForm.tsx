"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useTransition, useEffect, useRef } from "react";
import type { EstadoCita } from "@/actions/agenda";
import { buscarPacientesParaCita } from "@/actions/agenda";

type Dentista = { id: string; nombre: string };

const estadoInicial: EstadoCita = { ok: false };

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-5 py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Crear cita"}
    </button>
  );
}

export default function NuevaCitaForm({
  accion,
  dentistas,
  fechaInicial,
  onCreada,
}: {
  accion: (prevState: EstadoCita, formData: FormData) => Promise<EstadoCita>;
  dentistas: Dentista[];
  fechaInicial: string;
  onCreada: () => void;
}) {
  const [estado, formAction] = useFormState(accion, estadoInicial);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<{ id: string; nombre: string; apellidos: string }[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<{ id: string; nombre: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) {
      formRef.current?.reset();
      setPacienteSeleccionado(null);
      setQuery("");
      onCreada();
    }
  }, [estado.ok, onCreada]);

  function handleBuscar(valor: string) {
    setQuery(valor);
    setPacienteSeleccionado(null);
    if (valor.trim().length < 2) {
      setResultados([]);
      return;
    }
    startTransition(async () => {
      const res = await buscarPacientesParaCita(valor);
      setResultados(res);
    });
  }

  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-lg shadow-sm p-5 space-y-4">
      <h3 className="font-medium text-clinica-azulOscuro">Nueva cita</h3>

      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{estado.mensaje}</p>
      )}

      <div className="relative">
        <label className="block text-sm text-gray-700 mb-1">Paciente</label>
        {pacienteSeleccionado ? (
          <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2">
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
              placeholder="Buscar paciente por nombre..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
            />
            {resultados.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-md w-full mt-1 max-h-40 overflow-y-auto">
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
        <input type="hidden" name="pacienteId" value={pacienteSeleccionado?.id ?? ""} />
        {estado.errores?.pacienteId && (
          <p className="text-red-500 text-xs mt-1">{estado.errores.pacienteId[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Dentista</label>
        <select
          name="dentistaId"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
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
          name="sillon"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        >
          <option value="1">Sillón 1</option>
          <option value="2">Sillón 2</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Fecha</label>
        <input
          type="date"
          name="fecha"
          defaultValue={fechaInicial}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Hora inicio</label>
          <input
            type="time"
            name="horaInicio"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Hora fin</label>
          <input
            type="time"
            name="horaFin"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Tipo de tratamiento</label>
        <input
          type="text"
          name="tipoTratamiento"
          placeholder="Ej. Limpieza dental"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Notas (opcional)</label>
        <textarea
          name="notas"
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
      </div>

      <BotonGuardar />
    </form>
  );
}
