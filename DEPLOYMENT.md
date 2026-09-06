# Despliegue en Railway & Conexión con Supabase

La aplicación soporta **dos modos de base de datos automáticamente**:
1. **Supabase (PostgreSQL en la nube - 100% persistente y gratuito):** Se activa automáticamente al configurar la variable `DATABASE_URL`.
2. **SQLite local / Volumen:** Modo por defecto cuando no se define `DATABASE_URL`.

---

## ⚡ Conectar con Supabase (Persistencia permanente ante Deploys)

1. Crea o entra a tu proyecto en **[Supabase](https://supabase.com)**.
2. Ve a **Project Settings** (icono de tuerca) → **Database**.
3. Baja hasta la sección **Connection Pooling (Supavisor)**.
   - ⚠️ **ATENCIÓN:** NO uses la "Direct Connection" (`db.[ref].supabase.co`) porque resuelve a IPv6 y Railway solo soporta IPv4, lo cual causará error de conexión y la app volverá a SQLite local.
   - En **Connection Pooling**, selecciona modo **Session** (puerto `5432`) o **Transaction** (puerto `6543`).
4. Copia la URL URI de conexión, que tiene este formato:
   - `postgresql://postgres.[ref]:miPassword@aws-0-[region].pooler.supabase.com:6543/postgres`
5. En **Railway Dashboard** → tu Servicio → pestaña **Variables**, crea o actualiza:
   - `DATABASE_URL` = la URI copiada (reemplazando `[YOUR-PASSWORD]` por la contraseña de tu base de datos Supabase).
6. ¡Listo! La app detectará Supabase automáticamente, creará las tablas y mantendrá todas las configuraciones, reservas y datos para siempre sin borrarse en ningún deploy.

---

## Variables de Entorno en Railway

Configúralas en Railway (Dashboard → tu servicio → **Variables**):

| Variable | Valor (ejemplo) | Descripción |
|----------|------------------|-------------|
| `DATABASE_URL` | `postgresql://...` | *(Opcional)* Conexión a PostgreSQL en Supabase. Si se omite, usa SQLite local. |
| `PORT` | `3000` | Puerto interno (Railway lo inyecta automáticamente). |
| `PUBLIC_URL` | `https://tu-app.up.railway.app` | Base URL usada en `sitemap.xml`. |
| `VITE_SERVER_URL` | `https://tu-app.up.railway.app` | URL del backend desde el navegador. |
| `VITE_SITE_URL` | `https://tu-app.up.railway.app` | URL canónica para SEO. |

---

## Deploy

1. Al hacer `git push` a `main`, Railway compila y despliega automáticamente.
2. Si tienes `DATABASE_URL` de Supabase configurada, se conectará a la base de datos externa permanente.
