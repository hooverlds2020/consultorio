"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearCotizacion } from "@/actions/cotizaciones";

type Servicio = { id: string; nombre: string; precioBase: string };

type Linea = { servicioId: string; cantidad: number };

export default function CotizacionForm({
  pacienteId,
  servicios,
  lineasIniciales = [],
}: {
  pacienteId: string;
  servicios: Servicio[];
  lineasIniciales?: Linea[];
}) {
  const [lineas, setLineas] = useState<Linea[]>(lineasIniciales);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const mapaServicios = new Map(servicios.map((s) => [s.id, s]));

  function agregarLinea() {
    if (servicios.length === 0) return;
    setLineas((prev) => [...prev, { servicioId: servicios[0].id, cantidad: 1 }]);
  }

  function actualizarLinea(index: number, cambios: Partial<Linea>) {
    setLineas((prev) => prev.map((l, i) => (i === index ? { ...l, ...cambios } : l)));
  }

  function quitarLinea(index: number) {
    setLineas((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lineas.reduce((suma, l) => {
    const servicio = mapaServicios.get(l.servicioId);
    if (!servicio) return suma;
    return suma + Number(servicio.precioBase) * l.cantidad;
  }, 0);

  function handleGuardar() {
    setError("");
    if (lineas.length === 0) {
      setError("Agrega al menos un servicio.");
      return;
    }
    startTransition(async () => {
      const resultado = await crearCotizacion(pacienteId, lineas);
      if (resultado.ok) {
        router.push(`/panel/pacientes/${pacienteId}/cotizaciones`);
        router.refresh();
      } else {
        setError(resultado.mensaje ?? "Error al guardar.");
      }
    });
  }

  if (servicios.length === 0) {
    return (
      <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-md p-3">
        El catálogo de servicios está vacío. Un Super Admin debe agregar servicios en{" "}
        <span className="font-medium">Catálogo</span> antes de poder crear cotizaciones.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      {error && <p className="bg-red-50 text-red-600 text-sm rounded-md p-3 mb-4">{error}</p>}

      <div className="space-y-3 mb-4">
        {lineas.map((linea, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={linea.servicioId}
              onChange={(e) => actualizarLinea(index, { servicioId: e.target.value })}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} — ${Number(s.precioBase).toLocaleString("es-MX")}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={linea.cantidad}
              onChange={(e) => actualizarLinea(index, { cantidad: Math.max(1, Number(e.target.value)) })}
              className="w-16 border border-gray-300 rounded-md px-2 py-2 text-sm text-center"
            />
            <button
              onClick={() => quitarLinea(index)}
              className="text-red-500 text-sm px-2"
              type="button"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={agregarLinea}
        type="button"
        className="text-sm text-clinica-azul hover:underline mb-4"
      >
        + Agregar servicio
      </button>

      <div className="border-t pt-4 flex items-center justify-between">
        <span className="font-semibold text-lg text-clinica-azulOscuro">
          Total: ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </span>
        <button
          onClick={handleGuardar}
          disabled={isPending}
          className="bg-clinica-azul text-white px-5 py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Crear cotización"}
        </button>
      </div>
    </div>
  );
}
