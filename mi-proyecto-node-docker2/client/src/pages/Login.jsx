import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🟦 LOGIN CLIENTES
  const loginCliente = async () => {
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut, clave: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

      // 👉 Guardar en contexto como CLIENTE
      login(rut, "cliente");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  // 🟥 LOGIN ADMIN
  const loginAdmin = async () => {
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut, clave: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión como admin");

      // 👉 Guardar en contexto como ADMIN
      login(rut, "admin");
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  // 🟧 Cuando se presiona el botón normal (cliente)
  const handleSubmit = (e) => {
    e.preventDefault();
    loginCliente();
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="card shadow-lg p-5 border-0" style={{ width: "22rem" }}>
        <h2 className="text-center mb-4 text-primary fw-bold">Inicio de Sesión</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">RUT</label>
            <input
              type="text"
              className="form-control"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="11111111-1"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Clave</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          {/* 🔵 LOGIN CLIENTE */}
          <button type="submit" className="btn btn-primary w-100">
            Iniciar Sesión
          </button>

          {/* 🔹 OTRAS ACCIONES */}
          <div className="d-flex flex-column gap-2 mt-3">
            {/* 🔴 LOGIN ADMIN */}
            <button
              type="button"
              className="btn btn-outline-dark w-100"
              onClick={loginAdmin}
            >
              Ingreso Admin
            </button>

            {/* BOTONES FAQ / SIMULACIÓN */}
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary w-50"
                onClick={() => navigate("/evaluacion-riesgo")}
              >
                Simulación
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-50"
                onClick={() => navigate("/faq")}
              >
                FAQ
              </button>
            </div>
          </div>
        </form>

        <button
          className="btn btn-link mt-3 text-secondary"
          onClick={() => navigate("/register")}
        >
          ¿No tienes cuenta? Regístrate aquí
        </button>
      </div>
    </div>
  );
}
