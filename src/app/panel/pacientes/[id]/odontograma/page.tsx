import { redirect } from "next/navigation";

/**
 * El sistema de odontograma oficial ahora es el "Pro" (5 caras, CIE-10,
 * permanente/temporal/mixta). Esta ruta se conserva solo para no romper
 * enlaces guardados — redirige a la versión oficial.
 */
export default function OdontogramaViejoRedirect({ params }: { params: { id: string } }) {
  redirect(`/panel/pacientes/${params.id}/odontograma-v2`);
}
