"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registrarMovimiento } from "@/actions/inventario";

type Insumo = {
  id: string;
  nombre: string;
  unidadMedida: string;
  stockActual: string | number;
  stockMinimo: string | number;
};

export default function FilaInsumo({ insumo }: { insumo: Insumo }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState<"ENTRADA" | "SALIDA">("ENTRADA");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const stockBajo = Number(insumo.stockActual) <= Number(insumo.stockMinimo);
  const registrarConId = registrarMovimiento.bind(null, insumo.id);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.set("tipo", tipo);
    formData.set("cantidad", cantidad);
    formData.set("motivo", motivo);

    startTransition(async () => {
      const resultado = await registrarConId({ ok: false }, formData);
      if (resultado.ok) {
        setMostrarForm(false);
        setCantidad("");
        setMotivo("");
        router.refresh();
      } else {
        setError(resultado.mensaje ?? "Error al registrar movimiento.");
      }
    });
  }

  return (
    <tr className="border-t">
      <td className="px-4 py-3">
        <Link href={`/panel/inventario/${insumo.id}`} className="font-medium text-clinica-azul hover:underline">
          {insumo.nombre}
        </Link>
        {stockBajo && (
          <span className="inline-block text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded mt-0.5">
            Stock bajo
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {Number(insumo.stockActual).toLocaleString("es-MX")} {insumo.unidadMedida}
      </td>
      <td className="px-4 py-3 text-gray-400">
        Mín: {Number(insumo.stockMinimo).toLocaleString("es-MX")} {insumo.unidadMedida}
      </td>
      <td className="px-4 py-3 text-right">
        {!mostrarForm ? (
          <button
            onClick={() => setMostrarForm(true)}
            className="text-xs text-clinica-azul hover:underline"
          >
            Registrar movimiento
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col items-end gap-1">
            {error && <p className="text-red-500 text-[11px]">{error}</p>}
            <div className="flex gap-1">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "ENTRADA" | "SALIDA")}
                className="text-xs border border-gray-300 rounded px-1 py-1"
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="Cantidad"
                className="w-20 text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo (opcional)"
              className="w-40 text-xs border border-gray-300 rounded px-1 py-1"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="text-xs bg-clinica-azul text-white px-2 py-1 rounded disabled:opacity-60"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="text-xs text-gray-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </td>
    </tr>
  );
}
