"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { guardarLogoNegocio } from "@/actions/marca";
import type { EstadoMarca } from "@/actions/marca";

const estadoInicial: EstadoMarca = { ok: false };

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 px-5 bg-clinica-azul text-white rounded-lg font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Subiendo..." : "Guardar logo"}
    </button>
  );
}

export default function LogoNegocioForm({ logoActual }: { logoActual: string | null }) {
  const [estado, formAction] = useFormState(guardarLogoNegocio, estadoInicial);
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 max-w-md">
      <p className="text-sm text-gray-500 mb-3">
        Se usa en el inicio de sesión, el panel, la página pública, y el PDF de cotizaciones.
      </p>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Logo actual</p>
        {logoActual ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoActual} alt="Logo actual" className="max-h-24 border rounded-lg p-2" />
        ) : (
          <p className="text-sm text-gray-400 italic">
            Ninguno guardado todavía — se está usando el logo por defecto del sistema.
          </p>
        )}
      </div>

      <form action={formAction} className="space-y-3">
        {estado.ok && <p className="text-green-600 text-sm">Guardado ✓ — recarga la página para verlo actualizado en todos lados.</p>}
        {estado.mensaje && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{estado.mensaje}</p>}

        <div>
          <label className="block text-sm text-gray-700 mb-1">Nueva imagen (PNG con fondo transparente recomendado)</label>
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              setPrevisualizacion(archivo ? URL.createObjectURL(archivo) : null);
            }}
            className="text-sm"
          />
        </div>

        {previsualizacion && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Vista previa</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previsualizacion} alt="Vista previa" className="max-h-24 border rounded-lg p-2" />
          </div>
        )}

        <BotonGuardar />
      </form>
    </div>
  );
}
