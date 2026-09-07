"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { EstadoLanding } from "@/actions/landing";

const estadoInicial: EstadoLanding = { ok: false };

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-5 py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

export type CampoConfig = {
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
};

export default function ConfigSeccionForm({
  accion,
  campos,
  valoresIniciales,
}: {
  accion: (prevState: EstadoLanding, formData: FormData) => Promise<EstadoLanding>;
  campos: CampoConfig[];
  valoresIniciales: Record<string, string>;
}) {
  const [estado, formAction] = useFormState(accion, estadoInicial);

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-sm p-6 space-y-4 max-w-xl">
      {estado.ok && <p className="text-green-600 text-sm">Guardado ✓</p>}
      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{estado.mensaje}</p>
      )}

      {campos.map((campo) => (
        <div key={campo.name}>
          <label className="block text-sm text-gray-700 mb-1">{campo.label}</label>
          {campo.textarea ? (
            <textarea
              name={campo.name}
              defaultValue={valoresIniciales[campo.name] ?? ""}
              placeholder={campo.placeholder}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
            />
          ) : (
            <input
              type="text"
              name={campo.name}
              defaultValue={valoresIniciales[campo.name] ?? ""}
              placeholder={campo.placeholder}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
            />
          )}
        </div>
      ))}

      <BotonGuardar />
    </form>
  );
}
