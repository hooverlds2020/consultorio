"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarPaciente } from "@/actions/pacientes";

export default function EliminarPacienteBoton({ pacienteId }: { pacienteId: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleEliminar() {
    startTransition(async () => {
      const resultado = await eliminarPaciente(pacienteId);
      if (resultado.ok) {
        router.push("/panel/pacientes");
        router.refresh();
      }
    });
  }

  if (confirmando) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm w-full md:w-auto">
        <span className="text-gray-600">¿Eliminar este paciente?</span>
        <button
          onClick={handleEliminar}
          disabled={isPending}
          className="text-red-600 font-medium hover:underline disabled:opacity-50 h-11"
        >
          {isPending ? "Eliminando..." : "Sí, eliminar"}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          className="text-gray-500 hover:underline h-11"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className="w-full md:w-auto h-11 md:h-auto border border-red-200 md:border-0 rounded-lg md:rounded-none text-red-600 text-sm hover:underline hover:bg-red-50 md:hover:bg-transparent transition"
    >
      Eliminar paciente
    </button>
  );
}
