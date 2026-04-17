// src/pages/AdminScoringModular.js
import React, { useState } from "react";

// ---------------------------
// Definición de factores
// (TODOS los que importan, sin KYC ni pensión)
// ---------------------------
const FACTORES = [
  {
    key: "edad",
    label: "Edad (años)",
    ayuda: "Ejemplo: 25. Puedes definir que 18–30 sea rango positivo y 60–76 negativo.",
    tipo: "numero",
  },
  {
    key: "integrantes_hogar",
    label: "Integrantes del hogar",
    ayuda: "Número de personas que viven con el cliente. Puedes penalizar hogares muy grandes si quieres.",
    tipo: "numero",
  },
  {
    key: "sistema_salud",
    label: "Sistema de salud (código 1–5)",
    ayuda: "Usa códigos: 1=Fonasa A, 2=Fonasa B, 3=Fonasa C, 4=Fonasa D, 5=Isapre.",
    tipo: "categorico",
    placeholder: "Ej: 3 (Fonasa C)",
  },
  {
    key: "tipo_vivienda",
    label: "Tipo de vivienda (código 1–3)",
    ayuda: "Usa códigos: 1=Propia, 2=Arrendada, 3=Allegado.",
    tipo: "categorico",
    placeholder: "Ej: 1 (Propia)",
  },
  {
    key: "nivel_educacional",
    label: "Nivel educacional (código 1–4)",
    ayuda: "Usa códigos: 1=Básico, 2=Medio, 3=Técnico, 4=Superior.",
    tipo: "categorico",
    placeholder: "Ej: 4 (Superior)",
  },
  {
    key: "condicion_laboral",
    label: "Condición laboral (código 1–5)",
    ayuda: "Usa códigos: 1=Indefinido, 2=Plazo fijo, 3=Independiente, 4=Informal, 5=Jubilado.",
    tipo: "categorico",
    placeholder: "Ej: 1 (Indefinido)",
  },
  {
    key: "antiguedad_meses",
    label: "Antigüedad laboral (meses)",
    ayuda: "Meses en el empleo actual. Puedes dar bonus positivo a antigüedades altas.",
    tipo: "numero",
  },
  {
    key: "ingreso_mensual",
    label: "Ingreso mensual (CLP)",
    ayuda: "Monto de ingreso mensual. Usualmente ingresos altos favorecen.",
    tipo: "numero",
  },
  {
    key: "deuda_mensual",
    label: "Deuda mensual (CLP)",
    ayuda: "Monto de deuda mensual. Puedes usar rango negativo para deudas muy altas.",
    tipo: "numero",
  },
  {
    key: "uso_tarjeta_pct",
    label: "Uso tarjeta crédito (%)",
    ayuda: "Porcentaje de utilización. Ej: 0–50% positivo, 80–100% negativo.",
    tipo: "numero",
  },
  {
    key: "mora_mas_larga_24m",
    label: "Mora más larga (días en 24 meses)",
    ayuda: "Mayor cantidad de días de mora es más riesgoso (normalmente rango negativo).",
    tipo: "numero",
  },
  {
    key: "pagos_puntuales_12m",
    label: "Pagos puntuales (últimos 12 meses)",
    ayuda: "De 0 a 12. Más pagos puntuales suele ser positivo.",
    tipo: "numero",
  },
  {
    key: "creditos_cerrados_sin_mora",
    label: "Créditos cerrados sin mora",
    ayuda: "Cantidad de créditos que el cliente cerró sin atrasos.",
    tipo: "numero",
  },
  {
    key: "consultas_credito_recientes",
    label: "Consultas recientes de crédito",
    ayuda: "Muchas consultas en poco tiempo suele ser negativo.",
    tipo: "numero",
  },
  {
    key: "antiguedad_crediticia_anios",
    label: "Antigüedad crediticia (años)",
    ayuda: "Años desde el primer crédito. Más años puede ser positivo.",
    tipo: "numero",
  },
  {
    key: "tipo_pago_tarjeta",
    label: "Tipo de pago de tarjeta (código 1–2)",
    ayuda: "Usa códigos: 1=Pago total, 2=Pago mínimo.",
    tipo: "categorico",
    placeholder: "Ej: 1 (Pago total)",
  },
];

// ---------------------------
// Helpers de cálculo
// ---------------------------
function calcularAporteFactor(cfg) {
  if (!cfg.enabled) return 0;

  const v = Number(cfg.testValue);
  if (Number.isNaN(v)) return 0;

  let aporte = 0;

  // Rango positivo
  if (
    cfg.minPos !== "" &&
    cfg.maxPos !== "" &&
    v >= Number(cfg.minPos) &&
    v <= Number(cfg.maxPos)
  ) {
    aporte += Number(cfg.bonusPos || 0);
  }

  // Rango negativo
  if (
    cfg.minNeg !== "" &&
    cfg.maxNeg !== "" &&
    v >= Number(cfg.minNeg) &&
    v <= Number(cfg.maxNeg)
  ) {
    aporte -= Number(cfg.bonusNeg || 0);
  }

  return aporte;
}

// ---------------------------
// Componente principal
// ---------------------------
export default function AdminScoringModular() {
  const [nombreSistema, setNombreSistema] = useState("Sistema de scoring 1");
  const [puntajeBase, setPuntajeBase] = useState(600);

  // Estado inicial por factor
  const [configFactores, setConfigFactores] = useState(() => {
    const base = {};
    FACTORES.forEach((f) => {
      base[f.key] = {
        enabled: true,
        testValue: "",
        minPos: "",
        maxPos: "",
        bonusPos: 0,
        minNeg: "",
        maxNeg: "",
        bonusNeg: 0,
      };

      // Ejemplos de defaults para salud y educación (opcional)
      if (f.key === "sistema_salud") {
        base[f.key].minPos = 4; // Fonasa D
        base[f.key].maxPos = 5; // Isapre
        base[f.key].bonusPos = 20;
        base[f.key].minNeg = 1; // Fonasa A
        base[f.key].maxNeg = 2; // Fonasa B
        base[f.key].bonusNeg = 15;
      }
      if (f.key === "nivel_educacional") {
        base[f.key].minPos = 3; // Técnico
        base[f.key].maxPos = 4; // Superior
        base[f.key].bonusPos = 25;
        base[f.key].minNeg = 1; // Básico
        base[f.key].maxNeg = 1;
        base[f.key].bonusNeg = 10;
      }
    });
    return base;
  });

  const actualizarFactor = (key, cambios) => {
    setConfigFactores((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...cambios },
    }));
  };

  // Cálculo de aportes totales
  const { sumaPositiva, sumaNegativa } = FACTORES.reduce(
    (acc, f) => {
      const cfg = configFactores[f.key];
      const aporte = calcularAporteFactor(cfg);
      if (aporte > 0) acc.sumaPositiva += aporte;
      if (aporte < 0) acc.sumaNegativa += aporte;
      return acc;
    },
    { sumaPositiva: 0, sumaNegativa: 0 }
  );

  const baseNum = Number(puntajeBase || 0);
  const puntajeSimulado = baseNum + sumaPositiva + sumaNegativa;

  const guardarSistema = () => {
    const payload = {
      nombreSistema,
      puntajeBase: baseNum,
      factores: configFactores,
      resumen: {
        sumaPositiva,
        sumaNegativa,
        puntajeSimulado,
      },
    };

    console.log("🧩 Sistema de scoring configurado:", payload);
    alert(
      "Configuración de sistema de scoring registrada en consola.\n(Falta implementar guardado real en la base de datos.)"
    );
  };

  return (
    <div className="container my-4">
      <h2 className="text-primary mb-2">Scoring modular (local)</h2>
      <p className="text-muted">
        Configura cómo cada parámetro aporta al puntaje final usando{" "}
        <strong>valores de prueba</strong>, rangos favorables/desfavorables y
        bonos. Las variables categóricas se representan con códigos numéricos
        (se indican en cada ayuda).
      </p>

      {/* Resumen general */}
      <div className="card shadow-sm p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-5">
            <label className="form-label">Nombre del sistema de scoring</label>
            <input
              type="text"
              className="form-control"
              value={nombreSistema}
              onChange={(e) => setNombreSistema(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Puntaje base</label>
            <input
              type="number"
              className="form-control"
              value={puntajeBase}
              onChange={(e) => setPuntajeBase(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-flex flex-column justify-content-center">
            <p className="mb-1">
              <strong>Suma bonos positivos:</strong>{" "}
              <span className="text-success">
                {sumaPositiva.toFixed(2)}
              </span>
            </p>
            <p className="mb-1">
              <strong>Suma bonos negativos:</strong>{" "}
              <span className="text-danger">
                {sumaNegativa.toFixed(2)}
              </span>
            </p>
            <p className="mb-0">
              <strong>Puntaje simulado:</strong>{" "}
              <span
                className={
                  puntajeSimulado >= baseNum ? "text-success" : "text-danger"
                }
              >
                {puntajeSimulado.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bloques por factor */}
      {FACTORES.map((f) => {
        const cfg = configFactores[f.key];
        const aporte = calcularAporteFactor(cfg);

        return (
          <div key={f.key} className="card shadow-sm p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">{f.label}</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`switch-${f.key}`}
                  checked={cfg.enabled}
                  onChange={(e) =>
                    actualizarFactor(f.key, { enabled: e.target.checked })
                  }
                />
                <label
                  className="form-check-label small"
                  htmlFor={`switch-${f.key}`}
                >
                  Usar en este sistema
                </label>
              </div>
            </div>

            <p className="text-muted small mb-3">{f.ayuda}</p>

            <div className="row g-2 mb-2">
              {/* Valor de prueba */}
              <div className="col-md-3">
                <label className="form-label form-label-sm">
                  Valor de prueba
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={cfg.testValue}
                  placeholder={f.placeholder || ""}
                  onChange={(e) =>
                    actualizarFactor(f.key, { testValue: e.target.value })
                  }
                />
              </div>

              {/* Rango positivo */}
              <div className="col-md-4">
                <label className="form-label form-label-sm">
                  Rango favorable (min–max)
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Mín"
                    value={cfg.minPos}
                    onChange={(e) =>
                      actualizarFactor(f.key, { minPos: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Máx"
                    value={cfg.maxPos}
                    onChange={(e) =>
                      actualizarFactor(f.key, { maxPos: e.target.value })
                    }
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control form-control-sm mt-1"
                  placeholder="Bonus positivo (0–100)"
                  value={cfg.bonusPos}
                  onChange={(e) =>
                    actualizarFactor(f.key, { bonusPos: e.target.value })
                  }
                />
              </div>

              {/* Rango negativo */}
              <div className="col-md-4">
                <label className="form-label form-label-sm">
                  Rango desfavorable (min–max)
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Mín"
                    value={cfg.minNeg}
                    onChange={(e) =>
                      actualizarFactor(f.key, { minNeg: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Máx"
                    value={cfg.maxNeg}
                    onChange={(e) =>
                      actualizarFactor(f.key, { maxNeg: e.target.value })
                    }
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control form-control-sm mt-1"
                  placeholder="Bonus negativo (0–100)"
                  value={cfg.bonusNeg}
                  onChange={(e) =>
                    actualizarFactor(f.key, { bonusNeg: e.target.value })
                  }
                />
              </div>
            </div>

            <p className="small mb-0">
              <strong>Aporte al puntaje (con el valor de prueba actual):</strong>{" "}
              <span className={aporte >= 0 ? "text-success" : "text-danger"}>
                {aporte.toFixed(2)}
              </span>
            </p>
          </div>
        );
      })}

      <div className="text-end my-4">
        <button className="btn btn-primary" type="button" onClick={guardarSistema}>
          Guardar configuración (simulada)
        </button>
      </div>

      {/* Resumen final abajo */}
      <div className="card shadow-sm p-3 mb-5">
        <h4 className="mb-3 text-center">Resumen del puntaje</h4>
        <p>
          Puntaje base: <strong>{baseNum}</strong>
        </p>
        <p>
          Suma bonos positivos:{" "}
          <span className="text-success">
            <strong>{sumaPositiva.toFixed(2)}</strong>
          </span>
        </p>
        <p>
          Suma bonos negativos:{" "}
          <span className="text-danger">
            <strong>{sumaNegativa.toFixed(2)}</strong>
          </span>
        </p>
        <hr />
        <p className="fs-5 text-center">
          Puntaje simulado:{" "}
          <strong
            className={
              puntajeSimulado >= baseNum ? "text-success" : "text-danger"
            }
          >
            {puntajeSimulado.toFixed(2)}
          </strong>
        </p>
        <p className="text-muted small">
          El puntaje simulado se calcula como:{" "}
          <code>base + suma(bonos positivos) + suma(bonos negativos)</code>, en
          función de los valores de prueba que configures aquí.
        </p>
      </div>
    </div>
  );
}
