"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearConsentimiento } from "@/actions/consentimientos";
import ConsentimientoForm from "./ConsentimientoForm";
import SolicitudFirmaRemotaForm from "./SolicitudFirmaRemotaForm";

export default function ConsentimientosCliente({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const accion = crearConsentimiento.bind(null, pacienteId);
  const [modo, setModo] = useState<"presencial" | "remoto">("presencial");

  return (
    <div>
      <div className="flex w-full bg-gray-100 rounded-xl p-1 mb-4">
        <button
          onClick={() => setModo("presencial")}
          className={`flex-1 h-10 rounded-lg text-sm font-medium transition ${
            modo === "presencial" ? "bg-clinica-azul text-white" : "text-gray-600"
          }`}
        >
          Firmar aquí ahora
        </button>
        <button
          onClick={() => setModo("remoto")}
          className={`flex-1 h-10 rounded-lg text-sm font-medium transition ${
            modo === "remoto" ? "bg-clinica-azul text-white" : "text-gray-600"
          }`}
        >
          Enviar por WhatsApp
        </button>
      </div>

      {modo === "presencial" ? (
        <ConsentimientoForm accion={accion} onCreado={() => router.refresh()} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-5">
          <SolicitudFirmaRemotaForm pacienteId={pacienteId} onEnviado={() => router.refresh()} />
        </div>
      )}
    </div>
  );
}
