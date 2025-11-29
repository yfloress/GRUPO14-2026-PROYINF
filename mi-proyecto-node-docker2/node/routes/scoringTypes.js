// 📄 node/routes/scoringTypes.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /api/scoring-types
 * De momento usamos el PRIMER registro como configuración activa.
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM scoring_types ORDER BY id ASC"
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error("❌ Error al listar scoring_types:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error interno al listar scoring_types." });
  }
});

/**
 * POST /api/scoring-types
 * Crea un nuevo tipo de scoring.
 * Espera: { nombre, descripcion, base_score, config, activo }
 */
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion, base_score = 600, config, activo = true } =
      req.body;

    const result = await pool.query(
      `
      INSERT INTO scoring_types (
        nombre, descripcion, base_score, config, activo
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *;
      `,
      [nombre, descripcion, base_score, config, activo]
    );

    res.status(201).json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ Error al crear scoring_type:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error interno al crear scoring_type." });
  }
});

/**
 * PUT /api/scoring-types/:id
 * Actualiza un tipo de scoring existente.
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, base_score, config, activo } = req.body;

    const result = await pool.query(
      `
      UPDATE scoring_types
      SET
        nombre = $1,
        descripcion = $2,
        base_score = $3,
        config = $4,
        activo = $5
      WHERE id = $6
      RETURNING *;
      `,
      [nombre, descripcion, base_score, config, activo, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "scoring_type no encontrado." });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ Error al actualizar scoring_type:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error interno al actualizar scoring_type." });
  }
});

export default router;
