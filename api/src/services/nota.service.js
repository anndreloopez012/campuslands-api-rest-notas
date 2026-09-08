import { Nota } from "../models/nota.model.js";

export const notaService = {
  crear(datos) {
    return Nota.create(datos);
  },

  listar() {
    return Nota.find().sort({ createdAt: -1 });
  },

  buscarPorId(id) {
    return Nota.findById(id);
  },

  actualizar(id, datos) {
    return Nota.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    });
  },

  eliminar(id) {
    return Nota.findByIdAndDelete(id);
  },
};
