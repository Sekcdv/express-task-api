# Producción: backend propio, Postman y MongoDB Atlas

Este documento deja el proyecto apuntando **únicamente a tus propios servicios** y describe el flujo completo para crear un usuario, obtener un token, localizarlo en Atlas y promoverlo a administrador.

## URLs del proyecto

| Servicio | URL |
| --- | --- |
| Backend (API) | `https://task-api-express-reemplaza.onrender.com` |
| Frontend (React) | `https://task-manager-frontend-reemplaza.onrender.com` |
| Salud de la API | `GET {Backend}/health` |
| Salud de MongoDB | `GET {Backend}/health/database` |
| Documentación | `{Backend}/api-docs` y `{Backend}/api-docs.json` |

El frontend Compila `VITE_API_URL` con la URL del backend, y el backend sólo acepta peticiones del origen del frontend (`CORS_ORIGIN`). Ambos valores están declarados en `render.yaml`.

## 1. Desplegar tu propio backend

1. Sube a GitHub la rama que contenga este `render.yaml`.
2. En Render, crea un **Blueprint** desde ese repositorio y esa rama. Render creará/actualizará dos servicios:
   - `task-api-express-reemplaza` (API Node).
   - `task-manager-frontend-reemplaza` (sitio estático, el mismo que ya está publicado).
3. En el servicio de la API, completa la variable `MONGODB_URI` con la cadena de conexión de tu cluster de Atlas (está declarada como `sync: false`, por lo que Render la pide durante el despliegue). `JWT_SECRET` se genera automáticamente en Render.
4. El servicio estático recibe `VITE_API_URL=https://task-api-express-reemplaza.onrender.com` desde `render.yaml`. Si ya existía un despliegue anterior del frontend, vuelve a desplegarlo para que el bundle incluya la nueva URL.
5. Comprueba `GET /health` y `GET /health/database`. En el plan free, la primera petición después de un periodo de inactividad puede tardar cerca de un minuto en despertar el servicio.

> Si Render asigna otra URL al servicio (por ejemplo porque el nombre ya está ocupado), copia esa URL y actualiza `PUBLIC_API_URL`, `VITE_API_URL` y `CORS_ORIGIN` en `render.yaml` antes de desplegar el frontend.

### Servicios que ya no se usan

Este repositorio ya no contiene referencias a servicios de terceros. Si quieres dar de baja un servicio antiguo desde otra cuenta de Render, hazlo en el panel de Render (Settings → Delete Service). El historial de Git puede conservar URLs antiguas en commits previos; no se han reescrito los commits.

## 2. Crear usuarios desde Postman

Define una variable de entorno en Postman, por ejemplo `API_URL = https://task-api-express-reemplaza.onrender.com`.

### Registro

`POST {{API_URL}}/api/auth/register`

Headers: `Content-Type: application/json`, `Accept: application/json`

```json
{
  "name": "Admin Prueba",
  "email": "admin.prueba@example.com",
  "password": "Frase segura para clase 2026"
}
```

La contraseña debe tener al menos 15 caracteres. La respuesta `201` devuelve `data.user` con `role: "user"`; nunca devuelve el hash de la contraseña.

### Inicio de sesión

`POST {{API_URL}}/api/auth/login`

```json
{
  "email": "admin.prueba@example.com",
  "password": "Frase segura para clase 2026"
}
```

La respuesta `200` incluye `data.accessToken`, `data.tokenType: "Bearer"` y `data.expiresIn`.

### Identidad

`GET {{API_URL}}/api/auth/me` con header `Authorization: Bearer <accessToken>`.

Este endpoint lee el usuario desde MongoDB, así que sirve para confirmar el rol que realmente está en Atlas.

## 3. Rastrear el token hasta MongoDB Atlas

El token **no se guarda en MongoDB**: es un JWT stateless. No busques el token en Atlas. Lo que puedes hacer es usar su claim `sub`:

1. Copia el `accessToken` del login.
2. Pégalo en `jwt.io`, o ejecuta en local:

   ```powershell
   pnpm token:inspect <accessToken>
   ```

   El script decodifica el JWT localmente (sin enviarlo a ningún sitio y sin verificar la firma, para que también funcione si expiró), muestra `sub`, `role`, `iat` y `exp`, y busca ese `_id` en la base configurada en tu `.env` (`MONGODB_DB_NAME=task_api`).

3. En Atlas: **Database → Collections → task_api → users**, y aplica el filtro:

   ```json
   { "_id": { "$oid": "<valor de sub>" } }
   ```

   Comprueba que el correo coincide con el usuario creado desde Postman.

## 4. Cambiar el rol a administrador y verificarlo

1. En Atlas, edita el documento del usuario y cambia `role` de `"user"` a `"admin"`.
   Alternativa local, usando la misma URI de Atlas del `.env`:

   ```powershell
   pnpm role:set admin.prueba@example.com admin
   ```

2. **Vuelve a iniciar sesión.** El `role` viaja dentro del JWT y queda fijado en el momento del login: el token antiguo seguirá diciendo `"user"` aunque Atlas ya diga `"admin"`. Tras un nuevo login el token contendrá `"role":"admin"`.
3. En la web, cierra sesión, vuelve a entrar y recarga la página. Verás `rol admin` en el encabezado y los botones de eliminación habilitados.
4. Verificación desde Postman con el token nuevo:
   - `GET /api/auth/me` → `data.user.role` es `"admin"`.
   - `DELETE {{API_URL}}/api/tasks/<id-de-24-caracteres>` → `204` (sin cuerpo).
   - Con el token anterior → `403` y `error.code = "FORBIDDEN"`.

Si prefieres que un cambio de rol en Atlas surta efecto **sin volver a iniciar sesión**, hay que cambiar la autorización para que lea el rol desde MongoDB en cada petición en lugar de fiarse del claim del JWT; dime si quieres ese cambio y lo implemento con sus pruebas.

## 5. Comprobación rápida del despliegue

```powershell
$env:API_URL = 'https://task-api-express-reemplaza.onrender.com'
$env:USER_EMAIL = 'admin.prueba@example.com'
$env:USER_PASSWORD = 'Frase segura para clase 2026'
pnpm smoke:release
```

El script valida `/health`, `/health/database`, el login, `/api/auth/me` y la lista protegida de tareas sin imprimir el token ni la contraseña.

### Problemas habituales

| Síntoma | Causa probable |
| --- | --- |
| `404` en la URL del backend | El servicio aún no se creó en Render o está durmiendo; espera y vuelve a intentar. |
| Error de CORS en la consola del navegador | `CORS_ORIGIN` debe ser exactamente `https://task-manager-frontend-reemplaza.onrender.com`. |
| `401 INVALID_TOKEN` | Token vencido o emitido con otro `JWT_SECRET`; inicia sesión de nuevo. |
| `403 FORBIDDEN` al borrar | El token fue emitido antes de cambiar el rol; haz un nuevo login. |
| `/health/database` devuelve `503` | Revisa `MONGODB_URI` y la whitelist IP de Atlas (Render debe poder conectarse desde cualquier IP: `0.0.0.0/0`). |
