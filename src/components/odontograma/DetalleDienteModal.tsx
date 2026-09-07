"use client";

import { useState } from "react";
import { NOMBRE_ESTADO, COLOR_ESTADO } from "@/lib/odontograma";
import type { EstadoDiente } from "@/lib/odontograma";
import type { VersionHistorial } from "./OdontogramaConHistorial";

export default function DetalleDienteModal({
  numero,
  estadoActual,
  notaActual,
  versiones,
  radiografiaReciente,
  soloLectura,
  onCerrar,
  onGuardarNota,
}: {
  numero: number;
  estadoActual: EstadoDiente;
  notaActual: string;
  versiones: VersionHistorial[];
  radiografiaReciente: string | null;
  soloLectura: boolean;
  onCerrar: () => void;
  onGuardarNota: (nota: string) => void;
}) {
  const [nota, setNota] = useState(notaActual);

  // Solo las versiones donde ESTE diente tuvo un cambio registrado.
  const historialDiente = versiones
    .map((v) => ({ version: v, cambio: v.diff.find((c) => c.diente === String(numero)) }))
    .filter((x) => x.cambio);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border border-gray-400"
              style={{ backgroundColor: COLOR_ESTADO[estadoActual] }}
            />
            <h2 className="text-lg font-semibold text-clinica-azulOscuro">
              Diente {numero} — {NOMBRE_ESTADO[estadoActual]}
            </h2>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        {radiografiaReciente && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Radiografía más reciente del paciente</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={radiografiaReciente}
              alt="Radiografía reciente"
              className="w-full max-h-40 object-cover rounded-lg border"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">
            Nota para el paciente / observaciones de esta pieza
          </label>
          {soloLectura ? (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {nota || "Sin notas registradas."}
            </p>
          ) : (
            <>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                rows={3}
                placeholder="Ej. Se recomienda corona. Diente sensible al frío."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-clinica-azul"
              />
              <p className="text-xs text-gray-400 mt-1">
                Se guarda junto con la próxima "Guardar nueva versión".
              </p>
              <button
                onClick={() => {
                  onGuardarNota(nota);
                  onCerrar();
                }}
                className="mt-2 h-10 px-4 bg-clinica-azul text-white rounded-lg text-sm font-medium hover:bg-clinica-azulOscuro transition"
              >
                Guardar nota
              </button>
            </>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Historial de esta pieza</h3>
          {historialDiente.length === 0 ? (
            <p className="text-sm text-gray-400">Sin cambios registrados todavía para este diente.</p>
          ) : (
            <ul className="space-y-2">
              {historialDiente.map(({ version, cambio }) => (
                <li key={version.id} className="text-sm bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    <span className="font-medium">
                      {new Date(version.fecha).toLocaleString("es-MX", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>{" "}
                    — {version.dentistaNombre}
                  </p>
                  <p className="text-gray-600">
                    {NOMBRE_ESTADO[cambio!.de]} → {NOMBRE_ESTADO[cambio!.a]}
                  </p>
                  {version.motivo && (
                    <p className="text-gray-500 text-xs mt-0.5">Motivo: {version.motivo}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
