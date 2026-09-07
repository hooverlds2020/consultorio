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
    <div className="min-h-screen w-full bg-[#eaf2fb] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-center text-[20px] font-bold text-[#1a5a8a] mb-6">
          Acceso al sistema
        </h1>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-[48px] rounded-xl border border-gray-200 px-4 text-[16px] outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full h-[48px] rounded-xl border border-gray-200 px-4 text-[16px] outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full h-[48px] rounded-xl bg-[#1f6fb5] text-white font-medium text-[16px] mt-2 active:scale-[0.98] transition disabled:opacity-60"
          >
            {cargando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
