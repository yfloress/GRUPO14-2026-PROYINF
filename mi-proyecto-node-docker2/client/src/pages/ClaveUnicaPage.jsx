// 📄 client/src/pages/ClaveUnicaPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Página que simula el inicio de sesión con Clave Única.
 * - Verifica que existan datos previos de evaluación.
 * - Simula autenticación básica (sin API real).
 * - Si el login es exitoso, redirige al resultado del scoring.
 */

function ClaveUnicaPage() {
  const navigate = useNavigate();
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
  e.preventDefault();

  // Validar que haya datos previos en localStorage
  const datosEvaluacion = localStorage.getItem("datosEvaluacion");
  if (!datosEvaluacion) {
    alert("No se encontró una evaluación previa. Redirigiendo...");
    navigate("/evaluacion-riesgo");
    return;
  }

  // Simulación de autenticación Clave Única
  if (rut.trim() === "" || password.trim() === "") {
    setError("Por favor ingresa tu RUT y contraseña.");
    return;
  }

  // Verificación simulada
  if (password === "1234") {
    // Guardar RUT y token del cliente autenticado
    localStorage.setItem("rutCliente", rut);
    localStorage.setItem("claveUnicaToken", "token-simulado-123456");

    // ✅ Reescribir los datos previos para garantizar persistencia
    const datosPrevios = JSON.parse(datosEvaluacion);
    localStorage.setItem("datosEvaluacion", JSON.stringify(datosPrevios));

    alert("Autenticación exitosa con Clave Única simulada.");

    // ✅ Redirigir al resultado del scoring
    navigate("/resultado-scoring");
  } else {
    setError("Credenciales incorrectas. Intenta nuevamente.");
  }
};


  return (
    <div className="container text-center my-5">
      <h2>Ingreso con Clave Única (Simulado)</h2>
      <p className="text-muted">
        Este módulo simula el inicio de sesión mediante Clave Única para
        continuar con la evaluación de riesgo.
      </p>

      <form
        onSubmit={handleSubmit}
        className="card p-4 mx-auto shadow"
        style={{ maxWidth: "420px" }}
      >
        <div className="form-group mb-3">
          <label htmlFor="rut" className="form-label">
            RUT
          </label>
          <input
            type="text"
            id="rut"
            className="form-control"
            placeholder="12.345.678-9"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-danger">{error}</p>}

        <button type="submit" className="btn btn-primary w-100 mt-3">
          Ingresar
        </button>

        <button
          type="button"
          className="btn btn-secondary w-100 mt-3"
          onClick={() => navigate("/evaluacion-riesgo")}
        >
          Volver a Evaluación
        </button>
      </form>
    </div>
  );
}

export default ClaveUnicaPage;
