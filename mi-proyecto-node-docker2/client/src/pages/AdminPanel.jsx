// src/pages/AdminPanel.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <div className="container my-5">
      <h2 className="text-primary mb-3">Panel de Administrador</h2>
      <p className="text-muted mb-4">
        Bienvenido administrador. Aquí puedes gestionar sistemas de scoring y
        otras configuraciones avanzadas.
      </p>

      <div className="card shadow p-4">
        <h4 className="mb-3">Acciones disponibles</h4>

        <button
          className="btn btn-primary btn-lg w-100"
          onClick={() => navigate("/admin/scoring-modular")}
        >
          Crear sistema de scoring
        </button>
      </div>
    </div>
  );
}
