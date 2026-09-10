-- Convierte "pagos" en un libro de caja real: además de ingresos de
-- pacientes, ahora también puede registrar egresos (ej. lo pagado a un
-- laboratorio externo), con trazabilidad hacia la cita o la orden de
-- laboratorio que originó el movimiento.

CREATE TYPE "TipoMovimientoCaja" AS ENUM ('INGRESO', 'EGRESO');

ALTER TABLE "pagos" ADD COLUMN "tipo" "TipoMovimientoCaja" NOT NULL DEFAULT 'INGRESO';
ALTER TABLE "pagos" ADD COLUMN "concepto" TEXT;
ALTER TABLE "pagos" ADD COLUMN "citaId" TEXT;
ALTER TABLE "pagos" ADD COLUMN "ordenLaboratorioId" TEXT;

ALTER TABLE "pagos" ADD CONSTRAINT "pagos_citaId_fkey"
  FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pagos" ADD CONSTRAINT "pagos_ordenLaboratorioId_fkey"
  FOREIGN KEY ("ordenLaboratorioId") REFERENCES "ordenes_laboratorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
