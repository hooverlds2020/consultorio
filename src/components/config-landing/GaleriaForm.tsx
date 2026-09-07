"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useRef, useEffect } from "react";
import { subirImagenGaleria } from "@/actions/landing";
import type { EstadoLanding } from "@/actions/landing";

const estadoInicial: EstadoLanding = { ok: false };

function BotonSubir() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-4 py-2 rounded-md text-sm hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Subiendo..." : "Subir a la galería"}
    </button>
  );
}

export default function GaleriaForm() {
  const [estado, formAction] = useFormState(subirImagenGaleria, estadoInicial);
  const [tipo, setTipo] = useState<"GENERAL" | "ANTES_DESPUES">("GENERAL");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-lg shadow-sm p-5 space-y-3">
      {estado.mensaje && <p className="text-red-600 text-sm">{estado.mensaje}</p>}

      <div>
        <label className="block text-xs text-gray-600 mb-1">Tipo</label>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "GENERAL" | "ANTES_DESPUES")}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="GENERAL">Foto general</option>
          <option value="ANTES_DESPUES">Antes / Después</option>
        </select>
      </div>

      {tipo === "GENERAL" ? (
        <div>
          <label className="block text-xs text-gray-600 mb-1">Imagen</label>
          <input type="file" name="imagenGeneral" accept="image/*" className="text-sm" />
        </div>
      ) : (
        <>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Imagen "Antes"</label>
            <input type="file" name="imagenAntes" accept="image/*" className="text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Imagen "Después"</label>
            <input type="file" name="imagenDespues" accept="image/*" className="text-sm" />
          </div>
        </>
      )}

      <BotonSubir />
    </form>
  );
}
