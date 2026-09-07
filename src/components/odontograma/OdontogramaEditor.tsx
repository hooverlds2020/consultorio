"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  COLOR_ESTADO,
  NOMBRE_ESTADO,
  ORDEN_ESTADOS,
  siguienteEstado,
  numerosAdulto,
  numerosInfantil,
  tipoDiente,
  type DientesJson,
} from "@/lib/odontograma";
import { guardarOdontograma } from "@/actions/odontograma";
import ToothSVG from "./ToothSVG";

type Props = {
  pacienteId: string;
  tipo: "ADULTO_32" | "INFANTIL_20";
  dientesIniciales: DientesJson;
  soloLectura?: boolean;
};

export default function OdontogramaEditor({
  pacienteId,
  tipo,
  dientesIniciales,
  soloLectura = false,
}: Props) {
  const [dientes, setDientes] = useState<DientesJson>(dientesIniciales);
  const [isPending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);
  const router = useRouter();

  const esInfantil = tipo === "INFANTIL_20";
  const { arribaeDerecha, arribaIzquierda, abajoIzquierda, abajoDerecha } =
    esInfantil ? numerosInfantil() : numerosAdulto();

  function handleClickDiente(numero: number) {
    if (soloLectura) return;
    setGuardado(false);
    setDientes((prev) => {
      const actual = prev[String(numero)]?.estado ?? "SANO";
      return {
        ...prev,
        [String(numero)]: { estado: siguienteEstado(actual) },
      };
    });
  }

  function handleGuardar() {
    startTransition(async () => {
      const resultado = await guardarOdontograma(pacienteId, tipo, dientes);
      if (resultado.ok) {
        setGuardado(true);
        router.refresh();
      }
    });
  }

  function renderFila(numeros: number[], arcada: "superior" | "inferior") {
    return numeros.map((n) => (
      <ToothSVG
        key={n}
        numero={n}
        estado={dientes[String(n)]?.estado ?? "SANO"}
        tipo={tipoDiente(n, esInfantil)}
        arcada={arcada}
        onClick={() => handleClickDiente(n)}
        soloLectura={soloLectura}
      />
    ));
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4 overflow-x-auto">
        <div className="flex justify-center items-end gap-1.5 mb-1 min-w-max">
          {renderFila(arribaeDerecha, "superior")}
          <div className="w-px self-stretch bg-gray-200 mx-1" />
          {renderFila(arribaIzquierda, "superior")}
        </div>
        <div className="border-t my-3" />
        <div className="flex justify-center items-start gap-1.5 min-w-max">
          {renderFila(abajoDerecha, "inferior")}
          <div className="w-px self-stretch bg-gray-200 mx-1" />
          {renderFila(abajoIzquierda, "inferior")}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-600">
        {ORDEN_ESTADOS.map((estado) => (
          <div key={estado} className="flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-gray-400"
              style={{ backgroundColor: COLOR_ESTADO[estado] }}
            />
            {NOMBRE_ESTADO[estado]}
          </div>
        ))}
      </div>

      {!soloLectura && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleGuardar}
            disabled={isPending}
            className="bg-clinica-azul text-white px-5 py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar nueva versión"}
          </button>
          {guardado && <span className="text-green-600 text-sm">Guardado ✓</span>}
        </div>
      )}
    </div>
  );
}
