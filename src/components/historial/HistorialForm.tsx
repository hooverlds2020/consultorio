"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRef, useEffect } from "react";
import type { EstadoHistorial } from "@/actions/historial";

const estadoInicial: EstadoHistorial = { ok: false };

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-5 py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Agregar entrada"}
    </button>
  );
}

export default function HistorialForm({
  accion,
}: {
  accion: (prevState: EstadoHistorial, formData: FormData) => Promise<EstadoHistorial>;
}) {
  const [estado, formAction] = useFormState(accion, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) {
      formRef.current?.reset();
    }
  }, [estado.ok]);

  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-lg shadow-sm p-5 space-y-4">
      <h3 className="font-medium text-clinica-azulOscuro">Nueva entrada</h3>

      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{estado.mensaje}</p>
      )}
      {estado.ok && <p className="text-green-600 text-sm">Entrada guardada ✓</p>}

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          Notas <span className="text-red-500">*</span>
        </label>
        <textarea
          name="notas"
          rows={4}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
          placeholder="Diagnóstico, tratamiento realizado, observaciones..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          Radiografías (jpg, png, webp, pdf — máx. 15MB c/u)
        </label>
        <input
          type="file"
          name="radiografias"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          className="w-full text-sm"
        />
      </div>

      <BotonGuardar />
    </form>
  );
}
