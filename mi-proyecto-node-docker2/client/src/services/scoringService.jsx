/**
 * Servicio para calcular el scoring y dejar listo el objeto COMPLETO
 * (formulario + resultado) en localStorage: "resultadoScoring".
 * Queda alineado con la tabla "scoring_evaluaciones".
 */

export async function obtenerScoring() {
  try {
    // RUT guardado en el paso de Clave Única (ajusta la key si usas otra)
    const rut = localStorage.getItem("rut") || localStorage.getItem("rutCliente") || "00.000.000-0";
    const datos = JSON.parse(localStorage.getItem("datosEvaluacion"));

    if (!rut || !datos) {
      return { ok: false, mensaje: "Faltan datos para calcular el scoring." };
    }

    // Asegurar tipos numéricos (evita NaN y strings en cálculos)
    const toNum = (v, def = 0) => (v === "" || v === null || v === undefined ? def : Number(v));
    const edad = toNum(datos.edad);
    const ingreso_mensual = toNum(datos.ingreso_mensual);
    const deuda_mensual = toNum(datos.deuda_mensual);
    const antiguedad_meses = toNum(datos.antiguedad_meses);
    const integrantes_hogar = toNum(datos.integrantes_hogar);
    const mora_mas_larga_24m = toNum(datos.mora_mas_larga_24m);
    const pagos_puntuales_12m = toNum(datos.pagos_puntuales_12m);
    const creditos_cerrados_sin_mora = toNum(datos.creditos_cerrados_sin_mora);
    const consultas_credito_recientes = toNum(datos.consultas_credito_recientes);
    const antiguedad_crediticia_anios = toNum(datos.antiguedad_crediticia_anios);
    const uso_tarjeta_pct = Math.min(100, toNum(datos.uso_tarjeta_pct)); // cap 100%

    let score = 0;
    let motivoExtra = "";

    // HARD STOPS
    if (edad < 18)
      return { ok: false, hardStop: true, mensaje: "Menor de edad (hard stop)." };
    if (edad > 75)
      return { ok: false, hardStop: true, mensaje: "Edad sobre el límite permitido (hard stop)." };
    if (datos.debe_pension_alimenticia)
      return { ok: false, hardStop: true, mensaje: "Deuda judicial activa de pensión alimenticia (hard stop)." };
    if (!datos.kyc_verificado)
      return { ok: false, hardStop: true, mensaje: "Identidad no verificada (KYC fallido)." };

    // 1) Edad
    if (edad <= 25) score -= 20;
    else if (edad <= 55) score += 10;
    else if (edad > 65) score -= 10;

    // 2) Sistema de salud
    if (["Fonasa A", "Fonasa B"].includes(datos.sistema_salud)) score -= 10;
    else if (["Fonasa D", "Isapre"].includes(datos.sistema_salud)) score += 5;

    // 3) Tipo de vivienda
    if (datos.tipo_vivienda === "Propia") score += 10;
    else if (datos.tipo_vivienda === "Allegado") score -= 10;

    // 4) Condición laboral (incluye Jubilado)
    if (datos.condicion_laboral === "Indefinido") score += 15;
    else if (datos.condicion_laboral === "Plazo fijo") score += 5;
    else if (datos.condicion_laboral === "Independiente") score -= 10;
    else if (datos.condicion_laboral === "Informal") score -= 25;
    else if (datos.condicion_laboral === "Jubilado") score += 0; // neutro

    // 5) Ingreso relativo
    const IMM = 500000;
    const ingresoRel = ingreso_mensual / IMM;
    if (ingresoRel < 1.0) score -= 40;
    else if (ingresoRel < 1.5) score -= 20;
    else if (ingresoRel < 2.5) score += 0;
    else if (ingresoRel < 4.0) score += 10;
    else score += 20;

    // 6) DTI
    const dti = ingreso_mensual > 0 ? deuda_mensual / ingreso_mensual : 1;
    if (dti < 0.2) score += 20;
    else if (dti < 0.35) score += 10;
    else if (dti < 0.45) score += 0;
    else if (dti < 0.55) score -= 20;
    else score -= 40;

    if (edad >= 65 && dti > 0.25) {
      score -= 30;
      motivoExtra += "PTI sobre 25% para adulto mayor. ";
    }

    // 7) Antigüedad laboral
    if (antiguedad_meses < 6) score -= 30;
    else if (antiguedad_meses < 12) score -= 10;
    else if (antiguedad_meses >= 36) score += 10;

    // 8) Integrantes del hogar
    if (integrantes_hogar <= 2) score += 5;
    else if (integrantes_hogar <= 4) score += 0;
    else score -= 10;

    // 9) Nivel educacional
    if (datos.nivel_educacional === "Básico") score -= 5;
    else if (datos.nivel_educacional === "Medio") score += 0;
    else if (["Técnico", "Superior"].includes(datos.nivel_educacional)) score += 5;

    // 11) Mora más larga (24m)
    if (mora_mas_larga_24m >= 60) score -= 60;
    else if (mora_mas_larga_24m >= 30) score -= 30;
    else if (mora_mas_larga_24m >= 1) score -= 10;
    else score += 15;

    // 12) Puntualidad últimos 12m
    if (pagos_puntuales_12m >= 11) score += 15;
    else if (pagos_puntuales_12m >= 9) score += 5;
    else if (pagos_puntuales_12m >= 6) score -= 10;
    else score -= 30;

    // 13) Créditos cerrados sin mora
    if (creditos_cerrados_sin_mora >= 1) score += 10;

    // 14) Consultas recientes
    if (consultas_credito_recientes <= 1) score += 0;
    else if (consultas_credito_recientes <= 3) score -= 5;
    else score -= 10;

    // 15) Antigüedad crediticia (años)
    if (antiguedad_crediticia_anios < 1) score -= 10;
    else if (antiguedad_crediticia_anios <= 3) score += 0;
    else score += 10;

    // 16) Uso tarjeta (%)
    if (uso_tarjeta_pct < 30) score += 10;
    else if (uso_tarjeta_pct <= 79) score += 0;
    else if (uso_tarjeta_pct <= 100) score -= 15;
    else score -= 40;

    // 17) Tipo de pago
    const tipoPago = (datos.tipo_pago_tarjeta || "").toLowerCase();
    if (tipoPago.includes("total")) score += 10;
    else if (tipoPago.includes("mínimo") || tipoPago.includes("minimo")) score -= 10;

    // Normalización y nivel
    const S_min = -350;
    const S_max = 200;
    const puntaje = 300 + ((score - S_min) / (S_max - S_min)) * 600;

    let nivel;
    if (puntaje >= 800) nivel = "Aprobado preferente";
    else if (puntaje >= 720) nivel = "Aprobado estándar";
    else if (puntaje >= 660) nivel = "Aprobado condicional";
    else if (puntaje >= 600) nivel = "Revisión manual";
    else nivel = "Rechazado";

    const motivo =
      nivel === "Rechazado"
        ? "Riesgo alto por historial crediticio o nivel de deuda elevado."
        : nivel === "Aprobado condicional"
        ? "Perfil aceptable con algunos factores de riesgo (revisión manual)."
        : "Buen comportamiento financiero, sin morosidad ni sobreendeudamiento.";

    // ⚠️ AQUÍ EL CAMBIO CLAVE:
    // Guardamos TODO: formulario + cálculo + rut (alineado con la tabla)
    const resultado = {
      // Identificación
      rut,
      nombre: datos.nombre || "",
      apellido_paterno: datos.apellido_paterno || "",
      apellido_materno: datos.apellido_materno || "",

      // Sociodemográfico
      edad,
      sistema_salud: datos.sistema_salud || "",
      tipo_vivienda: datos.tipo_vivienda || "",
      integrantes_hogar,

      // Laboral / financiera
      condicion_laboral: datos.condicion_laboral || "",
      antiguedad_meses,
      nivel_educacional: datos.nivel_educacional || "",
      ingreso_mensual,
      deuda_mensual,
      uso_tarjeta_pct,
      tipo_pago_tarjeta: datos.tipo_pago_tarjeta || "",

      // Historial
      mora_mas_larga_24m,
      pagos_puntuales_12m,
      creditos_cerrados_sin_mora,
      consultas_credito_recientes,
      antiguedad_crediticia_anios,

      // Flags
      kyc_verificado: !!datos.kyc_verificado,
      debe_pension_alimenticia: !!datos.debe_pension_alimenticia,

      // Resultado
      puntaje: Math.round(puntaje),
      nivel,
      motivo: (motivoExtra || "") + motivo,
      detalle: `Puntaje base: ${score}`,
      fecha: new Date().toISOString(), // ISO para DB
    };

    localStorage.setItem("resultadoScoring", JSON.stringify(resultado));
    return { ok: true, resultado };
  } catch (error) {
    console.error("Error al calcular scoring:", error);
    return { ok: false, mensaje: "Error al calcular el scoring." };
  }
}
