# Despliegue en Railway

Arquitectura elegida: **un solo servicio persistente** (frontend + backend en el mismo contenedor, con disco persistente en `/data`).

## Requisitos previos

- Repositorio subido a GitHub (`origin` ya configurado).
- `server/database.sqlite` fuera del tracking de git (ya está en `.gitignore`).

## Variables de entorno

Configúralas en Railway (Dashboard → tu servicio → **Variables**):

| Variable | Valor (ejemplo) | Descripción |
|----------|------------------|-------------|
| `PORT` | `3000` | Puerto interno (Railway inyecta `PORT` automáticamente y expone el mismo). |
| `PUBLIC_URL` | `https://tu-app.up.railway.app` | Base URL usada en `sitemap.xml`. |
| `DATA_DIR` | `/data` | Directorio persistente para la DB e imágenes. **Debe coincidir con el volumen.** |
| `VITE_SERVER_URL` | `https://tu-app.up.railway.app` | URL del backend desde el navegador. |
| `VITE_SITE_URL` | `https://tu-app.up.railway.app` | URL canónica para SEO/canonical/hreflang. |

> Nota: `VITE_*` se inyectan en **build time** (build args del Dockerfile). Cámbialas y haz **redeploy** si cambian.

## Volumen persistente

- Añade un **Volume** en Railway montado en el path `/data`.
- La base de datos `database.sqlite`, las imágenes subidas y las imágenes généricas del seed se guardan ahí.
- Al primer arranque el servidor copia las imágenes estáticas del repo e inicializa la DB + seed automáticamente.

## Deploy

1. Railway detecta el `Dockerfile` de la raíz (configuración en `railway.json`).
2. El build hace: `npm ci` del cliente → `vite build` → `npm ci --omit=dev` del server → imagen final.
3. El container arranca con `node src/index.js` y monta el volumen `/data`.

Desde CLI:

```bash
railway up
```

O desde el dashboard: **New Project → Deploy from GitHub repo**.

## Verificación

- `/api/health` → `{ "status": "ok", ... }`
- `/` → app
- `/sitemap.xml` → usa `PUBLIC_URL`
- `/robots.txt`

## Producción vs desarrollo

- En **desarrollo local**, `config.js` usa rutas relativas por defecto (`server/public/images`, `server/database.sqlite`), por lo que sigue funcionando sin variables de entorno.
- En **producción**, fija `DATA_DIR=/data`, `IMAGES_DIR=/data/images` (implícito vía `syncSeedImages` + `IMAGES_DIR` del Dockerfile) y `PUBLIC_URL`.
