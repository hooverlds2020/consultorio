"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { buscarPacientes } from "@/actions/pacientes";
import { calcularEdad } from "@/lib/validaciones/paciente.schema";

type Paciente = {
  id: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: Date | string;
  telefono: string | null;
  whatsapp: string | null;
};

export default function BuscadorPacientes({
  pacientesIniciales,
}: {
  pacientesIniciales: Paciente[];
}) {
  const [pacientes, setPacientes] = useState(pacientesIniciales);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(valor: string) {
    setQuery(valor);
    startTransition(async () => {
      const resultados = await buscarPacientes(valor);
      setPacientes(resultados as Paciente[]);
    });
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o teléfono..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
        <div className="flex gap-2">
          <a
            href="/api/pacientes/exportar"
            className="flex-1 md:flex-none text-center whitespace-nowrap border border-clinica-azul text-clinica-azul px-4 py-2 rounded-md hover:bg-clinica-azulClaro transition"
          >
            Exportar Excel
          </a>
          <Link
            href="/panel/pacientes/nuevo"
            className="flex-1 md:flex-none text-center whitespace-nowrap bg-clinica-azul text-white px-4 py-2 rounded-md hover:bg-clinica-azulOscuro transition"
          >
            + Nuevo paciente
          </Link>
        </div>
      </div>

      {pacientes.length === 0 && (
        <p className="bg-white rounded-lg shadow-sm px-4 py-6 text-center text-gray-400 text-sm">
          No se encontraron pacientes.
        </p>
      )}

      {/* Tabla — solo escritorio */}
      <div className={`hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden ${isPending ? "opacity-50" : ""}`}>
        {pacientes.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Edad</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {p.nombre} {p.apellidos}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {calcularEdad(p.fechaNacimiento)} años
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.telefono ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{p.whatsapp ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/panel/pacientes/${p.id}`}
                      className="text-clinica-azul hover:underline"
                    >
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tarjetas — móvil y tablet */}
      <div className={`grid grid-cols-1 gap-3 lg:hidden ${isPending ? "opacity-50" : ""}`}>
        {pacientes.map((p) => (
          <Link
            key={p.id}
            href={`/panel/pacientes/${p.id}`}
            className="bg-white rounded-lg shadow-sm p-4 block active:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {p.nombre} {p.apellidos}
                </p>
                <p className="text-sm text-gray-500">{calcularEdad(p.fechaNacimiento)} años</p>
              </div>
              <span className="text-clinica-azul text-sm whitespace-nowrap ml-2">Ver →</span>
            </div>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>📞 {p.telefono ?? "—"}</span>
              <span>💬 {p.whatsapp ?? "—"}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
