// apis/floid.js
//Documentación: https://docs.floid.app/ 

import express from "express";
import { crearSesionFloid, obtenerDatosFinancieros } from "../apis/reales/floid.js";

const router = express.Router();

/**
 * 1️ Crear sesión para conexión bancaria
 */
router.post("/iniciar", async (req, res) => {
  try {
    const { rut, email } = req.body;
    const sesion = await crearSesionFloid(rut, email);
    res.json(sesion);
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión en Floid" });
  }
});

/**
 * 2️ Callback o consulta de cuentas
 */
router.get("/callback", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id || typeof session_id !== "string" || session_id.trim().length === 0) {
      return res.status(400).json({ error: "Parámetro session_id inválido o faltante" });
    }

    const cuentas = await obtenerDatosFinancieros(session_id);
    res.json(cuentas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener datos financieros" });
  }
});

export default router;
