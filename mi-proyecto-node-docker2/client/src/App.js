// Importar dependencias y componentes principales
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Contexto y rutas protegidas
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import GestorSolicitudes from "./pages/GestorSolicitudes";
import FAQ from "./pages/FAQ";

// Páginas base
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SeguridadCuenta from "./pages/SeguridadCuenta";
import AdminPanel from "./pages/AdminPanel";
import AdminScoringModular from "./pages/AdminScoringModular";
import CompararScorings from "./pages/CompararScorings";

// Módulos del sistema de préstamos
import SolicitudPrestamo from "./pages/SolicitudPrestamo";
import GestionPagos from "./pages/GestionPagos";
import EvaluacionRiesgo from "./pages/EvaluacionRiesgo";
import PrestamoPreAprobado from "./pages/PrestamoPreAprobado";
import ResultadoScoring from "./pages/ResultadoScoring";

// Integraciones con APIs externas
import ClaveUnicaPage from "./pages/ClaveUnicaPage";
import TransbankPage from "./pages/TransbankPage";
import FloidPage from "./pages/FloidPage";
import FaceIOPage from "./pages/FaceIOPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="container my-4">
          <Routes>
            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Secciones principales (protegidas) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <Contact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />

            {/* Sistema de préstamos (protegido) */}
            <Route
              path="/solicitud-prestamo"
              element={
                <ProtectedRoute>
                  <SolicitudPrestamo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gestion-pagos"
              element={
                <ProtectedRoute>
                  <GestionPagos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluacion-riesgo"
              element={
                <ProtectedRoute>
                  <EvaluacionRiesgo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prestamo-preaprobado"
              element={
                <ProtectedRoute>
                  <PrestamoPreAprobado />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resultado-scoring"
              element={
                <ProtectedRoute>
                  <ResultadoScoring />
                </ProtectedRoute>
              }
            />

            {/* Integraciones (también protegidas por ahora) */}
            <Route
              path="/claveunica"
              element={
                <ProtectedRoute>
                  <ClaveUnicaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transbank"
              element={
                <ProtectedRoute>
                  <TransbankPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/floid"
              element={
                <ProtectedRoute>
                  <FloidPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faceio"
              element={
                <ProtectedRoute>
                  <FaceIOPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gestor-solicitudes"
              element={
                <ProtectedRoute>
                  <GestorSolicitudes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faq"
              element={
                <ProtectedRoute>
                  <FAQ />
                </ProtectedRoute>
              }
            />

            {/* 🔐 Seguridad de cuenta (SIN ProtectedRoute) */}
            <Route path="/seguridad" element={<SeguridadCuenta />} />
            {/* Soportamos también /seguridad-cuenta por si algún botón apunta ahí */}
            <Route path="/seguridad-cuenta" element={<SeguridadCuenta />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/scoring-modular" element={<AdminScoringModular />} />
            <Route path="/comparar-scorings" element={<CompararScorings />} />

            <Route path="/register" element={<Register />} />

            {/* Ruta por defecto */}
            <Route path="*" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
