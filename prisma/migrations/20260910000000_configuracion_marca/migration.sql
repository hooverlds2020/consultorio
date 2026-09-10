-- Logo del negocio administrable desde un solo lugar (Configuración),
-- usado en login, panel, página pública y PDF de cotizaciones.
CREATE TABLE "configuracion_marca" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_marca_pkey" PRIMARY KEY ("id")
);
