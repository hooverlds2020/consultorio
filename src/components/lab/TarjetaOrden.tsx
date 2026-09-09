"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TIPO_TRABAJO_LABEL } from "@/lib/validaciones/orden-lab.schema";
import { listarOrdenesLab } from "@/actions/ordenesLab";

type Orden = Awaited<ReturnType<typeof listarOrdenesLab>>[number];

function estaAtrasada(orden: Orden): boolean {
  if (orden.estatus === "ENTREGADO" || !orden.fechaEntregaEstimada) return false;
  return new Date(orden.fechaEntregaEstimada) < new Date();
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

  const atrasada = estaAtrasada(orden);

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 50 : undefined }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing touch-none select-none transition ${
        atrasada ? "bg-red-50 border-2 border-red-300" : "bg-white border border-gray-100"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <p className="font-semibold text-gray-800 text-sm truncate">
        {orden.paciente.nombre} {orden.paciente.apellidos}
      </p>
      <p className="text-sm text-clinica-azul font-medium">{TIPO_TRABAJO_LABEL[orden.tipoTrabajo]}</p>

      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
        {orden.diente && <p>Diente: {orden.diente}</p>}
        {orden.tonoDiente && <p>Tono: {orden.tonoDiente}</p>}
        {orden.material && <p>Material: {orden.material}</p>}
      </div>

      <div className="border-t mt-2 pt-2 text-[11px] text-gray-400 space-y-0.5">
        <p>Dr(a). {orden.dentista.nombre}</p>
        {orden.fechaEntregaEstimada ? (
          <p className={atrasada ? "text-red-600 font-semibold" : ""}>
            Promesa: {new Date(orden.fechaEntregaEstimada).toLocaleDateString("es-MX")}
            {atrasada && " — ATRASADA"}
          </p>
        ) : (
          <p className="italic">Sin fecha promesa</p>
        )}
        {orden.tecnicoAsignado && <p>Técnico: {orden.tecnicoAsignado.nombre}</p>}
      </div>
    </div>
  );
}
