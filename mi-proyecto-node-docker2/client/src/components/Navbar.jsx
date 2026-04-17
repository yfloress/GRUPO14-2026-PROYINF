import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-glass sticky-top">
      <div className="container-fluid px-lg-4">
        <Link className="navbar-brand text-primary" to="/">
          <i className="bi bi-bank2 me-2"></i>Banco ProyInf
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/prestamo-preaprobado">Mis Ofertas</Link>
                </li>
                 <li className="nav-item">
                  <Link className="nav-link" to="/evaluacion-riesgo">Simular Crédito</Link>
                </li>
                {user.rol === "administrador" && (
                  <li className="nav-item">
                    <Link className="nav-link text-danger fw-bold" to="/admin"><i className="bi bi-shield-lock me-1"></i>Panel Admin</Link>
                  </li>
                )}
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">Inicio</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/evaluacion-riesgo">Simulación de Crédito</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/faq">Preguntas Frecuentes</Link>
                </li>
              </>
            )}
          </ul>
          
          <ul className="navbar-nav ms-auto align-items-center mt-2 mt-lg-0">
             {user ? (
               <>
                 <li className="nav-item me-lg-4 mb-2 mb-lg-0">
                   <div className="d-flex align-items-center text-secondary">
                     <i className="bi bi-person-circle fs-5 me-2 text-primary"></i>
                     <div>
                        <div className="fw-semibold" style={{fontSize:"0.9rem", lineHeight:"1"}}>{user.nombre_completo || "Usuario"}</div>
                        <div style={{fontSize:"0.75rem", lineHeight:"1"}}>{user.rut}</div>
                     </div>
                   </div>
                 </li>
                 <li className="nav-item">
                   <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-sm w-100">
                     <i className="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
                   </button>
                 </li>
               </>
             ) : (
                <li className="nav-item mt-2 mt-lg-0">
                  <Link className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm w-100" to="/login">
                    Iniciar Sesión
                  </Link>
                </li>
             )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
