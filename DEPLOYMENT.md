# Despliegue en Railway & Conexión con Supabase

La aplicación soporta **dos modos de base de datos automáticamente**:
1. **Supabase (PostgreSQL en la nube - 100% persistente y gratuito):** Se activa automáticamente al configurar la variable `DATABASE_URL`.
2. **SQLite local / Volumen:** Modo por defecto cuando no se define `DATABASE_URL`.

---

## ⚡ Conectar con Supabase (Recomendado para no perder datos en cuentas gratis)

1. Crea un proyecto gratuito en **[Supabase](https://supabase.com)**.
2. En Supabase ve a **Project Settings** → **Database** → **Connection String** → pestaña **URI** (o modo **Node.js** / **Session/Transaction Pooler**).
3. Copia la URL de conexión (reemplazando `[YOUR-PASSWORD]` por la contraseña de tu base de datos Supabase).
   - Ejemplo: `postgresql://postgres.[ref]:miPassword@aws-0-[region].pooler.supabase.com:6543/postgres`
4. En **Railway Dashboard** → tu Servicio → pestaña **Variables**, agrega:
   - `DATABASE_URL` = `tu_url_de_supabase`
5. ¡Listo! La app creará automáticamente las tablas (`users`, `countries`, `cities`, `shuttles`, `bookings`, `settings`, `faqs`) y poblará los datos iniciales. Tus reservas y configuraciones nunca se borrarán.

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
