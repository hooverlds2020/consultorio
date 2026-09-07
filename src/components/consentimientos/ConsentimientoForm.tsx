"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useRef, useEffect } from "react";
import { crearConsentimiento } from "@/actions/consentimientos";
import type { EstadoConsentimiento } from "@/actions/consentimientos";
import { PLANTILLAS_CONSENTIMIENTO, TIPOS_CONSENTIMIENTO } from "@/lib/plantillas-consentimiento";
import LienzoFirma from "./LienzoFirma";

const estadoInicial: EstadoConsentimiento = { ok: false };

function BotonGuardar({ firmaLista }: { firmaLista: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || !firmaLista}
      className="bg-clinica-azul text-white px-5 py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-50"
    >
      {pending ? "Guardando..." : "Guardar consentimiento firmado"}
    </button>
  );
}

export default function ConsentimientoForm({
  accion,
  onCreado,
}: {
  accion: (prevState: EstadoConsentimiento, formData: FormData) => Promise<EstadoConsentimiento>;
  onCreado: () => void;
}) {
  const [estado, formAction] = useFormState(accion, estadoInicial);
  const [tipo, setTipo] = useState(TIPOS_CONSENTIMIENTO[0]);
  const [texto, setTexto] = useState(PLANTILLAS_CONSENTIMIENTO[TIPOS_CONSENTIMIENTO[0]]);
  const [firmaBase64, setFirmaBase64] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) {
      formRef.current?.reset();
      setFirmaBase64(null);
      setTipo(TIPOS_CONSENTIMIENTO[0]);
      setTexto(PLANTILLAS_CONSENTIMIENTO[TIPOS_CONSENTIMIENTO[0]]);
      onCreado();
    }
  }, [estado.ok, onCreado]);

  function handleCambiarTipo(nuevoTipo: string) {
    setTipo(nuevoTipo);
    setTexto(PLANTILLAS_CONSENTIMIENTO[nuevoTipo]);
  }

  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-lg shadow-sm p-5 space-y-4">
      <h3 className="font-medium text-clinica-azulOscuro">Nuevo consentimiento</h3>

      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{estado.mensaje}</p>
      )}

      <div>
        <label className="block text-sm text-gray-700 mb-1">Tipo de tratamiento</label>
        <select
          name="tipoTratamiento"
          value={tipo}
          onChange={(e) => handleCambiarTipo(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        >
          {TIPOS_CONSENTIMIENTO.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          Texto del consentimiento (puedes editarlo)
        </label>
        <textarea
          name="textoConsentimiento"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Firma del paciente</label>
        <LienzoFirma onCambio={setFirmaBase64} />
      </div>

      <input type="hidden" name="firmaBase64" value={firmaBase64 ?? ""} />

      <BotonGuardar firmaLista={!!firmaBase64} />
    </form>
  );
}
