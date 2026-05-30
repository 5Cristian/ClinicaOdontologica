# Despliegue con Supabase y Vercel

Esta guia conecta el sistema para que pueda verse desde otros equipos usando:

- Base de datos PostgreSQL en Supabase.
- Frontend Next.js en Vercel.
- Backend Express en un servidor publico persistente.

## 1. Arquitectura recomendada

```text
Usuario externo
  -> Frontend Vercel
      -> Backend publico HTTPS
          -> Supabase PostgreSQL
```

Importante: el backend actual es Express y tambien puede usar WhatsApp Web con Puppeteer. Para WhatsApp Web no se recomienda desplegar el backend como funcion serverless de Vercel, porque necesita proceso persistente, sesion local y navegador controlado. Use Render, Railway, Fly.io, VPS, Docker o un servidor Node persistente para el backend.

## 2. Variables del backend

En el proveedor donde despliegue el backend configure:

```env
NODE_ENV="production"
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"
JWT_SECRET="<secreto-largo-minimo-32-caracteres>"
JWT_EXPIRES_IN="8h"
JWT_REFRESH_SECRET="<otro-secreto-largo-distinto>"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000
FRONTEND_URL="https://TU-FRONTEND.vercel.app"
FRONTEND_URLS="https://TU-DOMINIO.com,https://TU-FRONTEND.vercel.app"
BCRYPT_SALT_ROUNDS=10
APP_BASE_URL="https://TU-BACKEND.com"
WHATSAPP_PROVIDER="MANUAL"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
WHATSAPP_WEB_SESSION_PATH=".wwebjs_auth"
WHATSAPP_WEB_CHROME_PATH=""
WHATSAPP_WEB_AUTO_START="false"
WHATSAPP_DEFAULT_COUNTRY_CODE="502"
REMINDER_CRON_EXPRESSION="*/15 * * * *"
REMINDER_TIMEZONE="America/Guatemala"
```

Use la cadena de conexion de Supabase en modo pooler cuando el proveedor abra muchas conexiones. En Supabase se encuentra en:

```text
Project Settings > Database > Connection string
```

## 3. Variables del frontend en Vercel

En Vercel, dentro del proyecto del frontend:

```env
NEXT_PUBLIC_API_URL="https://TU-BACKEND.com/api"
```

No use `localhost` en Vercel. `localhost` solo funciona en la misma computadora donde corre el backend.

## 4. Migraciones en Supabase

Antes de usar la aplicacion en produccion, aplique migraciones contra Supabase:

```bash
cd backend
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
```

Si ejecuta esto desde local, asegure que `backend/.env` apunte temporalmente a `DATABASE_URL` de Supabase. No suba ese `.env` al repositorio.

## 5. CORS y cookies

El backend permite solicitudes solo desde:

- `FRONTEND_URL`
- URLs adicionales en `FRONTEND_URLS`, separadas por coma.

En produccion las cookies de refresh token se configuran como:

```text
SameSite=None
Secure=true
HttpOnly=true
```

Por eso frontend y backend deben estar en HTTPS.

## 6. Checklist de verificacion

1. Backend publico responde:

```text
https://TU-BACKEND.com/health
```

2. Frontend Vercel tiene:

```text
NEXT_PUBLIC_API_URL=https://TU-BACKEND.com/api
```

3. Backend tiene:

```text
FRONTEND_URL=https://TU-FRONTEND.vercel.app
DATABASE_URL=<conexion supabase>
```

4. Supabase tiene migraciones aplicadas.

5. Login funciona desde Vercel.

6. Citas, pacientes y tratamientos cargan desde Supabase.

## 7. Problemas comunes

### El frontend carga, pero no trae datos

Revise `NEXT_PUBLIC_API_URL`. Si apunta a `http://localhost:4000/api`, otros equipos no podran conectarse.

### Error de CORS

Agregue el dominio exacto de Vercel en `FRONTEND_URL` o `FRONTEND_URLS`.

### Login funciona pero se pierde la sesion

Asegure que backend use HTTPS y `NODE_ENV=production`.

### Backend no conecta a Supabase

Revise usuario, password, region, pooler y que la IP del host tenga acceso permitido en Supabase.

