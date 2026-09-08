import mongoose from "mongoose";

const notaSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    contenido: { type: String, required: true },
    categoria: {
      type: String,
      enum: ["clase", "tarea", "idea"],
      required: true,
    },
  },
  { timestamps: true },
);

export const Nota = mongoose.model("Nota", notaSchema);
