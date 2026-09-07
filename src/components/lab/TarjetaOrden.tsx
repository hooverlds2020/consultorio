"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cambiarEstatusOrdenLab, asignarTecnico, listarOrdenesLab, listarTecnicosLab } from "@/actions/ordenesLab";
import { TIPO_TRABAJO_LABEL, ESTATUS_LAB_LABEL, ORDEN_ESTATUS_LAB } from "@/lib/validaciones/orden-lab.schema";
import type { EstatusOrdenLab } from "@prisma/client";

type Orden = Awaited<ReturnType<typeof listarOrdenesLab>>[number];
type Tecnico = Awaited<ReturnType<typeof listarTecnicosLab>>[number];

export default function TarjetaOrden({
  orden,
  tecnicos,
  puedeAsignar,
}: {
  orden: Orden;
  tecnicos: Tecnico[];
  puedeAsignar: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleEstatus(nuevoEstatus: string) {
    startTransition(async () => {
      await cambiarEstatusOrdenLab(orden.id, nuevoEstatus as EstatusOrdenLab);
      router.refresh();
    });
  }

  function handleTecnico(tecnicoId: string) {
    startTransition(async () => {
      await asignarTecnico(orden.id, tecnicoId);
      router.refresh();
    });
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${isPending ? "opacity-50" : ""}`}>
      <p className="font-medium text-gray-800">
        {orden.paciente.nombre} {orden.paciente.apellidos}
      </p>
      <p className="text-sm text-clinica-azul">{TIPO_TRABAJO_LABEL[orden.tipoTrabajo]}</p>
      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
        {orden.diente && <p>Diente: {orden.diente}</p>}
        {orden.tonoDiente && <p>Tono: {orden.tonoDiente}</p>}
        {orden.material && <p>Material: {orden.material}</p>}
        <p>Dr(a). {orden.dentista.nombre}</p>
        <p>Solicitado: {new Date(orden.fechaSolicitud).toLocaleDateString("es-MX")}</p>
      </div>
      {orden.notas && <p className="text-xs text-gray-500 mt-2 italic">{orden.notas}</p>}

      <div className="mt-3 space-y-2">
        <select
          value={orden.estatus}
          onChange={(e) => handleEstatus(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1"
        >
          {ORDEN_ESTATUS_LAB.map((e) => (
            <option key={e} value={e}>
              {ESTATUS_LAB_LABEL[e]}
            </option>
          ))}
        </select>

        {puedeAsignar && (
          <select
            value={orden.tecnicoAsignado?.id ?? ""}
            onChange={(e) => handleTecnico(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1"
          >
            <option value="">Sin técnico asignado</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        )}
        {!puedeAsignar && orden.tecnicoAsignado && (
          <p className="text-xs text-gray-400">Técnico: {orden.tecnicoAsignado.nombre}</p>
        )}
      </div>
    </div>
  );
}
