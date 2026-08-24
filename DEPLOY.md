# Cómo subir Sweet Bites para que los estudiantes entren desde el celular

La app usa una base de datos SQLite en disco. Por eso se despliega en **Railway** (no en Vercel), con un volumen para que los datos no se borren.

## Resumen rápido

1. Crear cuenta en [railway.app](https://railway.app)
2. Subir este proyecto
3. Añadir un **volumen** en `/app/data`
4. Configurar variables de entorno
5. Crear el usuario admin
6. Compartir la URL con los estudiantes

---

## Paso 1: Instalar herramientas (solo una vez)

Necesitas **Git** para subir el código:

1. Descarga Git: https://git-scm.com/download/win
2. Instálalo con las opciones por defecto
3. Reinicia Cursor o la terminal

Opcional: cuenta en **GitHub** (https://github.com) para guardar el código en la nube.

---

## Paso 2: Subir el código a GitHub

Abre PowerShell en la carpeta del proyecto (`sweet`) y ejecuta:

```powershell
git init
git add .
git commit -m "Preparar despliegue de tarjetas de fidelidad"
```

Crea un repositorio nuevo en GitHub (por ejemplo `sweet-bites`), luego:

```powershell
git remote add origin https://github.com/TU_USUARIO/sweet-bites.git
git branch -M main
git push -u origin main
```

(Sustituye `TU_USUARIO` por tu usuario de GitHub.)

---

## Paso 3: Desplegar en Railway

1. Entra en https://railway.app y crea cuenta (puedes usar GitHub).
2. **New Project** → **Deploy from GitHub repo** → elige `sweet-bites`.
3. Railway detectará el `Dockerfile` y empezará a construir la app.
4. Cuando termine, entra al servicio → pestaña **Settings** → **Networking** → **Generate Domain**.
   - Te dará una URL como `https://sweet-bites-production-xxxx.up.railway.app`

---

## Paso 4: Volumen para la base de datos (importante)

Sin esto, cada reinicio borraría usuarios y sellos.

1. En tu proyecto de Railway → clic en el servicio de la app.
2. Pestaña **Volumes** → **Add Volume**.
3. **Mount path:** `/app/data`
4. Guarda y espera a que redepliegue.

---

## Paso 5: Variables de entorno

En Railway → servicio → **Variables** → añade:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Tu URL de Railway, ej. `https://sweet-bites-production-xxxx.up.railway.app` |
| `JWT_SECRET` | Una contraseña larga aleatoria (ej. genera una en https://randomkeygen.com) |
| `DATA_DIR` | `/app/data` |
| `TELEGRAM_BOT_TOKEN` | (Opcional) Token del bot de Telegram para avisos 9/10 |
| `TELEGRAM_CHAT_ID` | (Opcional) Tu chat id de Telegram (varios separados por coma) |

Guarda. Railway redeployará solo.

> **Importante:** `NEXT_PUBLIC_APP_URL` debe ser exactamente la URL pública, **sin** barra al final. Así los QR de las tarjetas funcionan al escanearlos.

### Avisos por Telegram (opcional)

Para que te llegue un mensaje al celular cuando alguien llegue a **9/10** o complete **10/10**:

1. En Telegram habla con [@BotFather](https://t.me/BotFather) → `/newbot` → copia el **token**.
2. Abre tu bot nuevo y pulsa **Start** (o envíale cualquier mensaje).
3. En el navegador abre (cambia `TOKEN`):
   `https://api.telegram.org/botTOKEN/getUpdates`
4. Busca `"chat":{"id": NUMERO` — ese número es tu `TELEGRAM_CHAT_ID`.
5. En Railway añade `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`.
6. Entra a `/admin` y pulsa **Probar aviso de Telegram**.

---

## Paso 6: Crear el admin (vendedores)

La consola de Railway suele fallar con SQLite (`Segmentation fault`). Usa este método:

1. En Railway → **Variables**, añade:
   - `SETUP_SECRET` = una contraseña larga solo para setup (ej. `SetupSweet2026!`)

2. Espera el redeploy.

3. Desde tu PC (PowerShell), ejecuta (cambia la URL y el secret):

```powershell
Invoke-RestMethod -Method POST -Uri "https://TU-URL.up.railway.app/api/setup/admin" -ContentType "application/json" -Body '{"setupSecret":"SetupSweet2026!","username":"admin1","password":"TuContraseña"}'
```

Si sale `success: true`, el admin está creado.

**Alternativa (terminal de Railway):** si no da error:

```bash
npm run create-admin -- admin TuContraseñaSegura
```

---

## Paso 7: Probar

| Quién | Qué hacer |
|-------|-----------|
| **Estudiante** | Abre la URL de Railway en el celular → regístrate → ve su tarjeta con QR |
| **Vendedor** | Escanea el QR del estudiante → inicia sesión como admin → marca la galleta |

También pueden entrar los vendedores directo a:

`https://TU-URL.up.railway.app/admin/login`

---

## Coste

Railway tiene crédito gratis al registrarte. Para un proyecto universitario con pocos usuarios suele bastar. Revisa el uso en el panel de Railway.

---

## Si algo falla

- **El QR no abre nada:** revisa que `NEXT_PUBLIC_APP_URL` sea la URL correcta y reinicia el deploy.
- **No guarda usuarios:** confirma que el volumen está en `/app/data` y que `DATA_DIR=/app/data`.
- **No puedo entrar como admin:** vuelve a ejecutar `create-admin` en la terminal de Railway.

---

## Desarrollo en WiFi local (antes de subir)

Crea `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://TU_IP_LOCAL:3000
JWT_SECRET=dev-secret
DATA_DIR=./data
```

Luego:

```powershell
npm run dev -- -H 0.0.0.0
```

Los celulares en la misma WiFi entran con `http://TU_IP_LOCAL:3000`.
