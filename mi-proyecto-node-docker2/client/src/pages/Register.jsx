import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [rut, setRut] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut, clave }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar usuario.");

      setSuccess("✅ Usuario registrado correctamente. Redirigiendo...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="card shadow-lg p-5 border-0" style={{ width: "22rem" }}>
        <h2 className="text-center mb-4 text-primary fw-bold">Registro de Usuario</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

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
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="********"
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100">
            Registrar
          </button>
        </form>

        <button
          className="btn btn-link mt-3 text-secondary"
          onClick={() => navigate("/login")}
        >
          Ya tengo una cuenta
        </button>
      </div>
    </div>
  );
}
