"use client";

import { useState } from "react";

const ENLACES = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#galeria", label: "Galería" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#contacto", label: "Contacto" },
];

export default function NavLanding({ logoUrl }: { logoUrl: string }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur border-b z-10">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold text-clinica-azulOscuro">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
          Laboratorio y Consultorio Dental
        </span>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          {ENLACES.map((e) => (
            <a key={e.href} href={e.href} className="hover:text-clinica-azul">
              {e.label}
            </a>
          ))}
          <a
            href="/login"
            className="text-sm border border-clinica-azul text-clinica-azul px-4 py-1.5 rounded-md hover:bg-clinica-azulClaro transition"
          >
            Acceso al panel
          </a>
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
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
      </nav>

      {abierto && (
        <div className="md:hidden border-t bg-white px-4 py-2">
          <ul className="flex flex-col">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <a
                  href={e.href}
                  onClick={() => setAbierto(false)}
                  className="flex items-center min-h-[44px] text-gray-700 hover:text-clinica-azul"
                >
                  {e.label}
                </a>
              </li>
            ))}
            <li className="border-t mt-1 pt-2">
              <a
                href="/login"
                className="flex items-center min-h-[44px] text-clinica-azul font-medium"
              >
                Acceso al panel
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
