import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const opciones = [
    { label: "Solicitud de Préstamo", route: "/solicitud-prestamo", icon: "bi bi-cash-stack" },
    { label: "Gestión de Pagos", route: "/gestion-pagos", icon: "bi bi-credit-card" },
    { label: "Evaluación de Riesgo", route: "/evaluacion-riesgo", icon: "bi bi-shield-check" },
    { label: "Préstamo Pre-Aprobado", route: "/prestamo-preaprobado", icon: "bi bi-hand-thumbs-up" },
    { label: "Gestor de Solicitudes", route: "/gestor-solicitudes", icon: "bi bi-folder2-open" },
    { label: "Preguntas Frecuentes", route: "/faq", icon: "bi bi-question-circle" },
    { label: "Seguridad", route: "/seguridad-cuenta", icon: "bi bi-shield-lock" },
    { label: "Comparar Scorings", route: "/comparar-scorings", icon: "bi bi-graph-up-arrow" },


  ];

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="w-100 d-flex justify-content-end">
        <button className="btn btn-outline-danger mb-3" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
      <h1 className="mb-5 text-center fw-bold text-primary">Menú Principal</h1>
      <div className="row g-4 w-100 justify-content-center">
        {opciones.map((op, i) => (
          <div key={i} className="col-10 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center">
            <div
              className="card shadow-lg text-center p-4 border-0"
              style={{ cursor: "pointer", width: "15rem" }}
              onClick={() => navigate(op.route)}
            >
              <i className={`${op.icon} fs-1 text-primary mb-3`}></i>
              <h5 className="fw-bold">{op.label}</h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
