// 📄 client/src/pages/EvaluacionRiesgo.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Formulario integral de Evaluación de Riesgo Crediticio.
 * Compatibilizado con la tabla scoring_evaluaciones y nuevos campos:
 * - apellido_paterno, apellido_materno
 * - mora_mas_larga_24m
 * - consultas_credito_recientes
 * - debe_pension_alimenticia
 * - condición laboral incluye "Jubilado"
 */

function EvaluacionRiesgo() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    edad: "",
    sistema_salud: "",
    tipo_vivienda: "",
    ingreso_mensual: "",
    deuda_mensual: "",
    condicion_laboral: "",
    antiguedad_meses: "",
    integrantes_hogar: "",
    nivel_educacional: "",
    mora_mas_larga_24m: "",
    pagos_puntuales_12m: "",
    creditos_cerrados_sin_mora: "",
    consultas_credito_recientes: "",
    antiguedad_crediticia_anios: "",
    uso_tarjeta_pct: "",
    tipo_pago_tarjeta: "",
    kyc_verificado: false,
    debe_pension_alimenticia: false,
  });

  const [error, setError] = useState("");

  // Controladores de cambio
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limitar uso_tarjeta_pct a 100%
    if (name === "uso_tarjeta_pct" && Number(value) > 100) {
      setFormData({ ...formData, [name]: 100 });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const camposObligatorios = [
      "nombre",
      "apellido_paterno",
      "edad",
      "sistema_salud",
      "tipo_vivienda",
      "ingreso_mensual",
      "deuda_mensual",
      "condicion_laboral",
      "antiguedad_meses",
      "integrantes_hogar",
      "nivel_educacional",
    ];

    const vacios = camposObligatorios.some(
      (campo) => String(formData[campo]).trim() === ""
    );
    if (vacios) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    const edad = Number(formData.edad);
    const ingreso = Number(formData.ingreso_mensual);
    const deuda = Number(formData.deuda_mensual);
    const antig = Number(formData.antiguedad_meses);
    const hogar = Number(formData.integrantes_hogar);

    if (edad < 18 || edad > 76) {
      setError("La edad debe estar entre 18 y 76 años.");
      return;
    }
    if (ingreso <= 0) {
      setError("El ingreso mensual debe ser mayor a 0.");
      return;
    }
    if (deuda < 0) {
      setError("La deuda mensual no puede ser negativa.");
      return;
    }
    if (antig < 0) {
      setError("La antigüedad laboral no puede ser negativa.");
      return;
    }
    if (hogar < 0) {
      setError("Los integrantes del hogar no pueden ser negativos (0 es válido).");
      return;
    }

    localStorage.setItem("datosEvaluacion", JSON.stringify(formData));
    alert("✅ Evaluación registrada. Continúa con la autenticación Clave Única.");
    navigate("/claveunica");
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-3">Evaluación de Riesgo Crediticio</h2>
      <p className="text-center text-muted">
        Completa la información para que el sistema calcule tu puntaje de riesgo
        crediticio con base en tus antecedentes personales, laborales y financieros.
      </p>

      <form
        onSubmit={handleSubmit}
        className="card shadow p-4 mx-auto"
        style={{ maxWidth: "900px" }}
      >
        {/* DATOS PERSONALES */}
        <h4 className="text-primary mt-2 mb-3">Datos Personales</h4>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="nombre"
              className="form-control"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Apellido Paterno</label>
            <input
              type="text"
              name="apellido_paterno"
              className="form-control"
              value={formData.apellido_paterno}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Apellido Materno</label>
            <input
              type="text"
              name="apellido_materno"
              className="form-control"
              value={formData.apellido_materno}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Edad</label>
            <input
              type="number"
              name="edad"
              className="form-control"
              value={formData.edad}
              onChange={handleChange}
              min="18"
              max="76"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Integrantes del hogar</label>
            <input
              type="number"
              name="integrantes_hogar"
              className="form-control"
              value={formData.integrantes_hogar}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Sistema de salud</label>
            <select
              name="sistema_salud"
              className="form-select"
              value={formData.sistema_salud}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="Fonasa A">Fonasa A</option>
              <option value="Fonasa B">Fonasa B</option>
              <option value="Fonasa C">Fonasa C</option>
              <option value="Fonasa D">Fonasa D</option>
              <option value="Isapre">Isapre</option>
            </select>
          </div>
        </div>

        {/* VIVIENDA */}
        <h4 className="text-primary mt-4 mb-3">Condiciones Sociodemográficas</h4>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Tipo de vivienda</label>
            <select
              name="tipo_vivienda"
              className="form-select"
              value={formData.tipo_vivienda}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="Propia">Propia</option>
              <option value="Arrendada">Arrendada</option>
              <option value="Allegado">Allegado</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Nivel educacional</label>
            <select
              name="nivel_educacional"
              className="form-select"
              value={formData.nivel_educacional}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="Básico">Básico</option>
              <option value="Medio">Medio</option>
              <option value="Técnico">Técnico</option>
              <option value="Superior">Superior</option>
            </select>
          </div>
        </div>

        {/* SITUACIÓN LABORAL */}
        <h4 className="text-primary mt-4 mb-3">Situación Laboral y Financiera</h4>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Condición laboral</label>
            <select
              name="condicion_laboral"
              className="form-select"
              value={formData.condicion_laboral}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="Indefinido">Contrato indefinido</option>
              <option value="Plazo fijo">Plazo fijo</option>
              <option value="Independiente">Independiente</option>
              <option value="Informal">Informal</option>
              <option value="Jubilado">Jubilado</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Antigüedad laboral (meses)</label>
            <input
              type="number"
              name="antiguedad_meses"
              className="form-control"
              min="0"
              value={formData.antiguedad_meses}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Ingreso mensual (CLP)</label>
            <input
              type="number"
              name="ingreso_mensual"
              className="form-control"
              value={formData.ingreso_mensual}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Deuda mensual (CLP)</label>
            <input
              type="number"
              name="deuda_mensual"
              className="form-control"
              value={formData.deuda_mensual}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Uso tarjeta crédito (%)</label>
            <input
              type="number"
              name="uso_tarjeta_pct"
              className="form-control"
              value={formData.uso_tarjeta_pct}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* HISTORIAL CREDITICIO */}
        <h4 className="text-primary mt-4 mb-3">Historial Crediticio</h4>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Mora más larga (24 meses)</label>
            <input
              type="number"
              name="mora_mas_larga_24m"
              className="form-control"
              value={formData.mora_mas_larga_24m}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Pagos puntuales (últimos 12 meses)</label>
            <input
              type="number"
              name="pagos_puntuales_12m"
              className="form-control"
              value={formData.pagos_puntuales_12m}
              onChange={handleChange}
              min="0"
              max="12"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Créditos cerrados sin mora</label>
            <input
              type="number"
              name="creditos_cerrados_sin_mora"
              className="form-control"
              value={formData.creditos_cerrados_sin_mora}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        {/* COMPORTAMIENTO FINANCIERO */}
        <h4 className="text-primary mt-4 mb-3">Comportamiento Financiero</h4>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Consultas recientes de crédito</label>
            <input
              type="number"
              name="consultas_credito_recientes"
              className="form-control"
              value={formData.consultas_credito_recientes}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Antigüedad crediticia (años)</label>
            <input
              type="number"
              name="antiguedad_crediticia_anios"
              className="form-control"
              value={formData.antiguedad_crediticia_anios}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Tipo de pago de tarjeta</label>
            <select
              name="tipo_pago_tarjeta"
              className="form-select"
              value={formData.tipo_pago_tarjeta}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="Pago total">Pago total</option>
              <option value="Pago mínimo">Pago mínimo</option>
            </select>
          </div>
        </div>

        {/* CHECKBOXES */}
        <div className="form-check my-3">
          <input
            type="checkbox"
            name="kyc_verificado"
            id="kyc_verificado"
            className="form-check-input"
            checked={formData.kyc_verificado}
            onChange={handleCheckbox}
          />
          <label htmlFor="kyc_verificado" className="form-check-label">
            Confirmo que mi identidad ha sido verificada (KYC)
          </label>
        </div>

        <div className="form-check my-3">
          <input
            type="checkbox"
            name="debe_pension_alimenticia"
            id="debe_pension_alimenticia"
            className="form-check-input"
            checked={formData.debe_pension_alimenticia}
            onChange={handleCheckbox}
          />
          <label htmlFor="debe_pension_alimenticia" className="form-check-label">
            Declaro tener deuda judicial activa de pensión alimenticia
          </label>
        </div>

        {error && <p className="text-danger">{error}</p>}

        <button type="submit" className="btn btn-primary w-100 mt-3">
          Evaluar Riesgo
        </button>
        <button
          type="button"
          className="btn btn-secondary w-100 mt-2"
          onClick={() => navigate("/")}
        >
          Volver al Inicio
        </button>
      </form>
    </div>
  );
}

export default EvaluacionRiesgo;
