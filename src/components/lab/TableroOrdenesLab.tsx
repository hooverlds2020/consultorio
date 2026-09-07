"use client";

import { useState } from "react";
import { listarOrdenesLab, listarTecnicosLab } from "@/actions/ordenesLab";
import { ORDEN_ESTATUS_LAB, ESTATUS_LAB_LABEL } from "@/lib/validaciones/orden-lab.schema";
import TarjetaOrden from "./TarjetaOrden";
import NuevaOrdenForm from "./NuevaOrdenForm";
import { useRouter } from "next/navigation";

type Orden = Awaited<ReturnType<typeof listarOrdenesLab>>[number];
type Tecnico = Awaited<ReturnType<typeof listarTecnicosLab>>[number];

export default function TableroOrdenesLab({
  ordenes,
  tecnicos,
  puedeCrear,
}: {
  ordenes: Orden[];
  tecnicos: Tecnico[];
  puedeCrear: boolean;
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const router = useRouter();

  function handleCreada() {
    setMostrarForm(false);
    router.refresh();
  }

  return (
    <div>
      {puedeCrear && (
        <div className="mb-6">
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-clinica-azul text-white px-4 py-2 rounded-md text-sm hover:bg-clinica-azulOscuro transition"
          >
            {mostrarForm ? "Cerrar formulario" : "+ Nueva orden"}
          </button>
          {mostrarForm && (
            <div className="mt-4 max-w-md">
              <NuevaOrdenForm onCreada={handleCreada} />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {ORDEN_ESTATUS_LAB.map((estatus) => {
          const ordenesColumna = ordenes.filter((o) => o.estatus === estatus);
          return (
            <div key={estatus} className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {ESTATUS_LAB_LABEL[estatus]} ({ordenesColumna.length})
              </h3>
              <div className="space-y-3">
                {ordenesColumna.length === 0 && (
                  <p className="text-xs text-gray-400">Sin órdenes</p>
                )}
                {ordenesColumna.map((orden) => (
                  <TarjetaOrden
                    key={orden.id}
                    orden={orden}
                    tecnicos={tecnicos}
                    puedeAsignar={puedeCrear}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
