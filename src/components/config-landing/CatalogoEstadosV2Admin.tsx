"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  crearEstadoV2,
  actualizarEstadoV2,
  desactivarEstadoV2,
} from "@/actions/odontogramaV2";
import type { EstadoHallazgoV2 } from "@/actions/odontogramaV2";

type Estado = {
  id: string;
  key: string;
  label: string;
  descripcion: string | null;
  colorHex: string;
  esSistema: boolean;
  activo: boolean;
};

const estadoInicial: EstadoHallazgoV2 = { ok: false };

function BotonAgregar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 px-4 bg-clinica-azul text-white rounded-lg font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Guardando..." : "+ Nuevo estado"}
    </button>
  );
}

function FilaEditable({ estado }: { estado: Estado }) {
  const [editando, setEditando] = useState(false);
  const [label, setLabel] = useState(estado.label);
  const [descripcion, setDescripcion] = useState(estado.descripcion ?? "");
  const [colorHex, setColorHex] = useState(estado.colorHex);
  const [isPending, startTransition] = useTransition();
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false);
  const router = useRouter();

  function handleGuardar() {
    startTransition(async () => {
      await actualizarEstadoV2(estado.key, { label, descripcion, colorHex });
      setEditando(false);
      router.refresh();
    });
  }

  function handleBorrar() {
    startTransition(async () => {
      await desactivarEstadoV2(estado.key);
      router.refresh();
    });
  }

  if (!estado.activo) {
    return (
      <tr className="border-t bg-gray-50 opacity-50">
        <td className="px-4 py-2" colSpan={5}>
          {estado.label} — desactivado
        </td>
      </tr>
    );
  }

  if (editando) {
    return (
      <tr className="border-t bg-clinica-azulClaro">
        <td className="px-4 py-2">
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="w-10 h-8 border-0 cursor-pointer"
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="text"
            value={label}
            disabled={estado.esSistema}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full h-9 border border-gray-300 rounded px-2 text-sm disabled:bg-gray-100"
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="text"
            value={descripcion}
            disabled={estado.esSistema}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full h-9 border border-gray-300 rounded px-2 text-sm disabled:bg-gray-100"
          />
        </td>
        <td className="px-4 py-2 text-xs text-gray-400">
          {estado.esSistema ? "Sistema" : "Personalizado"}
        </td>
        <td className="px-4 py-2 text-right whitespace-nowrap">
          <button
            onClick={handleGuardar}
            disabled={isPending}
            className="text-xs text-clinica-azul font-medium hover:underline mr-3"
          >
            Guardar
          </button>
          <button onClick={() => setEditando(false)} className="text-xs text-gray-500 hover:underline">
            Cancelar
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t">
      <td className="px-4 py-2">
        <span
          className="inline-block w-5 h-5 rounded-full border border-gray-300"
          style={{ backgroundColor: estado.colorHex }}
        />
      </td>
      <td className="px-4 py-2 font-medium text-gray-700">{estado.label}</td>
      <td className="px-4 py-2 text-gray-500">{estado.descripcion ?? "—"}</td>
      <td className="px-4 py-2 text-xs text-gray-400">{estado.esSistema ? "Sistema" : "Personalizado"}</td>
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <button onClick={() => setEditando(true)} className="text-xs text-clinica-azul hover:underline mr-3">
          {estado.esSistema ? "Editar color" : "Editar"}
        </button>
        {!estado.esSistema &&
          (confirmandoBorrar ? (
            <>
              <button onClick={handleBorrar} disabled={isPending} className="text-xs text-red-600 font-medium mr-2">
                Confirmar
              </button>
              <button onClick={() => setConfirmandoBorrar(false)} className="text-xs text-gray-500">
                No
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmandoBorrar(true)} className="text-xs text-red-500 hover:underline">
              Borrar
            </button>
          ))}
      </td>
    </tr>
  );
}

export default function CatalogoEstadosV2Admin({ estadosIniciales }: { estadosIniciales: Estado[] }) {
  const [estado, formAction] = useFormState(crearEstadoV2, estadoInicial);
  const [colorNuevo, setColorNuevo] = useState("#3b82f6");

  return (
    <div>
      <form action={formAction} className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-end gap-3">
        {estado.mensaje && <p className="text-red-600 text-sm w-full">{estado.mensaje}</p>}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Color</label>
          <input
            type="color"
            name="colorHex"
            value={colorNuevo}
            onChange={(e) => setColorNuevo(e.target.value)}
            className="w-12 h-10 border-0 cursor-pointer"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-gray-500 mb-1">Nombre</label>
          <input
            type="text"
            name="label"
            required
            placeholder="Ej. Sensibilidad"
            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-500 mb-1">Descripción corta</label>
          <input
            type="text"
            name="descripcion"
            placeholder="Opcional"
            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm"
          />
        </div>
        <BotonAgregar />
      </form>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Color</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Origen</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {estadosIniciales.map((e) => (
              <FilaEditable key={e.id} estado={e} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
