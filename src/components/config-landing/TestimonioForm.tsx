"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRef, useEffect } from "react";
import { crearTestimonio } from "@/actions/landing";
import type { EstadoLanding } from "@/actions/landing";

const estadoInicial: EstadoLanding = { ok: false };

function BotonAgregar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-4 py-2 rounded-md text-sm hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Agregando..." : "Agregar testimonio"}
    </button>
  );
}

export default function TestimonioForm() {
  const [estado, formAction] = useFormState(crearTestimonio, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-lg shadow-sm p-5 space-y-3">
      {estado.mensaje && <p className="text-red-600 text-sm">{estado.mensaje}</p>}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Nombre del paciente</label>
        <input
          type="text"
          name="nombrePaciente"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Testimonio</label>
        <textarea
          name="texto"
          required
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Calificación (1-5, opcional)</label>
        <input
          type="number"
          name="calificacion"
          min={1}
          max={5}
          className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <BotonAgregar />
    </form>
  );
}
