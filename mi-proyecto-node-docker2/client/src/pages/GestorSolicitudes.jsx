import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function GestorSolicitudes() {
  const { user } = useAuth();

  const [filtro, setFiltro] = useState("todos");
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  function obtenerEstado(solicitud) {
    // Ya confiamos en lo que manda el backend
    return solicitud.estado_prestamo || "Pendiente";
  }

  // 🔹 Cargar solicitudes reales desde el backend filtradas por RUT
  useEffect(() => {
    if (!user?.rut) return;

    const cargarSolicitudes = async () => {
      try {
        setCargando(true);
        setError(null);

        const res = await fetch(
          `http://localhost:3000/api/prestamos?rut=${user.rut}`
        );

        if (!res.ok) {
          throw new Error("Error al cargar las solicitudes de préstamo");
        }

        const data = await res.json();
        setSolicitudes(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarSolicitudes();
  }, [user]);

  // 🔹 Aplicar filtro (Todos / Pendiente / Finalizado)
  const filtradas = solicitudes.filter((s) => {
    const estado = obtenerEstado(s);
    if (filtro === "todos") return true;
    return estado === filtro;
  });

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: "#0066ff" }}>
        Gestor de Solicitudes
      </h2>
      <p className="text-center text-muted mb-4">
        Aquí puedes revisar el estado de tus solicitudes de préstamo: si aún
        tienen cuotas pendientes o si ya están completamente pagadas.
      </p>

      <div className="d-flex justify-content-center mb-3 gap-2">
        <button
          className={`btn btn-sm ${
            filtro === "todos" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setFiltro("todos")}
        >
          Todas
        </button>
        <button
          className={`btn btn-sm ${
            filtro === "Pendiente" ? "btn-warning" : "btn-outline-warning"
          }`}
          onClick={() => setFiltro("Pendiente")}
        >
          Pendientes
        </button>
        <button
          className={`btn btn-sm ${
            filtro === "Finalizado" ? "btn-success" : "btn-outline-success"
          }`}
          onClick={() => setFiltro("Finalizado")}
        >
          Finalizadas
        </button>
      </div>

      {!user?.rut && (
        <p className="text-center text-muted">
          Debes iniciar sesión para ver tus solicitudes.
        </p>
      )}

      {user?.rut && cargando && (
        <p className="text-center text-muted">⏳ Cargando solicitudes...</p>
      )}

      {user?.rut && error && (
        <p className="text-center text-danger">❌ {error}</p>
      )}

      {user?.rut && !cargando && !error && filtradas.length === 0 ? (
        <p className="text-center text-muted">
          No hay solicitudes con ese estado.
        </p>
      ) : user?.rut && !cargando && !error ? (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Monto</th>
                <th>Cuotas pagadas</th>
                <th>Cuotas totales</th>
                <th>Estado</th>
                <th>Fecha de inicio</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((s) => {
                const estado = obtenerEstado(s);
                const pagadas = s.cuotas_pagadas ?? 0;
                const totales = s.cuotas_totales ?? s.cuotas ?? 0;
                const fechaInicio = s.fecha_inicio || "-";

                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>${Number(s.monto).toLocaleString("es-CL")}</td>
                    <td>{pagadas}</td>
                    <td>{totales}</td>
                    <td>
                      <span
                        className={
                          "badge " +
                          (estado === "Pendiente"
                            ? "bg-warning text-dark"
                            : "bg-success")
                        }
                      >
                        {estado}
                      </span>
                    </td>
                    <td>
                      {s.fecha_inicio
                        ? new Date(s.fecha_inicio).toLocaleDateString("es-CL")
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
        * Estos datos se están obteniendo desde tu backend en tiempo real.
      </p>
    </div>
  );
}
