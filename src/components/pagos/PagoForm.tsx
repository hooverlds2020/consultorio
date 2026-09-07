"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRef, useEffect } from "react";
import type { EstadoPago } from "@/actions/pagos";
import { METODO_PAGO_LABEL } from "@/lib/validaciones/pago.schema";

type Plan = { id: string; totalPlan: string | number; totalPagado: string | number };

const estadoInicial: EstadoPago = { ok: false };

function BotonRegistrar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-5 py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Registrando..." : "Registrar pago"}
    </button>
  );
}

export default function PagoForm({
  accion,
  planes,
}: {
  accion: (prevState: EstadoPago, formData: FormData) => Promise<EstadoPago>;
  planes: Plan[];
}) {
  const [estado, formAction] = useFormState(accion, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-lg shadow-sm p-5 space-y-4">
      <h3 className="font-medium text-clinica-azulOscuro">Registrar pago</h3>

      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{estado.mensaje}</p>
      )}
      {estado.ok && <p className="text-green-600 text-sm">Pago registrado ✓</p>}

      {planes.length > 0 && (
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Aplicar a plan de tratamiento (opcional)
          </label>
          <select
            name="planTratamientoId"
            defaultValue=""
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
          >
            <option value="">Pago directo (sin plan)</option>
            {planes.map((p) => (
              <option key={p.id} value={p.id}>
                Restante: ${(Number(p.totalPlan) - Number(p.totalPagado)).toLocaleString("es-MX")} de $
                {Number(p.totalPlan).toLocaleString("es-MX")}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-700 mb-1">Monto (MXN)</label>
        <input
          type="number"
          name="monto"
          step="0.01"
          min="0.01"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        />
        {estado.errores?.monto && (
          <p className="text-red-500 text-xs mt-1">{estado.errores.monto[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Método</label>
        <select
          name="metodo"
          required
          defaultValue=""
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul"
        >
          <option value="" disabled>
            Selecciona...
          </option>
          {Object.entries(METODO_PAGO_LABEL).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      <BotonRegistrar />
    </form>
  );
}
