"use client";

import { useState } from "react";
import { crearSolicitudFirmaRemota } from "@/actions/firmaRemota";
import { PLANTILLAS_CONSENTIMIENTO, TIPOS_CONSENTIMIENTO } from "@/lib/plantillas-consentimiento";

export default function SolicitudFirmaRemotaForm({
  pacienteId,
  onEnviado,
}: {
  pacienteId: string;
  onEnviado: () => void;
}) {
  const [tipo, setTipo] = useState(TIPOS_CONSENTIMIENTO[0]);
  const [texto, setTexto] = useState(PLANTILLAS_CONSENTIMIENTO[TIPOS_CONSENTIMIENTO[0]]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [linkWhatsapp, setLinkWhatsapp] = useState<string | null>(null);

  function handleCambiarTipo(nuevoTipo: string) {
    setTipo(nuevoTipo);
    setTexto(PLANTILLAS_CONSENTIMIENTO[nuevoTipo]);
  }

  async function handleGenerar() {
    setError("");
    setEnviando(true);
    const resultado = await crearSolicitudFirmaRemota(pacienteId, tipo, texto);
    setEnviando(false);
    if (resultado.ok && resultado.linkWhatsapp) {
      setLinkWhatsapp(resultado.linkWhatsapp);
      onEnviado();
    } else {
      setError(resultado.mensaje ?? "No se pudo generar el enlace.");
    }
  }

  if (linkWhatsapp) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600 mb-3">
          Listo. Abre WhatsApp para enviarle el enlace de firma al paciente.
        </p>
        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block h-11 px-5 leading-[44px] bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          Abrir WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</p>}

      <div>
        <label className="block text-sm text-gray-700 mb-1">Tipo de tratamiento</label>
        <select
          value={tipo}
          onChange={(e) => handleCambiarTipo(e.target.value)}
          className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-clinica-azul"
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
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
      </div>

      <button
        onClick={handleGenerar}
        disabled={enviando}
        className="w-full h-12 bg-clinica-azul text-white rounded-lg font-medium text-[16px] hover:bg-clinica-azulOscuro transition disabled:opacity-60"
      >
        {enviando ? "Generando..." : "Generar enlace y enviar por WhatsApp"}
      </button>
      <p className="text-xs text-gray-400 text-center">
        El paciente necesita tener WhatsApp registrado en su ficha. El enlace expira en 72 horas.
      </p>
    </div>
  );
}
