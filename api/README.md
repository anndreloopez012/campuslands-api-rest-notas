# API de notas rápidas · CRUD MVC de 40 minutos

Este proyecto acompaña la web didáctica. El punto de partida de clase asume que Node.js, MongoDB y las dependencias del `package.json` ya están disponibles; por eso el ejercicio no incluye una fase de instalación.

## Orden de construcción usado en la guía

Sigue este orden para que ningún archivo importe algo que todavía no existe:

1. Verificar el `package.json` ya preparado.
2. Crear `src/app.js` básico.
3. Crear `src/server.js` básico y probar `/health`.
4. Crear los DTO de creación y actualización.
5. Crear las validaciones de POST, PATCH e ID.
6. Crear el modelo de Mongoose.
7. Crear el servicio con las cinco consultas.
8. Crear el controlador: POST, ambos GET, PATCH y DELETE.
9. Crear las rutas.
10. Crear el middleware de errores.
11. Reemplazar `app.js` para integrar el CRUD.
12. Reemplazar `server.js` para conectar MongoDB antes de escuchar.
13. Agregar cookies en el controlador y en `app.js`.
14. Agregar el header SemVer en la versión final de `app.js`.
15. Ejecutar las pruebas CRUD.

Cuando la guía dice **CREA**, el archivo todavía no existe. **CONTINÚA** significa pegar debajo del bloque anterior del mismo archivo. **REEMPLAZA** significa sustituir todo el contenido por el nuevo bloque completo.

## Cómo ejecutarlo

1. Asegúrate de que MongoDB esté activo en `mongodb://127.0.0.1:27017`.
2. Desde esta carpeta ejecuta `npm start`.
3. Abre otra terminal y comprueba `curl -i http://localhost:3000/health`.

La API crea automáticamente la base `api_notas_clase` cuando se guarda la primera nota.

## Estructura MVC utilizada

- `routes`: relaciona cada método y URL con su validación y controlador.
- `controllers`: recibe `req`, coordina el proceso y construye `res`.
- `services`: contiene las consultas realizadas con Mongoose.
- `models`: define la estructura de la colección en MongoDB.
- `dtos`: filtra y transforma los datos de entrada.
- `middlewares`: entrega respuestas consistentes cuando ocurre un error.

En esta API REST, la vista de MVC es el JSON enviado al cliente.

## Mapa del CRUD

| Método | Ruta | Acción | Resultado esperado |
|---|---|---|---|
| POST | `/api/v1/notas` | Crear | `201 Created` |
| GET | `/api/v1/notas` | Listar | `200 OK` |
| GET | `/api/v1/notas/:id` | Obtener una | `200` o `404` |
| PATCH | `/api/v1/notas/:id` | Actualizar | `200` o `404` |
| DELETE | `/api/v1/notas/:id` | Eliminar | `204` o `404` |

## Prueba de creación

```bash
curl -i -X POST http://localhost:3000/api/v1/notas \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"titulo":"Repasar Express","contenido":"Crear una ruta POST","categoria":"clase"}'
```

- `-i` muestra los headers, incluido `X-API-Version`.
- `-X POST` selecciona el método de creación.
- `-H` indica que el body es JSON.
- `-c cookies.txt` guarda la cookie que devuelve la API.
- `-d` envía los datos de la nota.

## Prueba de validación

```bash
curl -i -X POST http://localhost:3000/api/v1/notas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"No","contenido":"","categoria":"urgente"}'
```

El resultado esperado es `400 Bad Request` con tres errores de validación.

## Prueba de lectura

```bash
curl -i http://localhost:3000/api/v1/notas
```

El comando obtiene las notas ordenadas desde la más nueva. Copia el `_id` de la nota creada para las siguientes pruebas.

## Prueba de lectura individual

```bash
ID="PEGA_AQUÍ_EL_ID_CREADO"
curl -i http://localhost:3000/api/v1/notas/$ID
```

- La primera línea guarda el identificador para no repetirlo.
- La segunda llama al GET individual y debe devolver `200 OK`.

## Prueba de actualización

```bash
curl -i -X PATCH http://localhost:3000/api/v1/notas/$ID \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Express dominado"}'
```

`PATCH` permite cambiar solo el título. El DTO de actualización conserva el contenido y la categoría anteriores.

## Prueba de eliminación

```bash
curl -i -X DELETE http://localhost:3000/api/v1/notas/$ID
```

El resultado correcto es `204 No Content`: la operación terminó bien y no necesita devolver un body.

## Prueba de cookie

```bash
curl -i -b cookies.txt http://localhost:3000/api/v1/preferencia
```

`-b cookies.txt` reenvía la cookie y permite consultar la última categoría usada.

## Verificación automática

Ejecuta `npm test`. Las nueve pruebas comprueban salud, DTO, validación y los cinco endpoints CRUD sin necesitar una conexión activa a MongoDB.
