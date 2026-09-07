"use client";

import { useRouter } from "next/navigation";
import { crearConsentimiento } from "@/actions/consentimientos";
import ConsentimientoForm from "./ConsentimientoForm";

export default function ConsentimientosCliente({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const accion = crearConsentimiento.bind(null, pacienteId);

  return <ConsentimientoForm accion={accion} onCreado={() => router.refresh()} />;
}
