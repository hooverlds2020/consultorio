"use client";

import { useState } from "react";
import Link from "next/link";
import CerrarSesionBoton from "@/components/CerrarSesionBoton";

export type EnlaceNav = { href: string; label: string };

export default function NavPanel({
  enlaces,
  nombreUsuario,
  nombreRol,
  logoUrl,
}: {
  enlaces: EnlaceNav[];
  nombreUsuario: string;
  nombreRol: string;
  logoUrl: string;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b w-full">
      <div className="max-w-[1200px] mx-auto px-4 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Logo" className="h-10 w-auto max-w-[140px] object-contain shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-bold text-sm text-[#1a5a8a]">
              Consultorio Dental
            </p>
            <p className="truncate text-[11px] text-gray-500">
              {nombreUsuario} · {nombreRol}
            </p>
          </div>
        </div>

        {/* Navegación de escritorio — con 10 enlaces, solo cabe cómoda desde lg */}
        <nav className="hidden lg:flex items-center gap-4 text-sm text-gray-600 ml-4">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href} className="hover:text-clinica-azul whitespace-nowrap">
              {e.label}
            </Link>
          ))}
          <CerrarSesionBoton />
        </nav>

        {/* Botón hamburguesa — visible por debajo de lg, área táctil 44px */}
        <button
          type="button"
          onClick={() => setAbierto((prev) => !prev)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          className="lg:hidden w-11 h-11 flex items-center justify-center text-[#1a5a8a] shrink-0"
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

      {/* Panel desplegable — por debajo de lg */}
      {abierto && (
        <nav className="lg:hidden border-t bg-white px-4 py-2 max-h-[calc(100vh-60px)] overflow-y-auto">
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
