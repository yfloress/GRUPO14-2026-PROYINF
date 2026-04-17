// /client/src/pages/TransbankPage.js
import React, { useState } from "react";
import api from "../services/apiClient";

const TransbankPage = () => {
  const [resultado, setResultado] = useState(null);

  const handlePago = async () => {
    const body = {
      buyOrder: "ORD123",
      sessionId: "SESS001",
      amount: 12000,
    };
    const res = await api.post("/transbank/pago", body);
    setResultado(res.data);
  };

  return (
    <div className="container text-center mt-5">
      <h2>Simular Pago con Transbank</h2>
      <button className="btn btn-success" onClick={handlePago}>
        Iniciar Pago
      </button>
      {resultado && (
        <pre className="mt-4 text-start bg-light p-3 rounded">
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TransbankPage;
