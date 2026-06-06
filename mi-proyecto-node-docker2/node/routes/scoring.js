// 📄 node/routes/scoring.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();
router.post("/", async (req, res) => {
  try {
    console.log("🧩 BODY RECIBIDO EN SCORING:", req.body);

    // ✅ Extraemos todos los campos que llegan del frontend
    const {
      rut,
      nombre,
      apellido_paterno,
      apellido_materno,
      edad,
      sistema_salud,
      tipo_vivienda,
      ingreso_mensual,
      deuda_mensual,
      condicion_laboral,
      antiguedad_meses,
      integrantes_hogar,
      nivel_educacional,
      mora_mas_larga_24m,
      pagos_puntuales_12m,
      creditos_cerrados_sin_mora,
      consultas_credito_recientes,
      antiguedad_crediticia_anios,
      uso_tarjeta_pct,
      tipo_pago_tarjeta,
      kyc_verificado,
      debe_pension_alimenticia,
      puntaje,
      nivel,
      motivo,
    } = req.body;

    if (!rut) {
      return res.status(500).json({ 
        ok: false, 
        error: "Error interno: El RUT es un campo obligatorio y no puede ser nulo." 
      });
    }

    // formato con Regex largo 7-8, guion, y dig verif + k
    const rutRegex = /^[0-9]{7,8}-[0-9Kk]$/; 
    
    if (!rutRegex.test(rut)) {
      return res.status(400).json({ 
        ok: false, 
        error: "Estructura de petición incorrecta: El formato del RUT es inválido (ej: 12345678-9)." 
      });
    }


    // ✅ Ejecutar el INSERT con todos los campos
    const result = await pool.query(
      `INSERT INTO scoring_evaluaciones (
        rut, nombre, apellido_paterno, apellido_materno, edad, sistema_salud,
        tipo_vivienda, ingreso_mensual, deuda_mensual, condicion_laboral,
        antiguedad_meses, integrantes_hogar, nivel_educacional,
        mora_mas_larga_24m, pagos_puntuales_12m, creditos_cerrados_sin_mora,
        consultas_credito_recientes, antiguedad_crediticia_anios,
        uso_tarjeta_pct, tipo_pago_tarjeta, kyc_verificado, debe_pension_alimenticia,
        puntaje, nivel, motivo
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
      RETURNING *`,
      [
        rut,
        nombre,
        apellido_paterno,
        apellido_materno,
        edad,
        sistema_salud,
        tipo_vivienda,
        ingreso_mensual,
        deuda_mensual,
        condicion_laboral,
        antiguedad_meses,
        integrantes_hogar,
        nivel_educacional,
        mora_mas_larga_24m,
        pagos_puntuales_12m,
        creditos_cerrados_sin_mora,
        consultas_credito_recientes,
        antiguedad_crediticia_anios,
        uso_tarjeta_pct,
        tipo_pago_tarjeta,
        kyc_verificado,
        debe_pension_alimenticia,
        puntaje,
        nivel,
        motivo,
      ]
    );

    res.status(201).json({ ok: true, data: result.rows[0] });
  } catch (error) {
    console.error("❌ Error al guardar scoring:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM scoring_evaluaciones ORDER BY id DESC"
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error("❌ Error al listar scoring:", err);
    res.status(500).json({ ok: false, error: "Error interno al listar scoring." });
  }
});

export default router;
