-- Configuración de recordatorios automáticos por Telegram (gratis, sin
-- necesidad de la API de pago de WhatsApp Business).
CREATE TABLE "configuracion_telegram" (
    "id" TEXT NOT NULL,
    "botToken" TEXT,
    "chatId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_telegram_pkey" PRIMARY KEY ("id")
);
