"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DientesJson } from "@/lib/odontograma";
import { guardarOdontograma } from "@/actions/odontograma";
import { calcularDiff, formatearDiff, type CambioDiente } from "./historialUtils";
import OdontogramaEditor from "./OdontogramaEditor";

export type VersionHistorial = {
  id: string;
  fecha: string;
  dentistaNombre: string;
  motivo: string | null;
  diff: CambioDiente[];
  dientes: DientesJson;
};

export default function OdontogramaConHistorial({
  pacienteId,
  tipo,
  dientesActuales,
  soloLectura,
  versiones,
}: {
  pacienteId: string;
  tipo: "ADULTO_32" | "INFANTIL_20";
  dientesActuales: DientesJson;
  soloLectura: boolean;
  versiones: VersionHistorial[];
}) {
  const [versionEnVisualizacion, setVersionEnVisualizacion] = useState<VersionHistorial | null>(null);
  const [isPending, startTransition] = useTransition();
  const [restaurandoId, setRestaurandoId] = useState<string | null>(null);
  const router = useRouter();

  function handleRestaurar(version: VersionHistorial) {
    setRestaurandoId(version.id);
    startTransition(async () => {
      const diff = calcularDiff(dientesActuales, version.dientes);
      const motivo = `Restaurado de versión del ${new Date(version.fecha).toLocaleDateString("es-MX")}`;
      const resultado = await guardarOdontograma(pacienteId, tipo, version.dientes, motivo, diff);
      setRestaurandoId(null);
      if (resultado.ok) {
        setVersionEnVisualizacion(null);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <OdontogramaEditor
        pacienteId={pacienteId}
        tipo={tipo}
        dientesIniciales={dientesActuales}
        soloLectura={soloLectura}
        versionEnVisualizacion={
          versionEnVisualizacion
            ? { fecha: versionEnVisualizacion.fecha, dientes: versionEnVisualizacion.dientes }
            : null
        }
        onVolverAEditar={() => setVersionEnVisualizacion(null)}
      />

      {versiones.length > 0 && (
        <div className="mt-8">
          <h2 className="font-medium text-clinica-azulOscuro mb-3">Versiones anteriores</h2>
          <div className="space-y-2">
            {versiones.map((v) => (
              <div key={v.id} className="bg-white rounded-lg shadow-sm p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-gray-700">
                      <span className="font-medium">
                        {new Date(v.fecha).toLocaleString("es-MX", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>{" "}
                      — {v.dentistaNombre}
                    </p>
                    <p className="text-gray-600 mt-0.5">
                      Motivo: {v.motivo || "(no especificado — versión anterior a este registro)"}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Cambios: {formatearDiff(v.diff)}
                    </p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => setVersionEnVisualizacion(v)}
                      className="h-9 px-3 text-xs text-clinica-azul border border-clinica-azul rounded-lg hover:bg-clinica-azulClaro transition"
                    >
                      Ver historial
                    </button>
                    {!soloLectura && (
                      <button
                        onClick={() => handleRestaurar(v)}
                        disabled={isPending}
                        className="h-9 px-3 text-xs text-white bg-clinica-azul rounded-lg hover:bg-clinica-azulOscuro transition disabled:opacity-60"
                      >
                        {restaurandoId === v.id ? "Restaurando..." : "Restaurar esta versión"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
