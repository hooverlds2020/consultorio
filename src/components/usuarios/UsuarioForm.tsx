"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { crearUsuario } from "@/actions/usuarios";
import type { EstadoUsuario } from "@/actions/usuarios";
import { NOMBRE_ROL } from "@/lib/validaciones/usuario.schema";

const estadoInicial: EstadoUsuario = { ok: false };

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-5 py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Creando..." : "Crear usuario"}
    </button>
  );
}

export default function UsuarioForm() {
  const [estado, formAction] = useFormState(crearUsuario, estadoInicial);
  const router = useRouter();

  if (estado.ok && estado.passwordTemporal) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-md">
        <h2 className="text-lg font-semibold text-green-600 mb-3">Usuario creado ✓</h2>
        <p className="text-sm text-gray-600 mb-4">
          Comparte esta contraseña temporal con el empleado. No se volverá a mostrar —
          si la pierdes, puedes restablecerla desde la lista de usuarios.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center mb-4">
          <span className="text-xl font-mono font-semibold text-clinica-azulOscuro">
            {estado.passwordTemporal}
          </span>
        </div>
        <button
          onClick={() => router.push("/panel/usuarios")}
          className="w-full bg-clinica-azul text-white py-2 rounded-md hover:bg-clinica-azulOscuro transition"
        >
          Ir a la lista de usuarios
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-sm p-6 max-w-md space-y-4">
      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{estado.mensaje}</p>
      )}

      <div>
        <label className="block text-sm text-gray-700 mb-1">Nombre completo</label>
        <input
          type="text"
          name="nombre"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
        {estado.errores?.nombre && (
          <p className="text-red-500 text-xs mt-1">{estado.errores.nombre[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Correo</label>
        <input
          type="email"
          name="email"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
        {estado.errores?.email && (
          <p className="text-red-500 text-xs mt-1">{estado.errores.email[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Rol</label>
        <select
          name="rol"
          required
          defaultValue=""
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        >
          <option value="" disabled>
            Selecciona...
          </option>
          {Object.entries(NOMBRE_ROL).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
        {estado.errores?.rol && (
          <p className="text-red-500 text-xs mt-1">{estado.errores.rol[0]}</p>
        )}
      </div>

      <BotonCrear />
    </form>
  );
}
