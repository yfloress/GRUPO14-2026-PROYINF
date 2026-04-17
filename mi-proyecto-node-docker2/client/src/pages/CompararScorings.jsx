import React, { useState } from "react";

export default function CompararScorings() {
  const [principal, setPrincipal] = useState("");
  const [modular, setModular] = useState("");
  const [resultado, setResultado] = useState("");

  const comparar = () => {
    const p = Number(principal);
    const m = Number(modular);

    if (Number.isNaN(p) || Number.isNaN(m)) {
      setResultado("Ingresa valores numéricos válidos.");
      return;
    }

    const diferencia = m - p;

    let texto = `Diferencia: ${diferencia.toFixed(2)} puntos.`;

    if (Math.abs(diferencia) < 20) {
      texto += " Los sistemas son consistentes.";
    } else if (diferencia > 0) {
      texto += " El sistema modular entrega un puntaje más favorable.";
    } else {
      texto += " El sistema modular es más restrictivo.";
    }

    setResultado(texto);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center text-primary mb-4">Comparación de Scoring</h2>

      <label className="form-label fw-semibold">Puntaje sistema principal</label>
      <input
        type="number"
        className="form-control mb-3"
        value={principal}
        onChange={(e) => setPrincipal(e.target.value)}
      />

      <label className="form-label fw-semibold">Puntaje sistema modular</label>
      <input
        type="number"
        className="form-control mb-3"
        value={modular}
        onChange={(e) => setModular(e.target.value)}
      />

      <button className="btn btn-primary w-100" onClick={comparar}>
        Comparar
      </button>

      {resultado && (
        <div className="alert alert-info mt-3">{resultado}</div>
      )}
    </div>
  );
}
