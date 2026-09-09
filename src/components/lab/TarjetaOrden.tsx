"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TIPO_TRABAJO_LABEL } from "@/lib/validaciones/orden-lab.schema";
import { listarOrdenesLab } from "@/actions/ordenesLab";

type Orden = Awaited<ReturnType<typeof listarOrdenesLab>>[number];

function diasDeRetraso(orden: Orden): number {
  if (orden.estatus === "ENTREGADO" || !orden.fechaEntregaEstimada) return 0;
  const hoy = new Date();
  const promesa = new Date(orden.fechaEntregaEstimada);
  const diffMs = hoy.getTime() - promesa.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default function TarjetaOrden({
  orden,
  onClick,
}: {
  orden: Orden;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: orden.id,
  });

  const sinPromesa = !orden.fechaEntregaEstimada;
  const diasRetraso = diasDeRetraso(orden);
  const atrasada = diasRetraso > 0;

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 50 : undefined }
    : undefined;

  let claseBorde = "bg-white border border-gray-100";
  if (atrasada) claseBorde = "bg-red-50 border-2 border-red-500";
  else if (sinPromesa) claseBorde = "bg-yellow-50 border-2 border-yellow-400";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing touch-none select-none transition ${claseBorde} ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {orden.paciente.nombre} {orden.paciente.apellidos}
          </p>
          <p className="text-sm text-clinica-azul font-medium">{TIPO_TRABAJO_LABEL[orden.tipoTrabajo]}</p>
        </div>
        {atrasada && (
          <span className="shrink-0 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
            Retrasado {diasRetraso}d
          </span>
        )}
        {sinPromesa && !atrasada && (
          <span className="shrink-0 text-[10px] font-bold bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full whitespace-nowrap">
            ⚠ Sin promesa
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
        {orden.diente && <p>Diente: {orden.diente}</p>}
        {orden.tonoDiente && <p>Tono: {orden.tonoDiente}</p>}
        {orden.material && <p>Material: {orden.material}</p>}
      </div>

      <div className="border-t mt-2 pt-2 text-[11px] text-gray-400 space-y-0.5">
        <p>Dr(a). {orden.dentista.nombre}</p>
        {orden.fechaEntregaEstimada && (
          <p className={atrasada ? "text-red-600 font-semibold" : ""}>
            Promesa: {new Date(orden.fechaEntregaEstimada).toLocaleDateString("es-MX")}
          </p>
        )}
        {orden.tecnicoAsignado && <p>Técnico: {orden.tecnicoAsignado.nombre}</p>}
      </div>
    </div>
  );
}
