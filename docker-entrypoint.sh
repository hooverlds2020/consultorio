#!/bin/sh
set -e

echo "Corrigiendo permisos del volumen de uploads..."
mkdir -p /app/public/uploads
chown -R nextjs:nodejs /app/public/uploads

echo "Aplicando migraciones de Prisma..."
su-exec nextjs node node_modules/prisma/build/index.js migrate deploy

echo "Iniciando servidor Next.js..."
exec su-exec nextjs node server.js
