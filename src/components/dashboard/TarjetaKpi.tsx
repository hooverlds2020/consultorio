import type { LucideIcon } from "lucide-react";

export default function TarjetaKpi({
  titulo,
  valor,
  subtitulo,
  icono: Icono,
  color,
}: {
  titulo: string;
  valor: string;
  subtitulo?: string;
  icono: LucideIcon;
  color: "verde" | "azul" | "naranja" | "morado";
}) {
  const estilos = {
    verde: "bg-green-50 text-green-600",
    azul: "bg-blue-50 text-blue-600",
    naranja: "bg-orange-50 text-orange-600",
    morado: "bg-purple-50 text-purple-600",
  }[color];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-medium">{titulo}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{valor}</p>
          {subtitulo && <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>}
        </div>
        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${estilos}`}>
          <Icono size={20} />
        </div>
      </div>
    </div>
  );
}
