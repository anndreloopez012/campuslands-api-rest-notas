# Campuslands · API REST de notas

Ejercicio visual y guiado de **40 minutos** para reforzar los fundamentos de Node.js y Express mediante la construcción de un CRUD completo con arquitectura MVC y MongoDB.

**Autor:** Andre Lopez

**Guía publicada:** [anndreloopez012.github.io/campuslands-api-rest-notas](https://anndreloopez012.github.io/campuslands-api-rest-notas/)

## ¿Qué incluye?

- Una guía web responsive y visualmente atractiva.
- 21 bloques de código ordenados para programar desde cero.
- 21 explicaciones que describen qué hace cada bloque completo.
- API REST funcional con cinco operaciones CRUD.
- DTO para creación y actualización.
- Validaciones con `express-validator`.
- Arquitectura MVC separada por responsabilidades.
- Persistencia con MongoDB y Mongoose.
- Cookies HTTP para recordar la última categoría.
- Versionado SemVer mediante el header `X-API-Version`.
- Simulador visual de peticiones y respuestas.
- Nueve pruebas automatizadas.

## Objetivo del ejercicio

Al finalizar, el estudiante podrá explicar y construir el recorrido completo de una petición:

```text
Cliente → Ruta → Validación → Controlador → DTO → Servicio → Modelo → MongoDB
```

La respuesta vuelve por las mismas capas hasta llegar al cliente como JSON.

## Ruta de aprendizaje de 40 minutos

| Etapa | Tema | Resultado |
|---|---|---|
| 0 | Base del proyecto | Reconocer `package.json` y la estructura de carpetas |
| 1 | Express | Crear la aplicación, el servidor y `/health` |
| 2 | DTO | Filtrar y transformar los datos recibidos |
| 3 | Validaciones | Detener datos incorrectos antes del controlador |
| 4 | MVC + CRUD | Implementar modelo, servicio, controladores y rutas |
| 5 | Cookies | Recordar la última categoría creada |
| 6 | SemVer | Comunicar la versión de la API |
| 7 | Pruebas | Comprobar POST, GET, PATCH y DELETE |

La guía no muestra tiempos en el menú para evitar distraer al estudiante. El temporizador general de 40 minutos puede iniciarse desde la barra superior.

## Orden real de construcción

Los bloques de la guía deben copiarse en este orden:

1. Verificar `api/package.json`.
2. Crear `api/src/app.js` básico.
3. Crear `api/src/server.js` básico y probar `/health`.
4. Crear los DTO de creación y actualización.
5. Crear las validaciones de POST, PATCH e ID.
6. Crear el modelo de Mongoose.
7. Crear el servicio con las cinco consultas CRUD.
8. Crear los controladores POST, GET, PATCH y DELETE.
9. Crear las rutas.
10. Crear el middleware de errores.
11. Reemplazar `app.js` para ensamblar el CRUD.
12. Reemplazar `server.js` para conectar MongoDB.
13. Incorporar cookies en el controlador y en `app.js`.
14. Incorporar SemVer en la versión final de `app.js`.
15. Ejecutar las pruebas completas.

En la guía, cada barra de código indica una acción:

- **CREA:** el archivo todavía no existe.
- **CONTINÚA:** el bloque se pega debajo del código anterior del mismo archivo.
- **REEMPLAZA:** se sustituye todo el contenido por el nuevo bloque completo.
- **PRUEBA:** el bloque se ejecuta en la terminal.

## Estructura del repositorio

```text
campuslands-api-rest-notas/
├── index.html
├── styles.css
├── app.js
├── README.md
└── api/
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── src/
    │   ├── app.js
    │   ├── server.js
    │   ├── controllers/nota.controller.js
    │   ├── dtos/crear-nota.dto.js
    │   ├── dtos/actualizar-nota.dto.js
    │   ├── middlewares/error.middleware.js
    │   ├── models/nota.model.js
    │   ├── routes/nota.routes.js
    │   ├── services/nota.service.js
    │   └── validators/nota.validator.js
    └── test/api.test.js
```

## Responsabilidad de cada capa

| Capa | Responsabilidad |
|---|---|
| Routes | Relaciona método, URL, validación y controlador |
| Validators | Comprueba formato, longitud y valores permitidos |
| Controllers | Recibe `req`, coordina el proceso y construye `res` |
| DTO | Selecciona y transforma únicamente los campos válidos |
| Services | Centraliza las consultas realizadas con Mongoose |
| Models | Define la forma de los documentos de MongoDB |
| Middlewares | Entrega errores HTTP consistentes |

En esta API, la vista de MVC es la respuesta JSON que recibe el cliente.

## Requisitos

- Node.js 20 o superior.
- MongoDB disponible en `mongodb://127.0.0.1:27017`.
- Un navegador web moderno.

Durante la clase se asume que estos requisitos y las dependencias ya están preparados. No forman parte de los 40 minutos del ejercicio.

## Ejecutar la guía web

Desde la raíz del repositorio:

```bash
python3 -m http.server 4173
```

Después abre `http://127.0.0.1:4173`.

La guía publicada en GitHub Pages funciona directamente en el navegador. Su laboratorio es una simulación didáctica local, por lo que el sitio público no necesita conectarse con la base de datos del estudiante.

## Ejecutar la API

```bash
cd api
npm ci
npm start
```

La API estará disponible en `http://localhost:3000`. MongoDB creará la base `api_notas_clase` cuando se guarde la primera nota.

También puede utilizarse el modo de desarrollo con `npm run dev`.

## Endpoints

| Método | Ruta | Acción | Respuesta esperada |
|---|---|---|---|
| GET | `/health` | Verificar estado y versión | `200 OK` |
| POST | `/api/v1/notas` | Crear una nota | `201 Created` |
| GET | `/api/v1/notas` | Listar notas | `200 OK` |
| GET | `/api/v1/notas/:id` | Obtener una nota | `200` o `404` |
| PATCH | `/api/v1/notas/:id` | Actualizar parcialmente | `200` o `404` |
| DELETE | `/api/v1/notas/:id` | Eliminar una nota | `204` o `404` |
| GET | `/api/v1/preferencia` | Consultar cookie guardada | `200 OK` |

## Formato de una nota

```json
{
  "titulo": "Repasar Express",
  "contenido": "Crear y probar una ruta POST",
  "categoria": "clase"
}
```

Las categorías permitidas son `clase`, `tarea` y `personal`.

## Pruebas manuales

### Salud y SemVer

```bash
curl -i http://localhost:3000/health
```

Debe responder `200 OK`, incluir `X-API-Version: 1.0.0` y devolver la versión en el JSON.

### Crear una nota y guardar la cookie

```bash
curl -i -X POST http://localhost:3000/api/v1/notas \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"titulo":"Repasar Express","contenido":"Crear una ruta POST","categoria":"clase"}'
```

- `-i` muestra los headers.
- `-X POST` selecciona el método de creación.
- `-H` declara que el body contiene JSON.
- `-c cookies.txt` guarda la cookie devuelta por la API.
- `-d` envía el objeto de la nota.

### Comprobar las validaciones

```bash
curl -i -X POST http://localhost:3000/api/v1/notas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"No","contenido":"","categoria":"urgente"}'
```

La respuesta esperada es `400 Bad Request` con los errores encontrados.

### Leer, actualizar y eliminar

```bash
curl -i http://localhost:3000/api/v1/notas

ID="PEGA_AQUI_EL_ID"
curl -i http://localhost:3000/api/v1/notas/$ID

curl -i -X PATCH http://localhost:3000/api/v1/notas/$ID \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Express dominado"}'

curl -i -b cookies.txt http://localhost:3000/api/v1/preferencia

curl -i -X DELETE http://localhost:3000/api/v1/notas/$ID
```

## Pruebas automatizadas

Dentro de `api/` ejecuta:

```bash
npm test
npm run check
```

Las nueve pruebas comprueban la ruta de salud, ambos DTO, las validaciones, los cinco endpoints CRUD, la cookie y la versión. Utilizan un modelo controlado en memoria, por lo que no necesitan una conexión activa a MongoDB.

## Cookies

Al crear una nota, el servidor escribe `ultimaCategoria` con estas propiedades:

- `httpOnly: true`: JavaScript del navegador no puede leerla.
- `sameSite: "lax"`: reduce envíos desde contextos externos.
- `maxAge`: conserva la preferencia durante una hora.

## SemVer

La versión inicial es `1.0.0`:

- **MAJOR:** cambios incompatibles.
- **MINOR:** funcionalidad nueva compatible.
- **PATCH:** correcciones compatibles.

La API comunica su versión mediante el header `X-API-Version` y la ruta `/health`.

## Estrategia de ramas

El historial se construyó por etapas:

- `main`: versión estable y publicada.
- `dev`: integración de todas las funcionalidades.
- `feature/base-express`: servidor y ruta de salud.
- `feature/dtos-validaciones`: DTO y reglas de entrada.
- `feature/mvc-crud-mongodb`: arquitectura MVC, CRUD y persistencia.
- `feature/cookies-semver`: cookies, versión y pruebas.
- `feature/guia-interactiva`: experiencia web educativa.
- `feature/documentacion`: documentación completa.

Cada rama de funcionalidad se integró primero en `dev`. La versión validada de `dev` se sincronizó después con `main`.

## Solución de problemas

- Si la API no inicia, comprueba que MongoDB esté activo y que el puerto `3000` esté libre.
- Si MongoDB rechaza la conexión, verifica `mongodb://127.0.0.1:27017/api_notas_clase` o define `MONGODB_URI`.
- Si recibes `400`, revisa título, contenido y categoría.
- El parámetro `:id` debe ser un ObjectId válido de MongoDB.

## Licencia educativa

Material creado para prácticas académicas de Campuslands. Puede adaptarse y reutilizarse con fines educativos.
