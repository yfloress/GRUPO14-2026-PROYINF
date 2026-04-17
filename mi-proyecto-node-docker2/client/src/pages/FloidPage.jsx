// /client/src/pages/FloidPage.js
import React, { useState } from "react";
import api from "../services/apiClient";

const FloidPage = () => {
  const [cuentas, setCuentas] = useState(null);

  const iniciarConexion = async () => {
    const res = await api.post("/floid/iniciar", {
      rut: "12345678-9",
      email: "cliente@correo.cl",
    });
    alert("Sesión iniciada: " + res.data.session_id);

    const cuentasRes = await api.get("/floid/callback?session_id=mock-session-001");
    setCuentas(cuentasRes.data);
  };

  return (
    <div className="container text-center mt-5">
      <h2>Simular conexión con Floid</h2>
      <button className="btn btn-info" onClick={iniciarConexion}>
        Obtener información financiera
      </button>

      {cuentas && (
        <pre className="mt-4 text-start bg-light p-3 rounded">
          {JSON.stringify(cuentas, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default FloidPage;
