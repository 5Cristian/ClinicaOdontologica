# Clinica Odontologica

Proyecto reorganizado en arquitectura separada:

```text
/clinica-odontologica
  /backend
  /frontend
```

## Resumen

- `backend/`: API REST independiente con `Node.js`, `Express`, `TypeScript`, `Prisma`, `PostgreSQL`, `JWT`, `Zod`, `Helmet`, `CORS`, `rate limiting` y manejo centralizado de errores.
- La autenticación ya incluye `access token` corto y `refresh token` en cookie `HttpOnly`.
- `frontend/`: aplicación `Next.js` con `TypeScript`, `Tailwind CSS`, formularios con `React Hook Form` y consumo exclusivo del backend mediante `NEXT_PUBLIC_API_URL`.

## Backend

### Instalación

```bash
cd backend
npm install
```

### Variables de entorno

Copie `backend/.env.example` a `backend/.env`.

Sin `backend/.env` con `DATABASE_URL` válida no funcionarán:
- `npm run db:migrate`
- `npm run db:seed`
- `npm run admin:reset`
- el login del administrador inicial

Variables nuevas de autenticación endurecida:

```env
JWT_REFRESH_SECRET="cambia-este-refresh-secreto-super-largo"
JWT_REFRESH_EXPIRES_IN="7d"
```

Variables nuevas para WhatsApp real con Twilio:

```env
APP_BASE_URL="http://localhost:4000"
WHATSAPP_PROVIDER="MANUAL"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
```

Variables para WhatsApp Web local:

```env
WHATSAPP_PROVIDER="WHATSAPP_WEB"
WHATSAPP_WEB_SESSION_PATH=".wwebjs_auth"
WHATSAPP_WEB_CHROME_PATH=""
WHATSAPP_WEB_AUTO_START="false"
REMINDER_CRON_EXPRESSION="*/15 * * * *"
REMINDER_TIMEZONE="America/Guatemala"
```

`WHATSAPP_WEB_SESSION_PATH` guarda la sesion local generada al escanear el QR. No debe subirse al repositorio.

### Base de datos

```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

Si el usuario administrador no puede iniciar sesión:

```bash
cd backend
npm run admin:reset
```

Para producción:

```bash
cd backend
npm run db:generate
npm run db:deploy
npm run db:seed
```

### Ejecutar backend

```bash
cd backend
npm run dev
```

Backend disponible en `http://localhost:4000`.

### Endpoints mínimos

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`
- `GET /api/citas`
- `POST /api/citas`
- `GET /api/citas/:id`
- `PUT /api/citas/:id`
- `PATCH /api/citas/:id/status`
- `DELETE /api/citas/:id`
- `GET /api/treatments`
- `POST /api/treatments`
- `PUT /api/treatments/:id`
- `DELETE /api/treatments/:id`
- `POST /api/reminders/whatsapp/:citaId`
- `GET /api/reminders/proveedor-status`
- `GET /api/reminders/whatsapp-web/status`
- `POST /api/reminders/whatsapp-web/start`
- `POST /api/reminders/whatsapp-web/disconnect`
- `POST /api/reminders/process-one-day`
- `POST /api/webhooks/twilio/whatsapp/status`
- `POST /api/webhooks/twilio/whatsapp/inbound`

### Seguridad implementada en backend

- `JWT` para autenticación.
- Rotación de sesión con `refresh token` persistido y cookie `HttpOnly`.
- Integración opcional con `Twilio WhatsApp` para envío real y webhook bidireccional.
- Contraseñas con `bcrypt`.
- Roles: `ADMINISTRADOR`, `RECEPCION`, `ODONTOLOGO`.
- Validaciones con `Zod`.
- Sanitización básica de entradas.
- `Helmet`.
- `CORS` restringido a `FRONTEND_URL`.
- `express-rate-limit` general y específico para login.
- `morgan` para logs HTTP.
- `express.json` limitado a `10kb`.
- `x-powered-by` deshabilitado.
- Manejo centralizado de errores y respuestas JSON estándar.

## Frontend

### Instalación

```bash
cd frontend
npm install
```

### Variables de entorno

Copie `frontend/.env.example` a `frontend/.env`.

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Ejecutar frontend

```bash
cd frontend
npm run dev
```

Frontend disponible en `http://localhost:3000`.

## Usuario inicial

- Correo: `admin@clinica.com`
- Contraseña: `Admin12345*`

## Producción

Para desplegar con Supabase y Vercel consulte:

```text
docs/despliegue-supabase-vercel.md
```

### Recomendaciones obligatorias

1. Servir frontend y backend solo por `HTTPS`.
2. Emitir certificados SSL/TLS con `Let's Encrypt`.
3. Redirigir `HTTP -> HTTPS` en el proxy o balanceador.
4. Definir un `JWT_SECRET` largo, aleatorio y único por entorno.
5. Definir también `JWT_REFRESH_SECRET` distinto al access token.
6. Restringir `FRONTEND_URL` al dominio real de producción.
7. No exponer secretos en el frontend.
8. Mover el backend detrás de `Nginx`, `Traefik` o un proxy administrado.
9. Configurar rotación de logs y monitoreo de errores.
10. Ejecutar migraciones con `npm run db:deploy`.
11. Validar backups antes de cada despliegue importante.

### Ejemplo de flujo de despliegue

```bash
cd backend
npm ci
npm run db:generate
npm run db:deploy
npm run build
npm run start
```

### Configuración Twilio WhatsApp

1. Configure en `backend/.env`:

```env
WHATSAPP_PROVIDER="TWILIO"
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_FROM="whatsapp:+1..."
APP_BASE_URL="https://tu-backend-real.com"
```

2. Configure en Twilio:
- `Status Callback URL`: `https://tu-backend-real.com/api/webhooks/twilio/whatsapp/status`
- `A message comes in`: `https://tu-backend-real.com/api/webhooks/twilio/whatsapp/inbound`

3. El paciente puede responder:
- `CONFIRMO`
- `CANCELAR`
- `REPROGRAMAR`

El backend interpreta esa respuesta y actualiza la cita automáticamente.

```bash
cd frontend
npm ci
npm run build
npm run start
```

## Backups y mantenimiento

### Backup PostgreSQL

```bash
pg_dump "$DATABASE_URL" > backup_clinica.sql
```

### Restauración

```bash
psql "$DATABASE_URL" < backup_clinica.sql
```

### Mantenimiento recomendado

- Revisar dependencias desactualizadas con `npm outdated`.
- Revisar vulnerabilidades con `npm audit`.
- Aplicar parches de seguridad de forma controlada.
- Programar backups automáticos diarios o por ventana operativa.
- Probar restauración periódicamente en entorno de staging.

## Checklist de despliegue seguro

- [ ] `JWT_SECRET` cambiado por uno real y fuerte.
- [ ] `JWT_REFRESH_SECRET` cambiado por uno distinto y fuerte.
- [ ] `DATABASE_URL` apunta a instancia protegida.
- [ ] `FRONTEND_URL` restringido al dominio oficial.
- [ ] `NEXT_PUBLIC_API_URL` apunta al backend productivo.
- [ ] HTTPS activo en frontend y backend.
- [ ] Backups automáticos activos.
- [ ] Logs y monitoreo habilitados.
- [ ] `npm audit` revisado antes del despliegue.
- [ ] Migraciones aplicadas correctamente.
- [ ] Usuario administrador inicial rotado o contraseña cambiada.
