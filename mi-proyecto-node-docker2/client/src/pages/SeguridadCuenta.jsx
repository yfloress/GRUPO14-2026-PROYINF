// src/pages/SeguridadCuenta.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function SeguridadCuenta() {
  const { user } = useAuth();

  const [fotoFrenteSubida, setFotoFrenteSubida] = useState(false);
  const [fotoReversoSubida, setFotoReversoSubida] = useState(false);
  const [mensajeFotos, setMensajeFotos] = useState("");

  const [correoSeguridad, setCorreoSeguridad] = useState("");
  const [mensajeCorreo, setMensajeCorreo] = useState("");
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // 🔹 Cargar perfil desde la BD
  useEffect(() => {
    if (!user?.rut) {
      setCargandoPerfil(false);
      return;
    }

    const cargarPerfil = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/usuarios/perfil?rut=${encodeURIComponent(
            user.rut
          )}`
        );
        const data = await res.json();

        if (res.ok && data.ok) {
          const u = data.user;
          setCorreoSeguridad(u.correo_seguridad || "");
          // tus columnas reales:
          setFotoFrenteSubida(Boolean(u.foto_carnet_frontal));
          setFotoReversoSubida(Boolean(u.foto_carnet_posterior));
        } else {
          console.warn("No se pudo cargar el perfil:", data.error);
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setCargandoPerfil(false);
      }
    };

    cargarPerfil();
  }, [user]);

  if (!user) {
    return (
      <div className="container mt-5" style={{ maxWidth: "720px" }}>
        <h2 className="text-center mb-3">Seguridad de la Cuenta</h2>
        <p className="text-center text-muted">
          Debes iniciar sesión para ver esta sección.
        </p>
      </div>
    );
  }

  // 🔹 Simular subida de foto frontal
  const handleSubirFrente = async () => {
    setMensajeFotos("");

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/carnet-foto", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut: user.rut,
          lado: "frente",      // el backend lo traduce a foto_carnet_frontal
          valor: "subido",     // texto cualquiera, solo nos interesa que no sea null
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al actualizar la foto frontal.");
      }

      setFotoFrenteSubida(true);
      setMensajeFotos("✅ Foto frontal marcada como subida (simulado).");
    } catch (err) {
      console.error(err);
      setMensajeFotos("❌ Ocurrió un error al subir la foto frontal.");
    }
  };

  // 🔹 Simular subida de foto trasera
  const handleSubirReverso = async () => {
    setMensajeFotos("");

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/carnet-foto", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut: user.rut,
          lado: "reverso",     // el backend lo traduce a foto_carnet_posterior
          valor: "subido",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al actualizar la foto trasera.");
      }

      setFotoReversoSubida(true);
      setMensajeFotos("✅ Foto trasera marcada como subida (simulado).");
    } catch (err) {
      console.error(err);
      setMensajeFotos("❌ Ocurrió un error al subir la foto trasera.");
    }
  };

  // 🔹 Guardar / actualizar correo de seguridad
  const handleGuardarCorreo = async (e) => {
    e.preventDefault();
    setMensajeCorreo("");

    if (!correoSeguridad.trim()) {
      setMensajeCorreo("⚠️ Debes ingresar un correo.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/seguridad", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut: user.rut,
          correo_seguridad: correoSeguridad,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al actualizar el correo.");
      }

      setMensajeCorreo("✅ Correo actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setMensajeCorreo("❌ Ocurrió un error al guardar el correo.");
    }
  };

  const colorMensaje = (msg) => {
    if (msg.startsWith("✅")) return "green";
    if (msg.startsWith("⚠️")) return "#d39e00";
    if (msg.startsWith("❌")) return "red";
    return "inherit";
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "900px" }}>
      <h2 className="text-center mb-3">Seguridad de la Cuenta</h2>
      <p className="text-center text-muted mb-4">
        Verifica tu identidad y gestiona la seguridad de tu cuenta.
      </p>

      {/* Info del usuario */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Información del usuario</h5>

          <p>
            <strong>RUT:</strong> {user.rut}
          </p>
          <p>
            <strong>Correo de seguridad:</strong>{" "}
            {cargandoPerfil ? (
              <span className="text-muted">Cargando...</span>
            ) : correoSeguridad ? (
              correoSeguridad
            ) : (
              <span className="text-muted">No asignado</span>
            )}
          </p>
          <p>
            <strong>Carnet frontal:</strong>{" "}
            {fotoFrenteSubida ? "Subido" : "No subido"}
          </p>
          <p>
            <strong>Carnet trasero:</strong>{" "}
            {fotoReversoSubida ? "Subido" : "No subido"}
          </p>
        </div>
      </div>

      {/* Verificación de identidad */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Verificación de Identidad</h5>

          <div className="row g-3">
            <div className="col-md-6">
              <button
                className="btn btn-outline-primary w-100"
                onClick={handleSubirFrente}
              >
                {fotoFrenteSubida
                  ? "✅ Foto frontal subida"
                  : "Subir foto frontal"}
              </button>
            </div>

            <div className="col-md-6">
              <button
                className="btn btn-outline-primary w-100"
                onClick={handleSubirReverso}
              >
                {fotoReversoSubida
                  ? "✅ Foto trasera subida"
                  : "Subir foto trasera"}
              </button>
            </div>
          </div>

          {mensajeFotos && (
            <p className="mt-3" style={{ color: colorMensaje(mensajeFotos) }}>
              {mensajeFotos}
            </p>
          )}
        </div>
      </div>

      {/* Correo de Seguridad */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Correo de Seguridad</h5>

          <form onSubmit={handleGuardarCorreo}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                value={correoSeguridad}
                onChange={(e) => setCorreoSeguridad(e.target.value)}
                placeholder="correo@ejemplo.cl"
              />
            </div>

            <button className="btn btn-primary">Guardar correo</button>

            {mensajeCorreo && (
              <p
                className="mt-3"
                style={{ color: colorMensaje(mensajeCorreo) }}
              >
                {mensajeCorreo}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
