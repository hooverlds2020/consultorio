"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { listarOrdenesLab, listarTecnicosLab, cambiarEstatusOrdenLab } from "@/actions/ordenesLab";
import { ORDEN_ESTATUS_LAB, ESTATUS_LAB_LABEL } from "@/lib/validaciones/orden-lab.schema";
import type { EstatusOrdenLab } from "@prisma/client";
import TarjetaOrden from "./TarjetaOrden";
import DetalleOrdenModal from "./DetalleOrdenModal";
import NuevaOrdenForm from "./NuevaOrdenForm";

type Orden = Awaited<ReturnType<typeof listarOrdenesLab>>[number];
type Tecnico = Awaited<ReturnType<typeof listarTecnicosLab>>[number];

function Columna({
  estatus,
  ordenes,
  onClickOrden,
}: {
  estatus: EstatusOrdenLab;
  ordenes: Orden[];
  onClickOrden: (orden: Orden) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estatus });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-3 transition min-h-[120px] ${
        isOver ? "bg-clinica-azulClaro ring-2 ring-clinica-azul" : "bg-gray-50"
      }`}
    >
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        {ESTATUS_LAB_LABEL[estatus]} ({ordenes.length})
      </h3>
      <div className="space-y-3">
        {ordenes.length === 0 && <p className="text-xs text-gray-400">Sin órdenes</p>}
        {ordenes.map((orden) => (
          <TarjetaOrden key={orden.id} orden={orden} onClick={() => onClickOrden(orden)} />
        ))}
      </div>
    </div>
  );
}

export default function TableroOrdenesLab({
  ordenes,
  tecnicos,
  puedeCrear,
  resumenDeuda,
}: {
  ordenes: Orden[];
  tecnicos: Tecnico[];
  puedeCrear: boolean;
  resumenDeuda: { totalAdeudado: number; cantidadOrdenes: number };
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(null);
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [soloRetrasadas, setSoloRetrasadas] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  function handleCreada() {
    setMostrarForm(false);
    router.refresh();
  }

  function handleDragEnd(event: DragEndEvent) {
    const nuevoEstatus = event.over?.id as EstatusOrdenLab | undefined;
    const ordenId = event.active.id as string;
    if (!nuevoEstatus) return;

    const ordenActual = ordenes.find((o) => o.id === ordenId);
    if (!ordenActual || ordenActual.estatus === nuevoEstatus) return;

    startTransition(async () => {
      await cambiarEstatusOrdenLab(ordenId, nuevoEstatus);
      router.refresh();
    });
  }

  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((o) => {
      if (filtroTecnico && o.tecnicoAsignado?.id !== filtroTecnico) return false;
      if (soloRetrasadas) {
        const atrasada =
          o.estatus !== "ENTREGADO" &&
          o.fechaEntregaEstimada &&
          new Date(o.fechaEntregaEstimada) < new Date();
        if (!atrasada) return false;
      }
      return true;
    });
  }, [ordenes, filtroTecnico, soloRetrasadas]);

  return (
    <div>
      {resumenDeuda.cantidadOrdenes > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-orange-800">
            Le debes al laboratorio externo{" "}
            <span className="font-bold">
              ${resumenDeuda.totalAdeudado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>{" "}
            en {resumenDeuda.cantidadOrdenes} orden(es) sin entregar.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filtroTecnico}
          onChange={(e) => setFiltroTecnico(e.target.value)}
          className="h-10 border border-gray-300 rounded-lg px-3 text-sm"
        >
          <option value="">Todos los técnicos</option>
          {tecnicos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSoloRetrasadas(!soloRetrasadas)}
          className={`h-10 px-3 rounded-lg text-sm font-medium transition ${
            soloRetrasadas ? "bg-red-100 text-red-700 border border-red-300" : "border border-gray-300 text-gray-600"
          }`}
        >
          Solo retrasadas
        </button>

        {puedeCrear && (
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="h-10 px-4 bg-clinica-azul text-white rounded-lg text-sm font-medium hover:bg-clinica-azulOscuro transition ml-auto"
          >
            {mostrarForm ? "Cerrar formulario" : "+ Nueva orden"}
          </button>
        )}
      </div>

      {mostrarForm && (
        <div className="mb-6 max-w-md">
          <NuevaOrdenForm onCreada={handleCreada} />
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isPending ? "opacity-60" : ""}`}>
          {ORDEN_ESTATUS_LAB.map((estatus) => (
            <Columna
              key={estatus}
              estatus={estatus}
              ordenes={ordenesFiltradas.filter((o) => o.estatus === estatus)}
              onClickOrden={setOrdenSeleccionada}
            />
          ))}
        </div>
      </DndContext>

      {ordenSeleccionada && (
        <DetalleOrdenModal
          orden={ordenSeleccionada}
          tecnicos={tecnicos}
          onCerrar={() => setOrdenSeleccionada(null)}
        />
      )}
    </div>
  );
}
