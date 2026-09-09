"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRef, useEffect } from "react";
import type { EstadoHistorial } from "@/actions/historial";
import DropzoneArchivos from "@/components/pacientes/DropzoneArchivos";

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

const CAMPOS_SOAP = [
  { name: "soapS", label: "S — Subjetivo", placeholder: "Lo que refiere el paciente (dolor, molestia, motivo de consulta)..." },
  { name: "soapO", label: "O — Objetivo", placeholder: "Hallazgos clínicos observados por el dentista..." },
  { name: "soapA", label: "A — Análisis", placeholder: "Diagnóstico o valoración..." },
  { name: "soapP", label: "P — Plan", placeholder: "Tratamiento realizado o siguiente paso..." },
];

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
      <h3 className="font-medium text-clinica-azulOscuro">Nueva entrada — nota de evolución (SOAP)</h3>

      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{estado.mensaje}</p>
      )}
      {estado.ok && <p className="text-green-600 text-sm">Entrada guardada ✓</p>}

      {CAMPOS_SOAP.map((campo) => (
        <div key={campo.name}>
          <label className="block text-sm text-gray-700 mb-1">{campo.label}</label>
          <textarea
            name={campo.name}
            rows={2}
            placeholder={campo.placeholder}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-clinica-azul"
          />
        </div>
      ))}
      <p className="text-xs text-gray-400 -mt-2">
        Llena al menos un campo. No es obligatorio usar los cuatro.
      </p>

      <DropzoneArchivos
        name="radiografias"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        label="Radiografías (jpg, png, webp, pdf — máx. 15MB c/u)"
      />

      <BotonGuardar />
    </form>
  );
}
