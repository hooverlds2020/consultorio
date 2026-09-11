"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRef, useEffect } from "react";
import { crearInsumo } from "@/actions/inventario";
import { UNIDADES_MEDIDA } from "@/lib/validaciones/insumo.schema";
import type { EstadoInventario } from "@/actions/inventario";

const estadoInicial: EstadoInventario = { ok: false };

function BotonAgregar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-4 py-2 rounded-md text-sm hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Agregando..." : "Agregar insumo"}
    </button>
  );
}

export default function InsumoForm() {
  const [estado, formAction] = useFormState(crearInsumo, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
      {estado.mensaje && (
        <p className="md:col-span-5 text-red-600 text-sm">{estado.mensaje}</p>
      )}
      <div className="md:col-span-2">
        <label className="block text-xs text-gray-600 mb-1">Nombre</label>
        <input
          type="text"
          name="nombre"
          required
          placeholder="Ej. Resina A2"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Unidad</label>
        <select
          name="unidadMedida"
          required
          defaultValue=""
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Selecciona...
          </option>
          {UNIDADES_MEDIDA.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Stock inicial</label>
        <input
          type="number"
          name="stockInicial"
          step="0.01"
          min="0"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Stock mínimo</label>
        <input
          type="number"
          name="stockMinimo"
          step="0.01"
          min="0"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <div className="md:col-span-5">
        <BotonAgregar />
      </div>
    </form>
  );
}
