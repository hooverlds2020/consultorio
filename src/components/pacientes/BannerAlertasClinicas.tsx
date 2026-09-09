import { AlertTriangle } from "lucide-react";

export default function BannerAlertasClinicas({
  alergias,
  enfermedadesSistemicas,
  medicamentosActuales,
}: {
  alergias: string | null;
  enfermedadesSistemicas: string | null;
  medicamentosActuales: string | null;
}) {
  const tieneAlertas = alergias || enfermedadesSistemicas || medicamentosActuales;
  if (!tieneAlertas) return null;

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
        <div className="min-w-0 space-y-1">
          {alergias && (
            <p className="text-red-800 text-sm">
              <span className="font-bold">Alergias:</span> {alergias}
            </p>
          )}
          {enfermedadesSistemicas && (
            <p className="text-red-700 text-sm">
              <span className="font-semibold">Antecedentes médicos:</span> {enfermedadesSistemicas}
            </p>
          )}
          {medicamentosActuales && (
            <p className="text-red-700 text-sm">
              <span className="font-semibold">Medicamentos actuales:</span> {medicamentosActuales}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
