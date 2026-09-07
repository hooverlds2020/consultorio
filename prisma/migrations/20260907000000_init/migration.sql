-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SUPER_ADMIN', 'RECEPCIONISTA', 'DENTISTA', 'TECNICO_LAB');

-- CreateEnum
CREATE TYPE "TipoOdontograma" AS ENUM ('ADULTO_32', 'INFANTIL_20');

-- CreateEnum
CREATE TYPE "EstatusCita" AS ENUM ('PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'NO_ASISTIO', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "EstatusCotizacion" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstatusPlan" AS ENUM ('EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoTrabajoLab" AS ENUM ('CORONA', 'PUENTE', 'PROTESIS_TOTAL', 'PROTESIS_PARCIAL', 'PLACA_GUARDA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstatusOrdenLab" AS ENUM ('RECIBIDO', 'EN_PROCESO', 'TERMINADO', 'ENTREGADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "TipoMovimientoInventario" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateEnum
CREATE TYPE "SeccionLanding" AS ENUM ('HERO', 'SERVICIOS', 'NOSOTROS', 'TESTIMONIOS', 'CONTACTO');

-- CreateEnum
CREATE TYPE "TipoGaleria" AS ENUM ('ANTES_DESPUES', 'GENERAL');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "telefono" TEXT,
    "whatsapp" TEXT,
    "direccion" TEXT,
    "alergias" TEXT,
    "enfermedadesSistemicas" TEXT,
    "medicamentosActuales" TEXT,
    "contactoEmergenciaNombre" TEXT,
    "contactoEmergenciaTelefono" TEXT,
    "eliminadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historiales_clinicos" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "dentistaId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT NOT NULL,
    "archivosAdjuntos" TEXT[],
    "eliminadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historiales_clinicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odontogramas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "dentistaId" TEXT NOT NULL,
    "tipo" "TipoOdontograma" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dientesJson" JSONB NOT NULL,
    "eliminadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "odontogramas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "dentistaId" TEXT NOT NULL,
    "sillon" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3) NOT NULL,
    "tipoTratamiento" TEXT NOT NULL,
    "estatus" "EstatusCita" NOT NULL DEFAULT 'PROGRAMADA',
    "notas" TEXT,
    "planTratamientoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios_catalogo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servicios_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "creadaPorId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estatus" "EstatusCotizacion" NOT NULL DEFAULT 'PENDIENTE',
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizacion_items" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "cotizacion_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes_tratamiento" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "estatus" "EstatusPlan" NOT NULL DEFAULT 'EN_CURSO',
    "totalPlan" DECIMAL(10,2) NOT NULL,
    "totalPagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planes_tratamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_laboratorio" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "dentistaId" TEXT NOT NULL,
    "tecnicoAsignadoId" TEXT,
    "tipoTrabajo" "TipoTrabajoLab" NOT NULL,
    "tonoDiente" TEXT,
    "material" TEXT,
    "diente" TEXT,
    "notas" TEXT,
    "estatus" "EstatusOrdenLab" NOT NULL DEFAULT 'RECIBIDO',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEntregaEstimada" TIMESTAMP(3),
    "fechaEntregaReal" TIMESTAMP(3),
    "eliminadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "planTratamientoId" TEXT,
    "registradoPorId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "folioRecibo" TEXT NOT NULL,
    "eliminadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "stockActual" DECIMAL(10,2) NOT NULL,
    "stockMinimo" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "tipo" "TipoMovimientoInventario" NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "registradoPorId" TEXT NOT NULL,
    "motivo" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consentimientos" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "dentistaId" TEXT NOT NULL,
    "tipoTratamiento" TEXT NOT NULL,
    "textoConsentimiento" TEXT NOT NULL,
    "firmaImagenPath" TEXT NOT NULL,
    "fechaFirma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consentimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_landing" (
    "id" TEXT NOT NULL,
    "seccion" "SeccionLanding" NOT NULL,
    "contenidoJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_landing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galeria_imagenes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoGaleria" NOT NULL,
    "imagenAntesPath" TEXT,
    "imagenDespuesPath" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galeria_imagenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonios" (
    "id" TEXT NOT NULL,
    "nombrePaciente" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "calificacion" INTEGER,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "pacientes_nombre_apellidos_idx" ON "pacientes"("nombre", "apellidos");

-- CreateIndex
CREATE INDEX "citas_fecha_dentistaId_idx" ON "citas"("fecha", "dentistaId");

-- CreateIndex
CREATE INDEX "citas_fecha_sillon_idx" ON "citas"("fecha", "sillon");

-- CreateIndex
CREATE UNIQUE INDEX "planes_tratamiento_cotizacionId_key" ON "planes_tratamiento"("cotizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_folioRecibo_key" ON "pagos"("folioRecibo");

-- CreateIndex
CREATE INDEX "pagos_fecha_idx" ON "pagos"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "config_landing_seccion_key" ON "config_landing"("seccion");

-- AddForeignKey
ALTER TABLE "historiales_clinicos" ADD CONSTRAINT "historiales_clinicos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historiales_clinicos" ADD CONSTRAINT "historiales_clinicos_dentistaId_fkey" FOREIGN KEY ("dentistaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogramas" ADD CONSTRAINT "odontogramas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogramas" ADD CONSTRAINT "odontogramas_dentistaId_fkey" FOREIGN KEY ("dentistaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_dentistaId_fkey" FOREIGN KEY ("dentistaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_planTratamientoId_fkey" FOREIGN KEY ("planTratamientoId") REFERENCES "planes_tratamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_creadaPorId_fkey" FOREIGN KEY ("creadaPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_items" ADD CONSTRAINT "cotizacion_items_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "cotizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_items" ADD CONSTRAINT "cotizacion_items_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios_catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_tratamiento" ADD CONSTRAINT "planes_tratamiento_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "cotizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_tratamiento" ADD CONSTRAINT "planes_tratamiento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_laboratorio" ADD CONSTRAINT "ordenes_laboratorio_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_laboratorio" ADD CONSTRAINT "ordenes_laboratorio_dentistaId_fkey" FOREIGN KEY ("dentistaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_laboratorio" ADD CONSTRAINT "ordenes_laboratorio_tecnicoAsignadoId_fkey" FOREIGN KEY ("tecnicoAsignadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_planTratamientoId_fkey" FOREIGN KEY ("planTratamientoId") REFERENCES "planes_tratamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_dentistaId_fkey" FOREIGN KEY ("dentistaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
