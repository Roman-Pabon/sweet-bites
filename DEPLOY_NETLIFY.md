# Desplegar Sweet Bites en Netlify

Netlify funciona bien para esta app. La base de datos usa archivos en `/tmp` (ver nota abajo).

## Paso 1 — Crear sitio en Netlify

1. Entra en https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. Conecta **GitHub** y elige el repo `sweet-bites`
4. Netlify detectará `netlify.toml` automáticamente
5. Clic en **Deploy site**

## Paso 2 — Variables de entorno

En el sitio → **Site configuration** → **Environment variables** → **Add a variable**:

| Variable | Valor |
|----------|--------|
| `DATA_DIR` | `/tmp/sweet-data` |
| `JWT_SECRET` | contraseña larga aleatoria |
| `SETUP_SECRET` | `SetupSweet2026!` |
| `NEXT_PUBLIC_APP_URL` | tu URL de Netlify (paso 3) |

Guarda y haz **Redeploy** (Deploys → Trigger deploy).

## Paso 3 — URL pública

Netlify te da una URL como:

`https://sweet-bites-xxxx.netlify.app`

Pon esa URL exacta en `NEXT_PUBLIC_APP_URL` (sin barra al final) y redeploy.

## Paso 4 — Crear admin

Abre tu sitio en el navegador → **F12** → **Console**:

```javascript
fetch("/api/setup/admin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    setupSecret: "SetupSweet2026!",
    username: "romania",
    password: "bimomylife"
  })
}).then(r => r.json()).then(console.log)
```

## Paso 5 — Probar en celulares

| Rol | URL |
|-----|-----|
| Usuario | `https://TU-SITIO.netlify.app` |
| Admin | `https://TU-SITIO.netlify.app/admin/login` |

---

## Importante sobre la base de datos en Netlify

Netlify usa funciones serverless. Los datos se guardan en `/tmp` mientras el servidor está activo.

- Para **probar en clase con dos celulares**, suele bastar.
- Si el sitio lleva mucho tiempo sin uso, puede reiniciarse y los usuarios creados se pierden.
- Para un proyecto permanente con muchos usuarios, mejor **Render** o **Railway** con volumen.

---

## Si algo falla

1. **Deploy failed** → Site → Deploys → ver **Deploy log**
2. **Registro no funciona** → F12 → Console → prueba `fetch("/api/ping").then(r=>r.json()).then(console.log)` (debe salir `{pong:true}`)
3. **QR no abre** → revisa que `NEXT_PUBLIC_APP_URL` sea la URL correcta de Netlify
