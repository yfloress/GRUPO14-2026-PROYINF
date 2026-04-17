// 📄 client/src/pages/ResultadoScoring.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Spinner } from "react-bootstrap";

function ResultadoScoring() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    // ✅ Recuperar datos del resultado y evaluación previa
    const datosGuardados = localStorage.getItem("resultadoScoring");
    const datosEvaluacion = localStorage.getItem("datosEvaluacion");
    const rut = localStorage.getItem("rutCliente") || "00.000.000-0";

    if (!datosGuardados || !datosEvaluacion) {
      setMensaje("No se encontraron datos para mostrar.");
      return;
    }

    const resultadoObj = JSON.parse(datosGuardados);
    const evaluacionObj = JSON.parse(datosEvaluacion);

    // ✅ Combinar toda la información en un solo objeto para mostrar en pantalla
    const datosCompletos = {
      ...evaluacionObj,
      ...resultadoObj,
      rut,
    };

    setResultado(datosCompletos);

    // ✅ Quitar la fecha antes de enviar al backend
    const { fecha, ...datosSinFecha } = resultadoObj;

    // ✅ Enviar automáticamente al backend
    setGuardando(true);
    fetch("http://localhost:3000/api/scoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...evaluacionObj,     // datos base del formulario de evaluación
        ...datosSinFecha,     // resultado del scoring sin la fecha
        rut,                  // rut autenticado desde Clave Única
        motivo: resultadoObj.motivo || "Sin motivo adicional",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          console.log("✅ Informe guardado correctamente:", data.data);
          setMensaje("Informe guardado correctamente en la base de datos.");
        } else {
          console.warn("⚠️ Error en la respuesta del backend:", data);
          setMensaje("Ocurrió un error al guardar el informe.");
        }
      })
      .catch((err) => {
        console.error("❌ Error de conexión con el backend:", err);
        setMensaje("No se pudo conectar con el servidor.");
      })
      .finally(() => setGuardando(false));
  }, []);

  if (!resultado) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Cargando resultados de la simulación...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <Card className="shadow-lg p-4">
        <h2 className="text-center mb-4 text-primary">
          Resultado de Evaluación
        </h2>

        {/* DATOS PERSONALES */}
        <div className="mb-3">
          <p>
            <strong>Nombre completo:</strong>{" "}
            {resultado.nombre || "No informado"} {resultado.apellido_paterno || ""}{" "}
            {resultado.apellido_materno || ""}
          </p>
          <p>
            <strong>Edad:</strong> {resultado.edad || "No informado"} años
          </p>
          <p>
            <strong>Integrantes del hogar:</strong>{" "}
            {resultado.integrantes_hogar || 0}
          </p>
        </div>

        <hr />

        {/* CONDICIONES SOCIODEMOGRÁFICAS */}
        <div className="mb-3">
          <p>
            <strong>Sistema de salud:</strong>{" "}
            {resultado.sistema_salud || "No informado"}
          </p>
          <p>
            <strong>Tipo de vivienda:</strong>{" "}
            {resultado.tipo_vivienda || "No informado"}
          </p>
          <p>
            <strong>Nivel educacional:</strong>{" "}
            {resultado.nivel_educacional || "No informado"}
          </p>
        </div>

        <hr />

        {/* LABORAL Y FINANCIERO */}
        <div className="mb-3">
          <p>
            <strong>Condición laboral:</strong>{" "}
            {resultado.condicion_laboral || "No informado"}
          </p>
          <p>
            <strong>Antigüedad laboral:</strong>{" "}
            {resultado.antiguedad_meses || 0} meses
          </p>
          <p>
            <strong>Ingreso mensual:</strong> $
            {Number(resultado.ingreso_mensual || 0).toLocaleString("es-CL")}
          </p>
          <p>
            <strong>Deuda mensual:</strong> $
            {Number(resultado.deuda_mensual || 0).toLocaleString("es-CL")}
          </p>
          <p>
            <strong>Uso de tarjeta de crédito:</strong>{" "}
            {resultado.uso_tarjeta_pct || 0}% (máx. 100%)
          </p>
          <p>
            <strong>Tipo de pago de tarjeta:</strong>{" "}
            {resultado.tipo_pago_tarjeta || "No especificado"}
          </p>
        </div>

        <hr />

        {/* HISTORIAL CREDITICIO */}
        <div className="mb-3">
          <p>
            <strong>Mora más larga (24 meses):</strong>{" "}
            {resultado.mora_larga_24m || 0} días
          </p>
          <p>
            <strong>Pagos puntuales (12 meses):</strong>{" "}
            {resultado.pagos_puntuales_12m || 0}
          </p>
          <p>
            <strong>Créditos cerrados sin mora:</strong>{" "}
            {resultado.creditos_cerrados_sin_mora || 0}
          </p>
          <p>
            <strong>Consultas de crédito recientes:</strong>{" "}
            {resultado.consultas_credito_12m || 0}
          </p>
          <p>
            <strong>Antigüedad crediticia:</strong>{" "}
            {resultado.antiguedad_crediticia_anios || 0} años
          </p>
        </div>

        <hr />

        {/* RESULTADO FINAL */}
        <div className="text-center">
          <h4 className="fw-bold">Puntaje Total: {resultado.puntaje}</h4>
          <h5
            className={
              resultado.nivel?.includes("preferente")
                ? "text-success"
                : resultado.nivel?.includes("estándar")
                ? "text-warning"
                : "text-danger"
            }
          >
            Nivel de Riesgo: {resultado.nivel}
          </h5>
          <p className="mt-3">
            <em>{resultado.motivo}</em>
          </p>
        </div>

        {/* MENSAJES */}
        {guardando ? (
          <div className="text-center mt-4">
            <Spinner animation="border" size="sm" /> Guardando en la base de
            datos...
          </div>
        ) : (
          <p className="text-center text-muted mt-3">{mensaje}</p>
        )}

        <div className="text-center mt-4">
          <Button
            variant="primary"
            onClick={() => navigate("/solicitud-prestamo")}
          >
            Continuar con Solicitud
          </Button>{" "}
          <Button variant="secondary" onClick={() => navigate("/")}>
            Volver al Inicio
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ResultadoScoring;
