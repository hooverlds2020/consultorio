# ==========================================
# Etapa 1: Dependencias
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
RUN npm ci

# ==========================================
# Etapa 2: Build
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Genera el cliente de Prisma antes del build de Next
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ==========================================
# Etapa 3: Runtime (imagen final, mínima)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl su-exec tzdata
ENV TZ=America/Mexico_City

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Carpeta de uploads con permisos correctos para el volumen
RUN mkdir -p /app/public/uploads \
    && chown -R nextjs:nodejs /app/public/uploads

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

# El contenedor arranca como root SOLO para poder corregir los permisos
# del volumen de uploads (que Docker puede montar con dueño root la
# primera vez). El entrypoint cede los privilegios a "nextjs" antes de
# ejecutar cualquier código de la aplicación.

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
