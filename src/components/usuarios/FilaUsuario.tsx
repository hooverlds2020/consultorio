"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cambiarEstadoActivo, restablecerPassword } from "@/actions/usuarios";
import { NOMBRE_ROL } from "@/lib/validaciones/usuario.schema";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
};

export default function FilaUsuario({
  usuario,
  esUsuarioActual,
}: {
  usuario: Usuario;
  esUsuarioActual: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [passwordMostrada, setPasswordMostrada] = useState<string | null>(null);
  const router = useRouter();

  function handleToggleActivo() {
    startTransition(async () => {
      await cambiarEstadoActivo(usuario.id, !usuario.activo);
      router.refresh();
    });
  }

  function handleRestablecer() {
    startTransition(async () => {
      const resultado = await restablecerPassword(usuario.id);
      if (resultado.ok && resultado.passwordTemporal) {
        setPasswordMostrada(resultado.passwordTemporal);
      }
    });
  }

  return (
    <tr className="border-t">
      <td className="px-4 py-3">
        <p className="font-medium text-gray-800">{usuario.nombre}</p>
        <p className="text-xs text-gray-500">{usuario.email}</p>
      </td>
      <td className="px-4 py-3 text-gray-600">{NOMBRE_ROL[usuario.rol]}</td>
      <td className="px-4 py-3">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            usuario.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {usuario.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="px-4 py-3 text-right space-x-3">
        {passwordMostrada ? (
          <span className="font-mono text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1">
            {passwordMostrada}
          </span>
        ) : (
          <button
            onClick={handleRestablecer}
            disabled={isPending}
            className="text-xs text-clinica-azul hover:underline disabled:opacity-50"
          >
            Restablecer contraseña
          </button>
        )}
        {!esUsuarioActual && (
          <button
            onClick={handleToggleActivo}
            disabled={isPending}
            className={`text-xs hover:underline disabled:opacity-50 ${
              usuario.activo ? "text-red-500" : "text-green-600"
            }`}
          >
            {usuario.activo ? "Desactivar" : "Activar"}
          </button>
        )}
      </td>
    </tr>
  );
}
