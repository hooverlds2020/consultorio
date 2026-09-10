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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#EEF6FF" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-cesar-oficial.png"
        alt="César Aguilar Consultorio Dental"
        className="mb-6"
        style={{ width: 320, maxWidth: "100%", height: "auto" }}
      />

      <div
        className="w-full max-w-[384px] bg-white rounded-2xl p-8"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}
      >
        <h1
          className="text-center text-2xl font-bold mb-6"
          style={{ color: "#0A2F5C" }}
        >
          Acceso al sistema
        </h1>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="mt-1 w-full h-12 rounded-lg px-4 text-[16px] outline-none border transition"
              style={{ borderColor: "#B8C9DC" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0F4C81")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#B8C9DC")}
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full h-12 rounded-lg px-4 text-[16px] outline-none border transition"
              style={{ borderColor: "#B8C9DC" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0F4C81")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#B8C9DC")}
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full h-12 rounded-lg text-white font-medium text-[16px] transition disabled:opacity-60"
            style={{ backgroundColor: "#0F4C81" }}
          >
            {cargando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center mt-4">
          <a href="#" className="text-sm hover:underline" style={{ color: "#0F4C81" }}>
            ¿Olvidaste tu contraseña?
          </a>
        </p>
      </div>
    </div>
  );
}
