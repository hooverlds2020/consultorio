import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  email: z.string().trim().email("Correo inválido").max(150),
  rol: z.enum(["SUPER_ADMIN", "RECEPCIONISTA", "DENTISTA", "TECNICO_LAB"], {
    errorMap: () => ({ message: "Selecciona un rol válido" }),
  }),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;

export const NOMBRE_ROL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  RECEPCIONISTA: "Recepcionista",
  DENTISTA: "Dentista",
  TECNICO_LAB: "Técnico de Laboratorio",
};

/** Genera una contraseña temporal legible y razonablemente segura. */
export function generarPasswordTemporal(): string {
  const palabras = ["Clinica", "Dental", "Sonrisa", "Molar", "Chiapas"];
  const palabra = palabras[Math.floor(Math.random() * palabras.length)];
  const numero = Math.floor(1000 + Math.random() * 9000);
  return `${palabra}${numero}!`;
}
