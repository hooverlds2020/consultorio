"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRef, useEffect } from "react";
import { crearServicio } from "@/actions/catalogo";
import type { EstadoCatalogo } from "@/actions/catalogo";

const estadoInicial: EstadoCatalogo = { ok: false };

function BotonAgregar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-4 py-2 rounded-md text-sm hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Agregando..." : "Agregar servicio"}
    </button>
  );
}

export default function ServicioForm() {
  const [estado, formAction] = useFormState(crearServicio, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-3 bg-white rounded-lg shadow-sm p-4">
      {estado.mensaje && <p className="text-red-600 text-sm">{estado.mensaje}</p>}
      <div className="flex-1">
        <label className="block text-xs text-gray-600 mb-1">Nombre del servicio</label>
        <input
          type="text"
          name="nombre"
          required
          placeholder="Ej. Limpieza dental"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
      </div>
      <div className="w-40">
        <label className="block text-xs text-gray-600 mb-1">Precio (MXN)</label>
        <input
          type="number"
          name="precioBase"
          step="0.01"
          min="0"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
      </div>
      <BotonAgregar />
    </form>
  );
}
