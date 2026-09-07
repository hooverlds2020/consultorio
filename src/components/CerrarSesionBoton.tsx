"use client";

import { signOut } from "next-auth/react";

export default function CerrarSesionBoton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-gray-500 hover:text-clinica-azul transition"
    >
      Cerrar sesión
    </button>
  );
}
