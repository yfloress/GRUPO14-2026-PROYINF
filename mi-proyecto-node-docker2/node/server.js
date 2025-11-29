import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import scoringRouter from "./routes/scoring.js";
import scoringTypesRouter from "./routes/scoringTypes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/scoring", scoringRouter);
app.use("/api/scoring-types", scoringTypesRouter);

// ---------------------------
// 🔹 RUTAS API
// ---------------------------

// Ruta base para probar el servidor
app.get("/", (req, res) => {
  res.send("✅ Servidor backend funcionando correctamente.");
});

// ----------------------------------------------------
// 🔹 Ruta para insertar una solicitud de préstamo + cuotas
// ----------------------------------------------------
app.post("/api/prestamos", async (req, res) => {
  const client = await pool.connect(); // para usar transacción
  try {
    const { rut_cliente, monto, cuotas, interesTotal, cuotaMensual } = req.body;

    if (!rut_cliente || !monto || !cuotas || cuotas <= 0) {
      return res
        .status(400)
        .json({ error: "Faltan datos obligatorios o cuotas inválidas." });
    }

    // 1️⃣ Insertar el préstamo con fecha_inicio = hoy
    const resultPrestamo = await client.query(
      `
      INSERT INTO prestamos 
        (rut_cliente, monto, cuotas, interes_total, cuota_mensual, fecha_inicio)
      VALUES 
        ($1, $2, $3, $4, $5, CURRENT_DATE)
      RETURNING *;
      `,
      [rut_cliente, monto, cuotas, interesTotal, cuotaMensual]
    );

    const prestamo = resultPrestamo.rows[0];
    const idPrestamo = prestamo.id;

    // 2️⃣ Calcular cuotas (fechas y montos)
    const cuotasArray = [];
    const montoCuota = cuotaMensual || monto / cuotas;

    for (let i = 1; i <= cuotas; i++) {
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

      cuotasArray.push({
        id_prestamo: idPrestamo,
        numero_cuota: i,
        monto_cuota: montoCuota,
        fecha_vencimiento: fechaVencimiento.toISOString().split("T")[0],
        pagada: false,
      });
    }

    // 3️⃣ Insertar cuotas en la base de datos
    for (const c of cuotasArray) {
      await client.query(
        `
        INSERT INTO cuotas 
          (id_prestamo, numero_cuota, monto_cuota, fecha_vencimiento, pagada) 
        VALUES ($1, $2, $3, $4, $5)
        `,
        [c.id_prestamo, c.numero_cuota, c.monto_cuota, c.fecha_vencimiento, c.pagada]
      );
    }

    // Confirmar transacción
    await client.query("COMMIT");

    res.status(201).json({
      ok: true,
      message: "✅ Préstamo y cuotas generados correctamente.",
      data: { prestamo, cuotas: cuotasArray },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error al guardar préstamo/cuotas:", error);
    res
      .status(500)
      .json({ ok: false, error: "Error al registrar préstamo y cuotas." });
  } finally {
    client.release();
  }
});

// ----------------------------------------------------
// 🔹 OBTENER PRÉSTAMOS POR RUT + ESTADO
// ----------------------------------------------------
app.get("/api/prestamos", async (req, res) => {
  try {
    const { rut } = req.query;

    if (!rut) {
      return res
        .status(400)
        .json({ ok: false, error: "Falta el RUT del cliente en la consulta." });
    }

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.rut_cliente,
        p.monto,
        p.cuotas,
        p.interes_total,
        p.cuota_mensual,
        p.fecha_inicio,

        COALESCE(COUNT(c.*), 0) AS cuotas_totales,
        COALESCE(SUM(CASE WHEN c.pagada THEN 1 ELSE 0 END), 0) AS cuotas_pagadas,

        CASE 
          WHEN COALESCE(COUNT(c.*), 0) = 0 THEN 'Pendiente'
          WHEN COALESCE(SUM(CASE WHEN c.pagada THEN 1 ELSE 0 END), 0) = COUNT(c.*)
            THEN 'Finalizado'
          ELSE 'Pendiente'
        END AS estado_prestamo

      FROM prestamos p
      LEFT JOIN cuotas c ON c.id_prestamo = p.id
      WHERE p.rut_cliente = $1
      GROUP BY 
        p.id, p.rut_cliente, p.monto, p.cuotas, 
        p.interes_total, p.cuota_mensual, p.fecha_inicio
      ORDER BY p.id DESC
      `,
      [rut]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener préstamos:", error);
    res
      .status(500)
      .json({ ok: false, error: "Error interno del servidor" });
  }
});

// ---------------------------
// 🔹 Login y Registro
// ---------------------------
app.post("/api/usuarios/registro", async (req, res) => {
  try {
    const { rut, clave } = req.body;

    if (!rut || !clave) {
      return res
        .status(400)
        .json({ ok: false, error: "Faltan campos obligatorios." });
    }

    const existe = await pool.query("SELECT * FROM usuarios WHERE rut = $1", [
      rut,
    ]);
    if (existe.rows.length > 0) {
      return res
        .status(409)
        .json({ ok: false, error: "El usuario ya existe." });
    }

    const result = await pool.query(
      "INSERT INTO usuarios (rut, clave) VALUES ($1, $2) RETURNING *",
      [rut, clave]
    );

    res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    res
      .status(500)
      .json({ ok: false, error: "Error interno al registrar usuario." });
  }
});

app.post("/api/usuarios/login", async (req, res) => {
  try {
    const { rut, clave } = req.body;

    if (!rut || !clave) {
      return res
        .status(400)
        .json({ ok: false, error: "Faltan credenciales." });
    }

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE rut = $1 AND clave = $2",
      [rut, clave]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ ok: false, error: "RUT o clave incorrectos." });
    }

    res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res
      .status(500)
      .json({ ok: false, error: "Error interno al iniciar sesión." });
  }
});

// ----------------------------------------------------
// 🔹 Obtener lista de deudas pendientes POR RUT
// ----------------------------------------------------
app.get("/api/pagos/deudas", async (req, res) => {
  try {
    const { rut } = req.query; // viene desde el frontend: ?rut=12345678-9

    if (!rut) {
      return res
        .status(400)
        .json({ error: "Falta el RUT del cliente en la consulta." });
    }

    const result = await pool.query(
      `
      SELECT 
        c.id AS id_cuota,
        p.id AS id_prestamo,
        c.numero_cuota,
        c.monto_cuota,
        c.fecha_vencimiento,
        c.pagada
      FROM cuotas c
      INNER JOIN prestamos p ON c.id_prestamo = p.id
      WHERE c.pagada = FALSE
        AND p.rut_cliente = $1
      ORDER BY c.fecha_vencimiento ASC
      `,
      [rut]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener deudas:", error);
    res
      .status(500)
      .json({ error: "Error al obtener las deudas pendientes" });
  }
});

// ----------------------------------------------------
// 🔹 Simula inicio de pago
// ----------------------------------------------------
app.post("/api/pagos/iniciar", (req, res) => {
  const { metodo_pago } = req.body;

  if (metodo_pago === "transbank") {
    // Aquí irá la integración real con la API de Transbank
    return res.json({
      url_transbank:
        "https://webpay3gint.transbank.cl/webpayserver/initTransaction",
    });
  }

  // Modo local: simula pago exitoso
  res.json({ message: "Pago registrado localmente" });
});

// ----------------------------------------------------
// 🔹 Marcar una cuota como pagada (modo transferencia bancaria)
// ----------------------------------------------------
app.post("/api/pagos/cuota/:id/pagar", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE cuotas SET pagada = TRUE WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Cuota no encontrada" });
    }

    res.json({
      ok: true,
      message: "✅ Cuota marcada como pagada.",
      cuota: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al marcar cuota como pagada:", error);
    res.status(500).json({
      ok: false,
      error: "Error interno al registrar el pago de la cuota.",
    });
  }
});

// ======================================================
// 🧮 RUTA: Guardar evaluación de riesgo (Scoring)
// ======================================================
app.post("/api/scoring", async (req, res) => {
  try {
    const data = req.body;

    const campos = [
      "rut",
      "nombre",
      "apellido_paterno",
      "apellido_materno",
      "edad",
      "sistema_salud",
      "tipo_vivienda",
      "ingreso_mensual",
      "deuda_mensual",
      "condicion_laboral",
      "antiguedad_meses",
      "integrantes_hogar",
      "nivel_educacional",
      "mora_mas_larga_24m",
      "pagos_puntuales_12m",
      "creditos_cerrados_sin_mora",
      "consultas_credito_recientes",
      "antiguedad_crediticia_anios",
      "uso_tarjeta_pct",
      "tipo_pago_tarjeta",
      "kyc_verificado",
      "debe_pension_alimenticia",
      "puntaje",
      "nivel",
      "motivo",
      "fecha",
    ];

    const valores = campos.map((c) => data[c] ?? null);

    const result = await pool.query(
      `
      INSERT INTO scoring_evaluaciones (
        rut, nombre, apellido_paterno, apellido_materno,
        edad, sistema_salud, tipo_vivienda,
        ingreso_mensual, deuda_mensual, condicion_laboral,
        antiguedad_meses, integrantes_hogar, nivel_educacional,
        mora_mas_larga_24m, pagos_puntuales_12m, creditos_cerrados_sin_mora,
        consultas_credito_recientes, antiguedad_crediticia_anios,
        uso_tarjeta_pct, tipo_pago_tarjeta,
        kyc_verificado, debe_pension_alimenticia,
        puntaje, nivel, motivo, fecha
      )
      VALUES (${campos.map((_, i) => `$${i + 1}`).join(", ")})
      RETURNING *;
      `,
      valores
    );

    res.status(201).json({
      ok: true,
      message: "✅ Evaluación de riesgo registrada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al guardar la evaluación:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno al guardar la evaluación.",
      error: error.message,
    });
  }
});

// ======================================================
// 📊 RUTA: Listar todas las evaluaciones guardadas
// ======================================================
app.get("/api/scoring", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM scoring_evaluaciones ORDER BY id DESC"
    );
    res.json({ ok: true, data: result.rows });
  } catch (error) {
    console.error("❌ Error al obtener evaluaciones:", error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener las evaluaciones.",
      error: error.message,
    });
  }
});

// Crear usuario placeholder si no existe
(async () => {
  try {
    const res = await pool.query(
      "SELECT * FROM usuarios WHERE rut = '12345678-9'"
    );
    if (res.rows.length === 0) {
      await pool.query(
        "INSERT INTO usuarios (rut, clave) VALUES ('12345678-9', '1234')"
      );
      console.log(
        "👤 Usuario de prueba creado: RUT 12345678-9 / CLAVE 1234"
      );
    }
  } catch (err) {
    console.error("Error al crear usuario de prueba:", err);
  }
})();

// Login admin
app.post("/api/admin/login", async (req, res) => {
  const { rut, clave } = req.body;

  try {
    const query =
      "SELECT * FROM administradores WHERE rut = $1 AND clave = $2";
    const result = await pool.query(query, [rut, clave]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const admin = result.rows[0];

    res.json({
      user: {
        rut: admin.rut,
        nombre: admin.nombre,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("Error en login admin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// ----------------------------------------------------
// 🔹 Listar ofertas de préstamos pre-aprobados por RUT
// ----------------------------------------------------
app.get("/api/preaprobados", async (req, res) => {
  try {
    const { rut } = req.query;

    if (!rut) {
      return res
        .status(400)
        .json({ ok: false, error: "Falta el RUT del cliente en la consulta." });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        nombre_oferta,
        monto_maximo,
        min_cuotas,
        max_cuotas,
        tasa_mensual,
        estado,
        fecha_inicio,
        fecha_fin
      FROM ofertas_preaprobadas
      WHERE rut_cliente = $1
        AND estado IN ('activa', 'vencida')   -- puedes ajustar según necesidad
      ORDER BY id DESC
      `,
      [rut]
    );

    res.json({ ok: true, data: result.rows });
  } catch (error) {
    console.error("❌ Error al obtener ofertas pre-aprobadas:", error);
    res.status(500).json({
      ok: false,
      error: "Error interno al obtener las ofertas pre-aprobadas.",
    });
  }
});


// ----------------------------------------------------
// 🔹 Aceptar oferta pre-aprobada (sin Clave Única todavía)
// ----------------------------------------------------
app.post("/api/preaprobados/:id/aceptar", async (req, res) => {
  try {
    const { id } = req.params; // id de la oferta
    const { rut, montoSolicitado, cuotas } = req.body;

    if (!rut || !montoSolicitado || !cuotas) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos: rut, montoSolicitado o cuotas.",
      });
    }

    // 1) Buscar oferta y validar que siga activa
    const ofertaRes = await pool.query(
      `
      SELECT *
      FROM ofertas_preaprobadas
      WHERE id = $1
        AND rut_cliente = $2
      `,
      [id, rut]
    );

    if (ofertaRes.rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Oferta no encontrada para este cliente." });
    }

    const oferta = ofertaRes.rows[0];

    // Validar estado campaña (criterio de aceptación 1)
    const hoy = new Date();
    const fechaFinValida =
      !oferta.fecha_fin || new Date(oferta.fecha_fin) >= hoy;

    if (oferta.estado !== "activa" || !fechaFinValida) {
      return res.status(400).json({
        ok: false,
        error:
          "La campaña ya no se encuentra activa. No es posible aceptar esta oferta.",
      });
    }

    // 2) Validar monto y cuotas dentro de rango
    if (
      Number(montoSolicitado) <= 0 ||
      Number(montoSolicitado) > Number(oferta.monto_maximo)
    ) {
      return res.status(400).json({
        ok: false,
        error: `El monto debe ser mayor a 0 y no exceder $${Number(
          oferta.monto_maximo
        ).toLocaleString("es-CL")}.`,
      });
    }

    if (
      Number(cuotas) < oferta.min_cuotas ||
      Number(cuotas) > oferta.max_cuotas
    ) {
      return res.status(400).json({
        ok: false,
        error: `El número de cuotas debe estar entre ${oferta.min_cuotas} y ${oferta.max_cuotas}.`,
      });
    }

    // 3) Registrar solicitud preaprobada pendiente de Clave Única
    const solRes = await pool.query(
      `
      INSERT INTO preaprobados_solicitudes
        (id_oferta, rut_cliente, monto_solicitado, cuotas, estado)
      VALUES
        ($1, $2, $3, $4, 'pendiente_clave')
      RETURNING *;
      `,
      [id, rut, montoSolicitado, cuotas]
    );

    const solicitud = solRes.rows[0];

    return res.json({
      ok: true,
      message:
        "Oferta aceptada. Pendiente confirmación mediante Clave Única.",
      solicitud,
      oferta,
    });
  } catch (error) {
    console.error("❌ Error al aceptar oferta pre-aprobada:", error);
    res.status(500).json({
      ok: false,
      error: "Error interno al aceptar la oferta pre-aprobada.",
    });
  }
});

// ----------------------------------------------------
// 🔹 Confirmar solicitud pre-aprobada con Clave Única
//     -> crea el préstamo real + cuotas
// ----------------------------------------------------
app.post("/api/preaprobados/solicitudes/:id/confirmar-clave", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // id de preaprobados_solicitudes
    const { rut, claveUnica } = req.body;

    if (!rut || !claveUnica) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos: rut o claveUnica.",
      });
    }

    // Validación mínima (demo) de Clave Única
    if (claveUnica.trim().length < 4) {
      return res.status(400).json({
        ok: false,
        error:
          "Clave Única inválida (en este demo debe tener al menos 4 caracteres).",
      });
    }

    await client.query("BEGIN");

    // 1) Obtener solicitud pendiente + oferta asociada
    const solRes = await client.query(
      `
      SELECT s.*, o.tasa_mensual
      FROM preaprobados_solicitudes s
      INNER JOIN ofertas_preaprobadas o ON s.id_oferta = o.id
      WHERE s.id = $1
        AND s.rut_cliente = $2
        AND s.estado = 'pendiente_clave'
      `,
      [id, rut]
    );

    if (solRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        ok: false,
        error:
          "Solicitud no encontrada o ya confirmada/rechazada para este cliente.",
      });
    }

    const solicitud = solRes.rows[0];

    const monto = Number(solicitud.monto_solicitado);
    const cuotas = Number(solicitud.cuotas);
    const tasaMensual = Number(solicitud.tasa_mensual); // %

    // 2) Calcular interés total y cuota mensual (modelo simple)
    const totalPagar = monto * (1 + (tasaMensual / 100) * cuotas);
    const interesTotal = totalPagar - monto;
    const cuotaMensual = totalPagar / cuotas;

    // 3) Crear préstamo real (misma lógica base que tu POST /api/prestamos)
    const resultPrestamo = await client.query(
      `
      INSERT INTO prestamos 
        (rut_cliente, monto, cuotas, interes_total, cuota_mensual, fecha_inicio)
      VALUES 
        ($1, $2, $3, $4, $5, CURRENT_DATE)
      RETURNING *;
      `,
      [rut, monto, cuotas, interesTotal, cuotaMensual]
    );

    const prestamo = resultPrestamo.rows[0];
    const idPrestamo = prestamo.id;

    // 4) Generar cuotas asociadas
    const cuotasArray = [];
    for (let i = 1; i <= cuotas; i++) {
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

      cuotasArray.push({
        id_prestamo: idPrestamo,
        numero_cuota: i,
        monto_cuota: cuotaMensual,
        fecha_vencimiento: fechaVencimiento.toISOString().split("T")[0],
        pagada: false,
      });
    }

    for (const c of cuotasArray) {
      await client.query(
        `
        INSERT INTO cuotas 
          (id_prestamo, numero_cuota, monto_cuota, fecha_vencimiento, pagada)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [c.id_prestamo, c.numero_cuota, c.monto_cuota, c.fecha_vencimiento, c.pagada]
      );
    }

    // 5) Marcar solicitud como confirmada y oferta como usada (opcional)
    await client.query(
      "UPDATE preaprobados_solicitudes SET estado = 'confirmado' WHERE id = $1",
      [id]
    );

    await client.query(
      "UPDATE ofertas_preaprobadas SET estado = 'usada' WHERE id = $1",
      [solicitud.id_oferta]
    );

    await client.query("COMMIT");

    return res.json({
      ok: true,
      message: "Préstamo creado correctamente a partir de la oferta pre-aprobada.",
      prestamo,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error al confirmar solicitud pre-aprobada:", error);
    res.status(500).json({
      ok: false,
      error: "Error interno al confirmar la solicitud pre-aprobada.",
    });
  } finally {
    client.release();
  }
});


// 🔹 Obtener perfil de un usuario por RUT (usando tus nombres de columnas)
app.get("/api/usuarios/perfil", async (req, res) => {
  try {
    const { rut } = req.query;

    if (!rut) {
      return res
        .status(400)
        .json({ ok: false, error: "Falta el RUT en la consulta." });
    }

    const result = await pool.query(
      `
      SELECT 
        id,
        rut,
        correo_seguridad,
        verificacion_estado,
        foto_carnet_frontal,
        foto_carnet_posterior
      FROM usuarios
      WHERE rut = $1
      `,
      [rut]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado." });
    }

    res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error);
    res
      .status(500)
      .json({ ok: false, error: "Error interno al obtener perfil." });
  }
});


// 🔹 Actualizar correo de seguridad
app.put("/api/usuarios/seguridad", async (req, res) => {
  try {
    const { rut, correo_seguridad } = req.body;

    if (!rut || !correo_seguridad) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos: rut y correo_seguridad son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      UPDATE usuarios
      SET correo_seguridad = $1
      WHERE rut = $2
      RETURNING id, rut, correo_seguridad, verificacion_estado
      `,
      [correo_seguridad, rut]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado." });
    }

    res.json({
      ok: true,
      message: "✅ Correo de seguridad actualizado correctamente.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al actualizar correo de seguridad:", error);
    res.status(500).json({
      ok: false,
      error: "Error interno al actualizar correo de seguridad.",
    });
  }
});


// 🔹 Actualizar estado de foto de carnet (frontal o posterior)
app.put("/api/usuarios/carnet-foto", async (req, res) => {
  try {
    const { rut, lado, valor } = req.body;
    // lado: "frente" o "reverso"

    if (!rut || !lado) {
      return res.status(400).json({
        ok: false,
        error:
          "Faltan datos: rut y lado ('frente' o 'reverso') son obligatorios.",
      });
    }

    let campo;
    if (lado === "frente") campo = "foto_carnet_frontal";
    else if (lado === "reverso") campo = "foto_carnet_posterior";
    else {
      return res
        .status(400)
        .json({ ok: false, error: "Valor de 'lado' inválido." });
    }

    // Como son TEXT, guardamos por ejemplo 'subido'
    const valorAGuardar = valor ?? "subido";

    const result = await pool.query(
      `
      UPDATE usuarios
      SET ${campo} = $1
      WHERE rut = $2
      RETURNING id, rut, correo_seguridad,
                verificacion_estado, foto_carnet_frontal, foto_carnet_posterior
      `,
      [valorAGuardar, rut]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado." });
    }

    res.json({
      ok: true,
      message: "✅ Estado de foto de carnet actualizado.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al actualizar foto de carnet:", error);
    res.status(500).json({
      ok: false,
      error: "Error interno al actualizar foto de carnet.",
    });
  }
});

app.get("/api/usuarios/:rut", async (req, res) => {
  try {
    const { rut } = req.params;

    const query = `
      SELECT id, rut, correo_seguridad, foto_carnet_frontal, foto_carnet_posterior
      FROM usuarios
      WHERE rut = $1
    `;
    
    const result = await pool.query(query, [rut]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Error obteniendo usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// ---------------------------
// 🔹 INICIAR SERVIDOR
// ---------------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});
