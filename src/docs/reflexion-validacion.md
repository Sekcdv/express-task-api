# Reflexión sobre Validación y Manejo de Errores

### 1. ¿Qué diferencia existe entre validar el formato HTTP y proteger una regla del negocio?
* **Validar el formato HTTP (Middleware):** Se encarga del *transporte*. Comprueba que la solicitud tenga la estructura sintáctica correcta antes de llegar a la lógica principal (por ejemplo, verificar que el encabezado sea `application/json`, que el campo `title` sea un string o que el `:id` sea un número entero)[cite: 9].
* **Proteger una regla del negocio (Servicio):** Protege la *invariante del dominio* independientemente de cómo se reciba la petición. Por ejemplo, en `task.service.ts`, verificar si una tarea realmente existe en la base de datos o en memoria antes de intentar actualizarla o eliminarla[cite: 9].

---

### 2. ¿Por qué conviene usar `router.param` para validar el `id`?
Permite aplicar el principio DRY (*Don't Repeat Yourself*)[cite: 9]. Al usar `taskRouter.param('id', validateTaskId)`, cualquier ruta que contenga el parámetro `:id` (`GET /:id`, `PATCH /:id/status`, `DELETE /:id`) ejecutará automáticamente la validación del identificador[cite: 9]. Esto evita duplicar la lógica de conversión y comprobación numérica en cada endpoint o controlador[cite: 9].

---

### 3. ¿Qué ventaja ofrece guardar datos normalizados en `res.locals`?
Garantiza que el controlador reciba datos limpios, parseados y con el tipo de dato correcto, evitando repetir operaciones de saneamiento[cite: 9]. Por ejemplo, en `validateTaskId` convertimos el string a un `number` válido y lo guardamos en `res.locals.taskId`[cite: 9]; o en `validateTaskTitle` aplicamos `.trim()` para eliminar espacios sobrantes[cite: 9]. Así, el controlador solo consume `res.locals.taskId` o `res.locals.taskTitle` directamente sin tener que hacer casting o limpieza adicional[cite: 9].

---

### 4. ¿Cuándo corresponde responder 400 y cuándo 422?
* **400 Bad Request:** Se utiliza cuando la solicitud no se puede procesar debido a un error de sintaxis en el cliente o un parámetro de formato inválido (por ejemplo, un JSON malformado con errores de comillas o enviar `/api/tasks/abc` donde se esperaba un número)[cite: 9].
* **422 Unprocessable Entity:** Se usa cuando el formato y la sintaxis son correctos (JSON válido), pero los valores o campos dentro del cuerpo no cumplen con las reglas de validación de datos (por ejemplo, enviar `{ "title": "" }` o un campo `completed` con un valor que no es booleano)[cite: 9].

---

### 5. ¿Por qué `notFound` delega el error en lugar de responder directamente?
Al llamar a `next(new AppError('No existe...', 404, 'ROUTE_NOT_FOUND'))`, la función delega el formato de respuesta al manejador centralizado de errores (`errorHandler`)[cite: 9]. Esto asegura que la respuesta mantenga exactamente la misma estructura JSON estándar que el resto de los errores de la aplicación (`error.code`, `error.message`, `requestId`), en lugar de construir un objeto de respuesta improvisado e inconsistente[cite: 9].

---

### 6. ¿Qué información no debe enviarse al cliente en un error 500?
Nunca deben enviarse detalles internos como *stack traces* de código, rutas de archivos del servidor, credenciales de bases de datos o excepciones internas de bibliotecas[cite: 9]. Exponer estos datos genera vulnerabilidades de seguridad[cite: 9]. El cliente solo debe recibir un mensaje genérico ("Ocurrió un error interno") junto con su código y un `requestId` para soporte[cite: 9].

---

### 7. ¿Cómo ayuda `requestId` durante la depuración?
El `requestId` asigna un UUID único a cada ciclo de petición-respuesta HTTP y lo adjunta tanto en las respuestas JSON como en el encabezado `X-Request-Id`[cite: 9]. Si un usuario reporta una falla o un error 500, puede proporcionar su `requestId`, lo que permite al equipo de desarrollo rastrear el log exacto en los archivos del servidor de manera rápida[cite: 9].

---

### 8. ¿Qué prueba demuestra que la refactorización no rompió la API anterior?
Las **pruebas de regresión** ejecutadas en Postman sobre las rutas existentes (como `GET /api/tasks`, `GET /api/tasks/:id`, o la creación de tareas válidas) demuestran que, tras agregar los middleware de validación y centralización de errores, las funcionalidades previas siguen respondiendo exitosamente con los estados esperados (ej. `200 OK`, `201 Created` o `204 No Content`)[cite: 9].