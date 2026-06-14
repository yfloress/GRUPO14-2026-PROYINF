// /index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors({ origin: ["http://localhost:3001", "http://frontend:3000"] }));
app.use(express.json());

//  Detectar si estamos en modo test
const USE_MOCK = process.env.USE_MOCK === "true";

//  Cargar rutas según el modo
const claveUnicaRouter = USE_MOCK
  ? (await import("./apis/mock/claveUnicaMock.js")).default
  : (await import("./routes/claveUnica.js")).default;

const transbankRouter = USE_MOCK
  ? (await import("./apis/mock/transbankMock.js")).default
  : (await import("./routes/transbank.js")).default;

const floidRouter = USE_MOCK
  ? (await import("./apis/mock/floidMock.js")).default
  : (await import("./routes/floid.js")).default;

const faceioRouter = USE_MOCK
  ? (await import("./apis/mock/faceioMock.js")).default
  : (await import("./routes/faceio.js")).default;

console.log({
  claveUnicaRouter,
  transbankRouter,
  floidRouter,
  faceioRouter,
});





// Registrar las rutas
app.use("/api/claveunica", claveUnicaRouter);
app.use("/api/transbank", transbankRouter);
app.use("/api/floid", floidRouter);
app.use("/api/faceio", faceioRouter);

// Ruta base
app.get("/", (req, res) =>
  res.send(
    `Servidor en modo ${USE_MOCK ? " TEST" : " REAL"} funcionando `
  )
);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Backend corriendo en puerto ${PORT} (${USE_MOCK ? "mock" : "real"})`)
);


