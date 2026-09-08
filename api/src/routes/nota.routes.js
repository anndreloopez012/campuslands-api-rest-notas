import { Router } from "express";
import {
  actualizarNota,
  crearNota,
  eliminarNota,
  listarNotas,
  obtenerNota,
} from "../controllers/nota.controller.js";
import {
  validarActualizarNota,
  validarCrearNota,
  validarNotaId,
} from "../validators/nota.validator.js";

export const notaRouter = Router();

notaRouter.post("/", validarCrearNota, crearNota);
notaRouter.get("/", listarNotas);
notaRouter.get("/:id", validarNotaId, obtenerNota);
notaRouter.patch("/:id", validarNotaId, validarActualizarNota, actualizarNota);
notaRouter.delete("/:id", validarNotaId, eliminarNota);
