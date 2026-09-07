import { z } from "zod";

export const pacienteSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  apellidos: z.string().trim().min(1, "Los apellidos son obligatorios").max(100),
  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida"),
  telefono: z.string().trim().max(20).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
  direccion: z.string().trim().max(300).optional().or(z.literal("")),
  alergias: z.string().trim().max(1000).optional().or(z.literal("")),
  enfermedadesSistemicas: z.string().trim().max(1000).optional().or(z.literal("")),
  medicamentosActuales: z.string().trim().max(1000).optional().or(z.literal("")),
  contactoEmergenciaNombre: z.string().trim().max(150).optional().or(z.literal("")),
  contactoEmergenciaTelefono: z.string().trim().max(20).optional().or(z.literal("")),
});

export type PacienteFormValues = z.infer<typeof pacienteSchema>;

/** Calcula la edad actual a partir de la fecha de nacimiento. Nunca se guarda en BD. */
export function calcularEdad(fechaNacimiento: Date | string): number {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const noHaCumplidoEsteAno =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (noHaCumplidoEsteAno) edad--;
  return edad;
}
