import express from "express";
import { notaRouter } from "./routes/nota.routes.js";
import {
  manejarError,
  rutaNoEncontrada,
} from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ estado: "ok" });
});

app.use("/api/v1/notas", notaRouter);

app.use(rutaNoEncontrada);
app.use(manejarError);

export default app;
