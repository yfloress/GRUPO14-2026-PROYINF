// /client/src/pages/FaceIOPage.js
import React, { useState } from "react";
import api from "../services/apiClient";

const FaceIOPage = () => {
  const [resultado, setResultado] = useState(null);

  const verificar = async () => {
    const res = await api.post("/faceio/verificar", {});
    setResultado(res.data);
  };

  return (
    <div className="container text-center mt-5">
      <h2>Prueba Autenticación Facial</h2>
      <button className="btn btn-secondary" onClick={verificar}>
        Iniciar escaneo facial (mock)
      </button>

      {resultado && (
        <pre className="mt-4 text-start bg-light p-3 rounded">
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default FaceIOPage;
