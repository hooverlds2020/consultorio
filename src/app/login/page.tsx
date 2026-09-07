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
    <main className="min-h-screen bg-clinica-azulClaro flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold text-clinica-azulOscuro mb-6 text-center">
          Acceso al sistema
        </h1>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-md p-3 mb-4">
            {error}
          </p>
        )}

        <label className="block text-sm text-gray-700 mb-1">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />

        <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-clinica-azul text-white py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
        >
          {cargando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
