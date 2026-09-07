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
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">¿Eliminar este paciente?</span>
        <button
          onClick={handleEliminar}
          disabled={isPending}
          className="text-red-600 font-medium hover:underline disabled:opacity-50"
        >
          {isPending ? "Eliminando..." : "Sí, eliminar"}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          className="text-gray-500 hover:underline"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className="text-red-600 text-sm hover:underline"
    >
      Eliminar paciente
    </button>
  );
}
