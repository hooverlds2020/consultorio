"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { aceptarCotizacion, rechazarCotizacion } from "@/actions/cotizaciones";

export default function AccionesCotizacion({ cotizacionId }: { cotizacionId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAceptar() {
    startTransition(async () => {
      const resultado = await aceptarCotizacion(cotizacionId);
      if (resultado.ok) router.refresh();
    });
  }

  function handleRechazar() {
    startTransition(async () => {
      const resultado = await rechazarCotizacion(cotizacionId);
      if (resultado.ok) router.refresh();
    });
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleAceptar}
        disabled={isPending}
        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition disabled:opacity-60"
      >
        Aceptar cotización
      </button>
      <button
        onClick={handleRechazar}
        disabled={isPending}
        className="border border-red-300 text-red-600 px-4 py-2 rounded-md text-sm hover:bg-red-50 transition disabled:opacity-60"
      >
        Rechazar
      </button>
    </div>
  );
}
