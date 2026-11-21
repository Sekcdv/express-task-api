# Historial de cambios

## [Unreleased]

### Agregado
- Vista de detalle en `/tasks/:id` con React Router instalado únicamente en `client`.
- Adaptador `getTask` para `GET /api/tasks/:id`, conservando el encabezado `Authorization: Bearer <token>`.
- Estados visibles de carga, tarea encontrada, 401 y 404, con enlace para volver al listado.
- Enlace “Ver detalle” desde cada tarjeta del listado.
- Pruebas del adaptador para la consulta por id, 401 y 404.
- Verificación de la ruta profunda en la prueba de humo de producción; se conserva la reescritura SPA `/* -> /index.html` de `render.yaml`.

### Corregido
- El config de Vitest del client ahora incluye `src/tests/**/*.test.ts`, de modo que `pnpm verify` ejecuta las pruebas del adaptador.
