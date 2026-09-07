"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { EstadoFormulario } from "@/actions/pacientes";

type Paciente = {
  id: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: Date | string;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  alergias: string | null;
  enfermedadesSistemicas: string | null;
  medicamentosActuales: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaTelefono: string | null;
};

type Props = {
  accion: (prevState: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  paciente?: Paciente;
  redirigirA: string;
};

const estadoInicial: EstadoFormulario = { ok: false };

function fechaParaInput(fecha: Date | string): string {
  const d = new Date(fecha);
  return d.toISOString().split("T")[0];
}

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-clinica-azul text-white px-5 py-2 rounded-md font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

function Campo({
  label,
  name,
  tipo = "text",
  defaultValue,
  errores,
  requerido = false,
  textarea = false,
}: {
  label: string;
  name: string;
  tipo?: string;
  defaultValue?: string;
  errores?: string[];
  requerido?: boolean;
  textarea?: boolean;
}) {
  const claseInput =
    "w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinica-azul" +
    (errores?.length ? " border-red-400" : " border-gray-300");

  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">
        {label}
        {requerido && <span className="text-red-500"> *</span>}
      </label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} rows={3} className={claseInput} />
      ) : (
        <input
          type={tipo}
          name={name}
          defaultValue={defaultValue}
          required={requerido}
          className={claseInput}
        />
      )}
      {errores?.map((error) => (
        <p key={error} className="text-red-500 text-xs mt-1">
          {error}
        </p>
      ))}
    </div>
  );
}

export default function PacienteForm({ accion, paciente, redirigirA }: Props) {
  const router = useRouter();
  const [estado, formAction] = useFormState(accion, estadoInicial);

  useEffect(() => {
    if (estado.ok) {
      router.push(redirigirA);
      router.refresh();
    }
  }, [estado.ok, redirigirA, router]);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {estado.mensaje && (
        <p className="bg-red-50 text-red-600 text-sm rounded-md p-3">{estado.mensaje}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Campo
          label="Nombre"
          name="nombre"
          defaultValue={paciente?.nombre}
          errores={estado.errores?.nombre}
          requerido
        />
        <Campo
          label="Apellidos"
          name="apellidos"
          defaultValue={paciente?.apellidos}
          errores={estado.errores?.apellidos}
          requerido
        />
        <Campo
          label="Fecha de nacimiento"
          name="fechaNacimiento"
          tipo="date"
          defaultValue={paciente ? fechaParaInput(paciente.fechaNacimiento) : undefined}
          errores={estado.errores?.fechaNacimiento}
          requerido
        />
        <Campo
          label="Teléfono"
          name="telefono"
          defaultValue={paciente?.telefono ?? undefined}
          errores={estado.errores?.telefono}
        />
        <Campo
          label="WhatsApp"
          name="whatsapp"
          defaultValue={paciente?.whatsapp ?? undefined}
          errores={estado.errores?.whatsapp}
        />
      </div>

      <Campo
        label="Dirección"
        name="direccion"
        defaultValue={paciente?.direccion ?? undefined}
        errores={estado.errores?.direccion}
      />

      <div className="border-t pt-4">
        <h3 className="font-medium text-clinica-azulOscuro mb-3">Información médica</h3>
        <div className="space-y-4">
          <Campo
            label="Alergias"
            name="alergias"
            textarea
            defaultValue={paciente?.alergias ?? undefined}
            errores={estado.errores?.alergias}
          />
          <Campo
            label="Enfermedades sistémicas"
            name="enfermedadesSistemicas"
            textarea
            defaultValue={paciente?.enfermedadesSistemicas ?? undefined}
            errores={estado.errores?.enfermedadesSistemicas}
          />
          <Campo
            label="Medicamentos actuales"
            name="medicamentosActuales"
            textarea
            defaultValue={paciente?.medicamentosActuales ?? undefined}
            errores={estado.errores?.medicamentosActuales}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-clinica-azulOscuro mb-3">Contacto de emergencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Campo
            label="Nombre"
            name="contactoEmergenciaNombre"
            defaultValue={paciente?.contactoEmergenciaNombre ?? undefined}
            errores={estado.errores?.contactoEmergenciaNombre}
          />
          <Campo
            label="Teléfono"
            name="contactoEmergenciaTelefono"
            defaultValue={paciente?.contactoEmergenciaTelefono ?? undefined}
            errores={estado.errores?.contactoEmergenciaTelefono}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <BotonGuardar />
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
