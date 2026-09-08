import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/api_notas_clase";

try {
  await mongoose.connect(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`API lista en http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("No fue posible conectar con MongoDB:", error.message);
  process.exit(1);
}
