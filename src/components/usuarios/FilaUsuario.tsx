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

function useAccionesUsuario(usuario: Usuario) {
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

  return { isPending, passwordMostrada, handleToggleActivo, handleRestablecer };
}

function BotonesAccion({
  usuario,
  esUsuarioActual,
  isPending,
  passwordMostrada,
  handleRestablecer,
  handleToggleActivo,
}: {
  usuario: Usuario;
  esUsuarioActual: boolean;
  isPending: boolean;
  passwordMostrada: string | null;
  handleRestablecer: () => void;
  handleToggleActivo: () => void;
}) {
  return (
    <>
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
    </>
  );
}

/** Fila para la tabla de escritorio (lg y superior). */
export function FilaUsuarioTabla({
  usuario,
  esUsuarioActual,
}: {
  usuario: Usuario;
  esUsuarioActual: boolean;
}) {
  const { isPending, passwordMostrada, handleToggleActivo, handleRestablecer } =
    useAccionesUsuario(usuario);

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
        <BotonesAccion
          usuario={usuario}
          esUsuarioActual={esUsuarioActual}
          isPending={isPending}
          passwordMostrada={passwordMostrada}
          handleRestablecer={handleRestablecer}
          handleToggleActivo={handleToggleActivo}
        />
      </td>
    </tr>
  );
}

/** Tarjeta para móvil y tablet (debajo de lg). */
export function TarjetaUsuario({
  usuario,
  esUsuarioActual,
}: {
  usuario: Usuario;
  esUsuarioActual: boolean;
}) {
  const { isPending, passwordMostrada, handleToggleActivo, handleRestablecer } =
    useAccionesUsuario(usuario);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0">
          <p className="font-medium text-gray-800 truncate">{usuario.nombre}</p>
          <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
          <p className="text-sm text-gray-600 mt-1">{NOMBRE_ROL[usuario.rol]}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
            usuario.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {usuario.activo ? "Activo" : "Inactivo"}
        </span>
      </div>
      <div className="flex gap-4 pt-2 border-t">
        <BotonesAccion
          usuario={usuario}
          esUsuarioActual={esUsuarioActual}
          isPending={isPending}
          passwordMostrada={passwordMostrada}
          handleRestablecer={handleRestablecer}
          handleToggleActivo={handleToggleActivo}
        />
      </div>
    </div>
  );
}
