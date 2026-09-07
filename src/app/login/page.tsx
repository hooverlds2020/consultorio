"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const resultado = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setCargando(false);

    if (resultado?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/panel");
    router.refresh();
  }

  return (
    <div className="min-h-screen w-full bg-clinica-azulClaro flex flex-col md:flex-row">
      {/* Lado izquierdo — branding, solo visible en escritorio */}
      <div className="hidden md:flex md:w-1/2 bg-white items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-bold text-clinica-azulOscuro">
            Laboratorio y Consultorio Dental
          </h1>
          <p className="text-gray-600 mt-2">Sistema de administración clínica</p>
        </div>
      </div>

      {/* Lado del formulario */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[380px] bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          <h2 className="text-center text-xl font-bold text-clinica-azulOscuro mb-6">
            Acceso al sistema
          </h2>

          {error && (
            <p className="bg-red-50 text-red-600 text-sm rounded-md p-3 mb-4">{error}</p>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Correo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 mt-1 px-3 border rounded-lg text-base focus:ring-2 focus:ring-clinica-azul outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 mt-1 px-3 border rounded-lg text-base focus:ring-2 focus:ring-clinica-azul outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full h-12 bg-clinica-azul hover:bg-clinica-azulOscuro text-white rounded-lg font-medium text-base mt-2 transition disabled:opacity-60"
            >
              {cargando ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
