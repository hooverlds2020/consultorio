"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { guardarHorarioServicio } from "@/actions/horarioServicio";
import { DIAS_SEMANA, NOMBRE_DIA, type HorariosSemana, type DiaSemana } from "@/lib/horarioServicio";
import type { EstadoHorario } from "@/actions/horarioServicio";

const estadoInicial: EstadoHorario = { ok: false };

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 px-5 bg-clinica-azul text-white rounded-lg font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar horario"}
    </button>
  );
}

export default function HorarioServicioForm({ horarioInicial }: { horarioInicial: HorariosSemana }) {
  const [estado, formAction] = useFormState(guardarHorarioServicio, estadoInicial);
  const [activos, setActivos] = useState<Record<DiaSemana, boolean>>(
    Object.fromEntries(DIAS_SEMANA.map((d) => [d, horarioInicial[d].activo])) as Record<DiaSemana, boolean>
  );
  const [mostrarComida, setMostrarComida] = useState<Record<DiaSemana, boolean>>(
    Object.fromEntries(
      DIAS_SEMANA.map((d) => [d, !!(horarioInicial[d].comidaInicio && horarioInicial[d].comidaFin)])
    ) as Record<DiaSemana, boolean>
  );

  return (
    <form action={formAction} className="bg-white rounded-xl border shadow-sm p-4 md:p-5">
      {estado.ok && <p className="text-green-600 text-sm mb-3">Guardado ✓</p>}
      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{estado.mensaje}</p>
      )}

      <div className="space-y-3">
        {DIAS_SEMANA.map((dia) => {
          const valores = horarioInicial[dia];
          return (
            <div
              key={dia}
              className={`border rounded-lg p-3 ${activos[dia] ? "border-gray-200" : "border-gray-100 bg-gray-50"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name={`${dia}_activo`}
                    defaultChecked={valores.activo}
                    onChange={(e) => setActivos((prev) => ({ ...prev, [dia]: e.target.checked }))}
                    className="w-5 h-5"
                  />
                  {NOMBRE_DIA[dia]}
                </label>
                {!activos[dia] && <span className="text-xs text-gray-400">Cerrado</span>}
              </div>

              {activos[dia] && (
                <div className="grid grid-cols-2 gap-3 pl-7">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Apertura</label>
                    <input
                      type="time"
                      name={`${dia}_apertura`}
                      defaultValue={valores.apertura}
                      className="w-full h-10 border border-gray-300 rounded-lg px-2 text-[16px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cierre</label>
                    <input
                      type="time"
                      name={`${dia}_cierre`}
                      defaultValue={valores.cierre}
                      className="w-full h-10 border border-gray-300 rounded-lg px-2 text-[16px]"
                    />
                  </div>

                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => setMostrarComida((prev) => ({ ...prev, [dia]: !prev[dia] }))}
                      className="text-xs text-clinica-azul hover:underline"
                    >
                      {mostrarComida[dia] ? "Quitar hora de comida" : "+ Agregar hora de comida"}
                    </button>
                  </div>

                  {mostrarComida[dia] && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Comida — inicio</label>
                        <input
                          type="time"
                          name={`${dia}_comidaInicio`}
                          defaultValue={valores.comidaInicio ?? "14:00"}
                          className="w-full h-10 border border-gray-300 rounded-lg px-2 text-[16px]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Comida — fin</label>
                        <input
                          type="time"
                          name={`${dia}_comidaFin`}
                          defaultValue={valores.comidaFin ?? "15:00"}
                          className="w-full h-10 border border-gray-300 rounded-lg px-2 text-[16px]"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <BotonGuardar />
      </div>
    </form>
  );
}
