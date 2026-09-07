import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { esSuperAdmin } from "@/lib/permisos";
import { listarTodaGaleria } from "@/actions/landing";
import GaleriaForm from "@/components/config-landing/GaleriaForm";
import DesactivarImagenBoton from "@/components/config-landing/DesactivarImagenBoton";

export default async function GaleriaConfigPage() {
  const session = await getServerSession(authOptions);
  if (!session || !esSuperAdmin(session.user.rol)) {
    redirect("/panel");
  }

  const imagenes = await listarTodaGaleria();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Galería</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {imagenes.length === 0 && (
            <p className="text-gray-400 text-sm col-span-full">Sin imágenes todavía.</p>
          )}
          {imagenes.map((img) => (
            <div key={img.id} className="bg-white rounded-lg shadow-sm p-2">
              {img.tipo === "GENERAL" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.imagenAntesPath!} alt="" className="w-full h-24 object-cover rounded" />
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imagenAntesPath!} alt="Antes" className="w-full h-24 object-cover rounded" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imagenDespuesPath!} alt="Después" className="w-full h-24 object-cover rounded" />
                </div>
              )}
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-400">
                  {img.tipo === "GENERAL" ? "General" : "Antes/Después"}
                  {!img.activo && " · Oculta"}
                </span>
                {img.activo && <DesactivarImagenBoton id={img.id} />}
              </div>
            </div>
          ))}
        </div>

        <div>
          <GaleriaForm />
        </div>
      </div>
    </div>
  );
}
