"use client";

import { useState } from "react";
import Link from "next/link";
import CerrarSesionBoton from "@/components/CerrarSesionBoton";

export type EnlaceNav = { href: string; label: string };

export default function NavPanel({
  enlaces,
  nombreUsuario,
  nombreRol,
}: {
  enlaces: EnlaceNav[];
  nombreUsuario: string;
  nombreRol: string;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-clinica-azulOscuro truncate">
              Laboratorio y Consultorio Dental
            </p>
            <p className="text-xs text-gray-500 truncate">
              {nombreUsuario} · {nombreRol}
            </p>
          </div>

          {/* Navegación de escritorio */}
          <nav className="hidden md:flex gap-4 text-sm text-gray-600">
            {enlaces.map((e) => (
              <Link key={e.href} href={e.href} className="hover:text-clinica-azul whitespace-nowrap">
                {e.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <CerrarSesionBoton />
          </div>

          {/* Botón hamburguesa — solo visible en móvil, área táctil de 44px */}
          <button
            type="button"
            onClick={() => setAbierto((prev) => !prev)}
            aria-label="Abrir menú"
            aria-expanded={abierto}
            className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 text-clinica-azulOscuro"
          >
            {abierto ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Panel desplegable en móvil */}
      {abierto && (
        <nav className="md:hidden border-t bg-white px-4 py-2">
          <ul className="flex flex-col">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  onClick={() => setAbierto(false)}
                  className="flex items-center min-h-[44px] text-gray-700 hover:text-clinica-azul"
                >
                  {e.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t mt-2 pt-2">
            <CerrarSesionBoton />
          </div>
        </nav>
      )}
    </header>
  );
}
