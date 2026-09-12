# Sistema Integral — Laboratorio y Consultorio Dental

Sistema de gestion para consultorio/laboratorio dental: pacientes, historial clinico,
odontograma interactivo, agenda, cotizaciones, ordenes de laboratorio, inventario, caja
y pagina web publica administrable.

Desarrollado a la medida para Consultorio Dental Cesar Aguilar (Chiapas, Mexico),
desplegado self-hosted en VPS propio.

---

## Stack tecnico

- Next.js 14 (App Router, Server Actions)
- PostgreSQL 15 (Docker)
- Prisma ORM 5.19.1 (fijo, ver nota de compatibilidad abajo)
- NextAuth.js con roles en BD
- TailwindCSS
- Docker + Docker Compose
- Proxy reverso externo (Caddy) + Let's Encrypt para HTTPS

## Roles del sistema

| Rol | Permisos |
|---|---|
| SUPER_ADMIN | Acceso total, reportes financieros, corte de caja, puede borrar |
| RECEPCIONISTA | CRUD pacientes, agenda, cotizaciones, pagos |
| DENTISTA | Historial clinico, odontograma, planes de tratamiento, agenda, ordenes de laboratorio |
| TECNICO_LAB | Solo ve ordenes de laboratorio, cambia estatus (Recibido, En proceso, Terminado, Entregado) |

---

## Estructura del proyecto

lab-dental/
  prisma/
    schema.prisma       (modelos de datos)
    migrations/         (historial de migraciones)
    seed.ts             (crea el primer usuario Super Admin)
  src/
    app/                (rutas, App Router)
      panel/            (area administrativa, requiere sesion)
      page.tsx          (landing publica)
    actions/            (Server Actions, logica de negocio)
    components/         (componentes React por modulo)
    lib/                (auth, permisos, cliente Prisma, validaciones Zod)
  docker-compose.yml
  Dockerfile
  docker-entrypoint.sh  (corre migraciones y arranca Next.js al iniciar el contenedor)
  .env.example

---

## Despliegue en produccion (VPS)

### Requisitos previos
- Docker + Docker Compose instalados
- Una red externa de Docker llamada proxy-network (compartida con el proxy reverso/Caddy)
- Dominio apuntando por registro A al VPS

### Primera vez

    cp .env.example .env
    nano .env   # Llena POSTGRES_PASSWORD, NEXTAUTH_SECRET (openssl rand -base64 32), CRON_SECRET

    docker compose build --no-cache
    docker compose up -d

El docker-entrypoint.sh aplica migraciones automaticamente al arrancar. La primera vez,
crea el Super Admin con el seed:

    docker compose exec lab-dental-app npx tsx prisma/seed.ts

NOTA: El seed tiene un correo y nombre hardcodeados en prisma/seed.ts. Si este proyecto
se reutiliza como base para otro cliente/consultorio, editar ese archivo antes de
correr el seed.

### Actualizar tras cambios de codigo

    docker compose build --no-cache
    docker compose up -d
    docker restart caddy

---

## NOTA IMPORTANTE: migraciones de Prisma

El contenedor lab-dental-app usa el build standalone de Next.js, que NO incluye
el CLI de Prisma (node_modules/.bin/prisma no existe dentro del contenedor). Por eso,
para correr una migracion manual desde el VPS hay que:

1. Usar la version exacta del proyecto (Prisma 5.19.1 - npx prisma sin pin instala
   la version mas reciente, que es incompatible con este schema.prisma).
2. Apuntar la DATABASE_URL al puerto publicado de Postgres (127.0.0.1:5435), no al
   hostname interno de Docker (lab-dental-db), que solo es alcanzable dentro de la red
   de contenedores.

Ejemplo:

    DATABASE_URL="postgresql://lab_dental:TU_POSTGRES_PASSWORD@127.0.0.1:5435/lab_dental?schema=public" \
      npx --yes prisma@5.19.1 migrate dev --name nombre_de_la_migracion

Despues de migrar, siempre reconstruir la imagen (docker compose build --no-cache) para
que el cliente de Prisma generado dentro del contenedor quede sincronizado con el schema.

---

## Variables de entorno (.env)

| Variable | Descripcion |
|---|---|
| POSTGRES_PASSWORD | Contrasena de la base de datos |
| NEXTAUTH_SECRET | Secreto de sesion, generar con openssl rand -base64 32 |
| CRON_SECRET | Protege el endpoint de recordatorios automaticos (cron + Telegram) |
| TZ | Zona horaria, America/Mexico_City |

DATABASE_URL y NEXTAUTH_URL NO van en .env, estan fijos en docker-compose.yml
porque dependen del hostname interno de Docker y del dominio de produccion.

---

## Convenciones de codigo (para mantener consistencia)

- Nombres de campos y funciones en espanol (nombre, apellidos, crearPaciente,
  actualizarPaciente), consistente con el resto del proyecto.
- Validacion con Zod en src/lib/validaciones/, un schema por entidad.
- Server Actions con el patron EstadoFormulario = { ok: boolean; errores?; mensaje? }
  usado junto con useFormState en el cliente.
- Acciones que reciben un id (editar/eliminar un registro especifico) usan
  .bind(null, id) en el Server Component antes de pasarlas al Client Component
  (ver actualizarPaciente.bind(null, paciente.id) en
  src/app/panel/pacientes/[id]/page.tsx como referencia).
- Borrado de pacientes y servicios es soft delete (eliminadoEn / activo: false),
  nunca se borra la fila fisicamente, protege reportes e historial existentes.
- Iconos: lucide-react (ya en dependencias), no SVGs sueltos hardcodeados.
- Al editar archivos .tsx/JSX via terminal remota, usar Python heredoc con assert
  de coincidencia exacta antes de escribir (evita romper JSX con sed multilinea).
  Validar sintaxis de cada archivo tocado con:

    npx -p typescript@5 tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck archivo.tsx

  antes de correr el build completo.

---

## Pendientes conocidos (v1 hacia v1.1)

- Ficha de paciente: falta CURP, foto de perfil, campos de tutor para menores.
- Odontograma: la orientacion Mesial/Distal es una convencion fija igual en los 32
  dientes; anatomicamente deberia invertirse segun el lado de la boca.
- Odontograma: no se puede editar un hallazgo ya guardado, solo borrar y recapturar.
- Catalogo CIE-10 incompleto (solo 63 codigos K00-K08 + fractura), pendiente completar
  con el Excel oficial de la DGIS.
- Radiografias subidas no se pueden eliminar.
- BUG CONOCIDO: si se edita el anticipo de una orden de laboratorio una segunda vez,
  el egreso correspondiente en Caja no se ajusta (solo se crea la primera vez). Revisar
  antes de dar de alta mas clientes, ya que afecta cifras financieras.

---

## Contacto / mantenimiento

Proyecto desarrollado y mantenido por Roberto Carlos Hoover Silvano (clickwebhoover.online).
