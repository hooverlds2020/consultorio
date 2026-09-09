"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import type { EstadoOrdenLab } from "@/actions/ordenesLab";
import { buscarPacientesParaOrden, crearOrdenLab } from "@/actions/ordenesLab";
import { TIPO_TRABAJO_LABEL } from "@/lib/validaciones/orden-lab.schema";

const estadoInicial: EstadoOrdenLab = { ok: false };

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 px-5 bg-clinica-azul text-white rounded-lg font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60 w-full"
    >
      {pending ? "Creando..." : "Crear orden"}
    </button>
  );
}

export default function NuevaOrdenForm({ onCreada }: { onCreada: () => void }) {
  const [estado, formAction] = useFormState(crearOrdenLab, estadoInicial);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<{ id: string; nombre: string; apellidos: string }[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<{ id: string; nombre: string } | null>(null);
  const [fechaPromesa, setFechaPromesa] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) {
      // No reseteamos de inmediato si hay fecha promesa: dejamos ver la
      // sugerencia de ir a Agenda antes de limpiar el formulario.
      if (!fechaPromesa) {
        formRef.current?.reset();
        setPacienteSeleccionado(null);
        setQuery("");
        onCreada();
      }
    }
  }, [estado.ok, fechaPromesa, onCreada]);

  function handleBuscar(valor: string) {
    setQuery(valor);
    setPacienteSeleccionado(null);
    if (valor.trim().length < 2) {
      setResultados([]);
      return;
    }
    startTransition(async () => {
      const res = await buscarPacientesParaOrden(valor);
      setResultados(res);
    });
  }

  if (estado.ok && fechaPromesa) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5 text-center">
        <p className="text-green-600 font-medium mb-3">Orden creada ✓</p>
        <p className="text-sm text-gray-600 mb-4">
          Le prometiste al paciente entregar el {new Date(`${fechaPromesa}T12:00:00`).toLocaleDateString("es-MX")}.
          ¿Reservamos ese día en la Agenda para la entrega?
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href={`/panel/agenda?fecha=${fechaPromesa}`}
            className="h-11 flex items-center justify-center bg-clinica-azul text-white rounded-lg font-medium hover:bg-clinica-azulOscuro transition"
          >
            Ir a Agenda esa fecha →
          </Link>
          <button
            onClick={() => {
              setFechaPromesa("");
              onCreada();
            }}
            className="h-11 text-sm text-gray-500 hover:underline"
          >
            Ahora no, solo cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-lg shadow-sm p-5 space-y-4">
      <h3 className="font-medium text-clinica-azulOscuro">Nueva orden</h3>

      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{estado.mensaje}</p>
      )}

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
        <input type="hidden" name="pacienteId" value={pacienteSeleccionado?.id ?? ""} />
        {estado.errores?.pacienteId && (
          <p className="text-red-500 text-xs mt-1">{estado.errores.pacienteId[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Tipo de trabajo</label>
        <select
          name="tipoTrabajo"
          required
          defaultValue=""
          className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        >
          <option value="" disabled>
            Selecciona...
          </option>
          {Object.entries(TIPO_TRABAJO_LABEL).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Diente</label>
          <input
            type="text"
            name="diente"
            placeholder="16"
            className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Tono</label>
          <input
            type="text"
            name="tonoDiente"
            placeholder="A2"
            className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Material</label>
          <input
            type="text"
            name="material"
            placeholder="Zirconia"
            className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          Fecha promesa de entrega
        </label>
        <input
          type="date"
          name="fechaEntregaEstimada"
          value={fechaPromesa}
          onChange={(e) => setFechaPromesa(e.target.value)}
          className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
        />
        <p className="text-xs text-gray-400 mt-1">
          Sin esto no puedes saber si una orden va atrasada.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Costo del laboratorio (MXN)</label>
          <input
            type="number"
            name="costoLaboratorio"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Anticipo ya pagado (MXN)</label>
          <input
            type="number"
            name="anticipoLaboratorio"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Notas</label>
        <textarea
          name="notas"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
        />
      </div>

      <BotonCrear />
    </form>
  );
}
