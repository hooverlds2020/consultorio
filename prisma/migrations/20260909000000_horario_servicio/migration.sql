-- Horario de atención de la clínica (una sola fila). Permite que la
-- Agenda recorte su grilla al horario real en vez de mostrar siempre
-- 8:00-20:00 fijo, y sirve de base para validar que no se agenden citas
-- fuera de horario o en días cerrados.
CREATE TABLE "horario_servicio" (
    "id" TEXT NOT NULL,
    "horariosJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horario_servicio_pkey" PRIMARY KEY ("id")
);
