import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import app from "../src/app.js";
import { CrearNotaDTO } from "../src/dtos/crear-nota.dto.js";
import { ActualizarNotaDTO } from "../src/dtos/actualizar-nota.dto.js";
import { Nota } from "../src/models/nota.model.js";
import { validarCrearNota } from "../src/validators/nota.validator.js";

async function withServer(application, run) {
  const server = application.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("GET /health responde 200 y muestra la versión", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-api-version"), "1.0.0");
    assert.deepEqual(body, { estado: "ok", version: "1.0.0" });
  });
});

test("CrearNotaDTO limpia espacios e ignora campos extra", () => {
  const dto = new CrearNotaDTO({
    titulo: "  Repasar Express  ",
    contenido: "  Practicar una ruta POST  ",
    categoria: "clase",
    esAdmin: true,
  });

  assert.deepEqual({ ...dto }, {
    titulo: "Repasar Express",
    contenido: "Practicar una ruta POST",
    categoria: "clase",
  });
  assert.equal("esAdmin" in dto, false);
});

test("ActualizarNotaDTO incluye únicamente los campos enviados", () => {
  const dto = new ActualizarNotaDTO({ titulo: "  Título actualizado  " });

  assert.deepEqual({ ...dto }, { titulo: "Título actualizado" });
  assert.equal("contenido" in dto, false);
});

test("validarCrearNota rechaza una nota inválida con estado 400", async () => {
  const validationApp = express();
  validationApp.use(express.json());
  validationApp.post("/notas", validarCrearNota, (req, res) => {
    res.status(201).json({ data: new CrearNotaDTO(req.body) });
  });

  await withServer(validationApp, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/notas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "No", contenido: "", categoria: "urgente" }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.errores.length, 3);
  });
});

test("POST /api/v1/notas crea una nota y escribe la cookie", async (t) => {
  t.mock.method(Nota, "create", async (datos) => ({
    _id: "66d8f21a654321abcdef1234",
    ...datos,
  }));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/notas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Nueva nota",
        contenido: "Contenido de prueba",
        categoria: "clase",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.titulo, "Nueva nota");
    assert.match(response.headers.get("set-cookie"), /ultimaCategoria=clase/);
  });
});

test("GET /api/v1/notas lista todas las notas", async (t) => {
  t.mock.method(Nota, "find", () => ({
    sort: async () => [{ _id: "66d8f21a654321abcdef1234", titulo: "Nota 1" }],
  }));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/notas`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.length, 1);
  });
});

test("GET /api/v1/notas/:id obtiene una nota", async (t) => {
  t.mock.method(Nota, "findById", async () => ({
    _id: "66d8f21a654321abcdef1234",
    titulo: "Nota encontrada",
  }));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/v1/notas/66d8f21a654321abcdef1234`,
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.titulo, "Nota encontrada");
  });
});

test("PATCH /api/v1/notas/:id actualiza una nota", async (t) => {
  t.mock.method(Nota, "findByIdAndUpdate", async (id, datos) => ({
    _id: id,
    titulo: datos.titulo,
    contenido: "Contenido anterior",
    categoria: "clase",
  }));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/v1/notas/66d8f21a654321abcdef1234`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: "Título actualizado" }),
      },
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.titulo, "Título actualizado");
  });
});

test("DELETE /api/v1/notas/:id elimina una nota", async (t) => {
  t.mock.method(Nota, "findByIdAndDelete", async (id) => ({ _id: id }));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/v1/notas/66d8f21a654321abcdef1234`,
      { method: "DELETE" },
    );

    assert.equal(response.status, 204);
    assert.equal(await response.text(), "");
  });
});
