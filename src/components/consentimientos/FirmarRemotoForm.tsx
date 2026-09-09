"use client";

import { useState } from "react";
import { firmarRemoto } from "@/actions/firmaRemota";
import LienzoFirma from "@/components/consentimientos/LienzoFirma";

export default function FirmarRemotoForm({ token }: { token: string }) {
  const [firmaBase64, setFirmaBase64] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [firmado, setFirmado] = useState(false);

  async function handleFirmar() {
    if (!firmaBase64) {
      setError("Dibuja tu firma antes de continuar.");
      return;
    }
    setError("");
    setEnviando(true);
    const resultado = await firmarRemoto(token, firmaBase64);
    setEnviando(false);
    if (resultado.ok) {
      setFirmado(true);
    } else {
      setError(resultado.mensaje ?? "No se pudo registrar la firma.");
    }
  }

  if (firmado) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">✓</div>
        <h2 className="text-lg font-semibold text-green-700 mb-1">Firma registrada</h2>
        <p className="text-sm text-gray-600">
          Gracias. Tu consentimiento quedó guardado correctamente. Ya puedes cerrar esta página.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>}

      <label className="block text-sm text-gray-700 mb-1">Tu firma</label>
      <LienzoFirma onCambio={setFirmaBase64} />

      <button
        onClick={handleFirmar}
        disabled={enviando}
        className="w-full h-12 mt-4 bg-clinica-azul text-white rounded-lg font-medium text-[16px] hover:bg-clinica-azulOscuro transition disabled:opacity-60"
      >
        {enviando ? "Guardando..." : "Confirmar y firmar"}
      </button>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Al firmar, confirmas que leíste y aceptas el texto de arriba. Se registra la fecha, hora
        y dirección desde la que firmas, como respaldo del documento.
      </p>
    </div>
  );
}
