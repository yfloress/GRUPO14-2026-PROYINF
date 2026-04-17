import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:3000";

export default function PrestamoPreaprobado() {
  const { user } = useAuth();

  const [ofertas, setOfertas] = useState([]);
  const [cargandoOfertas, setCargandoOfertas] = useState(false);
  const [errorOfertas, setErrorOfertas] = useState(null);

  const [seleccionada, setSeleccionada] = useState(null);
  const [montoSolicitado, setMontoSolicitado] = useState("");
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState("");
  const [paso, setPaso] = useState("lista"); // "lista" | "config" | "clave" | "final"
  const [mensajeSistema, setMensajeSistema] = useState("");
  const [claveUnica, setClaveUnica] = useState("");
  const [error, setError] = useState("");

  const [solicitudId, setSolicitudId] = useState(null); // id de preaprobados_solicitudes
  const [cargandoAceptar, setCargandoAceptar] = useState(false);
  const [cargandoClave, setCargandoClave] = useState(false);
  const [prestamoCreado, setPrestamoCreado] = useState(null);
  const [rentaInput, setRentaInput] = useState(""); // Input visual inmediato
  const [renta, setRenta] = useState(""); // Valor debounced para el algoritmo

  // Retraso para que no calcule mientras digita (Debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      setRenta(rentaInput);
    }, 700);
    return () => clearTimeout(handler);
  }, [rentaInput]);

  // 🔹 Cuota estimada simple (solo para mostrar)
  const cuotaEstimada =
    montoSolicitado && cuotasSeleccionadas
      ? montoSolicitado / cuotasSeleccionadas
      : 0;

  // ==================================================
  // 1) Cargar ofertas desde el backend cuando haya RUT
  // ==================================================
  useEffect(() => {
    if (!user?.rut) return;

    const fetchOfertas = async () => {
      try {
        setCargandoOfertas(true);
        setErrorOfertas(null);

        const res = await fetch(
          `${API_BASE}/api/preaprobados?rut=${encodeURIComponent(user.rut)}`
        );

        if (!res.ok) {
          throw new Error("Error al cargar las ofertas pre-aprobadas.");
        }

        const data = await res.json();
        if (!data.ok) {
          throw new Error(data.error || "Error al obtener ofertas.");
        }

        setOfertas(data.data || []);
      } catch (err) {
        console.error(err);
        setErrorOfertas(err.message);
      } finally {
        setCargandoOfertas(false);
      }
    };

    fetchOfertas();
  }, [user]);

  // ==================================================
  // 2) Seleccionar una oferta para configurarla
  // ==================================================
  const handleSeleccionOferta = (oferta) => {
    setSeleccionada(oferta);
    setError("");
    setMensajeSistema("");
    setPrestamoCreado(null);
    setSolicitudId(null);
    setClaveUnica("");

    setMontoSolicitado(Number(oferta.monto_maximo));
    setCuotasSeleccionadas(Number(oferta.min_cuotas));

    setPaso("config");
  };

  // ==================================================
  // 3) Aceptar oferta → consulta campañas activas (backend)
//      POST /api/preaprobados/:id/aceptar
  // ==================================================
  const handleAceptarOferta = async () => {
    if (!seleccionada || !user?.rut) return;

    setError("");
    setMensajeSistema("");
    setCargandoAceptar(true);

    try {
      // Validación rápida en front (igual backend valida)
      if (
        !montoSolicitado ||
        Number(montoSolicitado) <= 0 ||
        Number(montoSolicitado) > Number(seleccionada.monto_maximo)
      ) {
        setError(
          `El monto debe ser mayor a 0 y no exceder $${Number(
            seleccionada.monto_maximo
          ).toLocaleString("es-CL")}.`
        );
        setCargandoAceptar(false);
        return;
      }

      if (
        !cuotasSeleccionadas ||
        Number(cuotasSeleccionadas) < Number(seleccionada.min_cuotas) ||
        Number(cuotasSeleccionadas) > Number(seleccionada.max_cuotas)
      ) {
        setError(
          `El número de cuotas debe estar entre ${seleccionada.min_cuotas} y ${seleccionada.max_cuotas}.`
        );
        setCargandoAceptar(false);
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/preaprobados/${seleccionada.id}/aceptar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rut: user.rut,
            montoSolicitado,
            cuotas: cuotasSeleccionadas,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al aceptar la oferta.");
      }

      // El backend confirma que la campaña sigue activa y registra la solicitud
      setMensajeSistema(
        data.message ||
          "El sistema confirmó que la campaña sigue activa y la oferta es válida."
      );
      setSolicitudId(data.solicitud?.id);
      setPaso("clave");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCargandoAceptar(false);
    }
  };

  // ==================================================
  // 4) Confirmar con Clave Única → crea préstamo real
  //      POST /api/preaprobados/solicitudes/:id/confirmar-clave
  // ==================================================
  const handleConfirmarClave = async () => {
    if (!user?.rut || !solicitudId) {
      setError(
        "No se encontró la solicitud pendiente. Vuelve a aceptar la oferta."
      );
      return;
    }

    setError("");
    setCargandoClave(true);

    try {
      if (!claveUnica || claveUnica.trim().length < 4) {
        setError("Debes ingresar tu Clave Única (mínimo 4 caracteres para este demo).");
        setCargandoClave(false);
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/preaprobados/solicitudes/${solicitudId}/confirmar-clave`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rut: user.rut,
            claveUnica,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al confirmar con Clave Única.");
      }

      setPrestamoCreado(data.prestamo || null);
      setMensajeSistema(
        data.message ||
          "Préstamo pre-aprobado confirmado y registrado en el sistema."
      );
      setPaso("final");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCargandoClave(false);
    }
  };

  // ==================================================
  // LÓGICA HU 1: Filtrado de Préstamo Óptimo
  // ==================================================
  let idOfertaOptima = null;
  if (renta && Number(renta) > 0 && ofertas.length > 0) {
    const sueldo = Number(renta);
    const limiteCuota = sueldo * 0.30; 

    let mejorOferta = null;
    let menorDiferencia = Infinity;

    ofertas.forEach((oferta) => {
      // 0. Solo recomendamos campañas que estén ACTIVAS
      if (oferta.estado !== "activa") return;

      // 1. Validamos que la cuota mínima obligatoria (monto / max_cuotas) no exceda la asfixia del 30%
      const cuotaSeguridad = Number(oferta.monto_maximo) / Number(oferta.max_cuotas);
      
      if (cuotaSeguridad <= limiteCuota) {
        // 2. Calculamos una cuota media realista (promedio de cuotas)
        const cuotaMedia = Number(oferta.monto_maximo) / ((Number(oferta.min_cuotas) + Number(oferta.max_cuotas)) / 2);
        
        // 3. El préstamo "Óptimo" será el que aproveche inteligentemente el 80% de su capacidad segura de pago
        const capacidadIdeal = limiteCuota * 0.8; 
        const diferencia = Math.abs(cuotaMedia - capacidadIdeal);

        if (diferencia < menorDiferencia) {
          menorDiferencia = diferencia;
          mejorOferta = oferta;
        }
      }
    });

    idOfertaOptima = mejorOferta?.id;
  }

  // ==================================================
  // Render
  // ==================================================
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-3">Préstamo Pre-Aprobado</h2>
      <p className="text-center text-muted mb-4">
        Revisa las ofertas de préstamos pre-aprobados disponibles.
      </p>

      {!user?.rut && (
        <p className="text-center text-muted">
          Debes iniciar sesión para ver tus ofertas pre-aprobadas.
        </p>
      )}

      {user?.rut && (
        <>
          {/* Paso 1: Lista de ofertas */}
          {paso === "lista" && (
            <>
              {cargandoOfertas && (
                <p className="text-center text-muted">
                  Cargando ofertas pre-aprobadas...
                </p>
              )}

              {errorOfertas && (
                <p className="text-center text-danger">{errorOfertas}</p>
              )}

              {!cargandoOfertas && !errorOfertas && ofertas.length === 0 && (
                <p className="text-center text-muted">
                  No tienes campañas pre-aprobadas disponibles.
                </p>
              )}

              {!cargandoOfertas && !errorOfertas && ofertas.length > 0 && (
                <>
                  <div className="card mb-4 border-0 shadow-sm" style={{backgroundColor: "rgba(13, 110, 253, 0.05)"}}>
                    <div className="card-body">
                      <h5 className="mb-2 text-primary"><i className="bi bi-lightbulb-fill me-2"></i>Descubre tu préstamo óptimo</h5>
                      <p className="text-muted small mb-3">
                        Ingresa tu sueldo líquido mensual. El sistema aplicará la regla bancaria del máx. 30% de carga financiera y un algoritmo de <strong>optimización de capacidad</strong> para buscar la oferta que mejor se adapte a tu bolsillo sin arriesgar tu estabilidad.
                      </p>
                      <div className="input-group shadow-sm" style={{maxWidth: "350px"}}>
                        <span className="input-group-text bg-white border-end-0">$</span>
                        <input type="number" className="form-control border-start-0" placeholder="Ej: 800000" value={rentaInput} onChange={e => setRentaInput(e.target.value)} />
                      </div>
                      
                      {renta && Number(renta) > 0 && !idOfertaOptima && ofertas.length > 0 && (
                        <div className="mt-3 text-danger small fw-semibold">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          Tu ingreso es muy bajo para las cuotas de estas ofertas. Por riesgo financiero, no se recomienda tomar ninguna.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="table-responsive mb-4 shadow-sm rounded">
                    <table className="table table-hover align-middle mb-0 bg-white">
                      <thead className="table-light">
                        <tr>
                          <th>Nombre oferta</th>
                          <th>Monto máximo</th>
                          <th>Rango de cuotas</th>
                          <th>Estado</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {ofertas.map((oferta) => (
                          <tr key={oferta.id} className={idOfertaOptima === oferta.id ? "table-success" : ""}>
                            <td>
                              {oferta.nombre_oferta}
                              {idOfertaOptima === oferta.id && (
                                <span className="badge bg-success ms-2 shadow-sm rounded-pill"><i className="bi bi-star-fill text-warning me-1"></i>Recomendado</span>
                              )}
                            </td>
                          <td>
                            $
                            {Number(
                              oferta.monto_maximo
                            ).toLocaleString("es-CL")}
                          </td>
                          <td>
                            {oferta.min_cuotas} - {oferta.max_cuotas} cuotas
                          </td>
                          <td>
                            <span
                              className={
                                "badge " +
                                (oferta.estado === "activa"
                                  ? "bg-success"
                                  : oferta.estado === "vencida"
                                  ? "bg-secondary"
                                  : "bg-dark")
                              }
                            >
                              {oferta.estado}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSeleccionOferta(oferta)}
                              disabled={oferta.estado !== "activa"}
                            >
                              Ver / Simular
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </>
          )}

          {/* Paso 2: Configurar monto/cuotas */}
          {paso === "config" && seleccionada && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  Configurar oferta: {seleccionada.nombre_oferta}
                </h5>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Monto a solicitar</label>
                    <input
                      type="number"
                      className="form-control"
                      value={montoSolicitado}
                      min={1}
                      max={Number(seleccionada.monto_maximo)}
                      onChange={(e) =>
                        setMontoSolicitado(Number(e.target.value))
                      }
                    />
                    <small className="text-muted">
                      Máximo permitido: $
                      {Number(
                        seleccionada.monto_maximo
                      ).toLocaleString("es-CL")}
                    </small>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Número de cuotas</label>
                    <select
                      className="form-select"
                      value={cuotasSeleccionadas}
                      onChange={(e) =>
                        setCuotasSeleccionadas(Number(e.target.value))
                      }
                    >
                      {Array.from(
                        {
                          length:
                            Number(seleccionada.max_cuotas) -
                            Number(seleccionada.min_cuotas) +
                            1,
                        },
                        (_, i) => Number(seleccionada.min_cuotas) + i
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n} cuotas
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Rango: {seleccionada.min_cuotas} -{" "}
                      {seleccionada.max_cuotas} cuotas
                    </small>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Cuota estimada</label>
                    <p className="form-control-plaintext fw-semibold">
                      {cuotaEstimada > 0
                        ? `$${Math.round(
                            cuotaEstimada
                          ).toLocaleString("es-CL")} aprox.`
                        : "-"}
                    </p>
                    <small className="text-muted">
                      Tasa referencial: {Number(
                        seleccionada.tasa_mensual
                      ).toFixed(2)}
                      % mensual (dato desde backend).
                    </small>
                  </div>
                </div>

                {error && (
                  <p className="text-danger mt-3 mb-0">
                    <strong>Error:</strong> {error}
                  </p>
                )}

                <div className="d-flex justify-content-between mt-4">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setPaso("lista");
                      setSeleccionada(null);
                      setError("");
                      setMensajeSistema("");
                      setPrestamoCreado(null);
                      setSolicitudId(null);
                    }}
                  >
                    ← Volver a ofertas
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={handleAceptarOferta}
                    disabled={cargandoAceptar}
                  >
                    {cargandoAceptar ? "Validando oferta..." : "Aceptar oferta"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación del sistema + Clave Única */}
          {paso === "clave" && seleccionada && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  Confirmación mediante Clave Única
                </h5>

                {mensajeSistema && (
                  <p className="text-success">{mensajeSistema}</p>
                )}

                <p className="text-muted">
                  Para continuar con la contratación del préstamo, el sistema
                  requiere tu autenticación mediante Clave Única.
                </p>

                <div className="mb-3">
                  <label className="form-label">Clave Única (demo)</label>
                  <input
                    type="password"
                    className="form-control"
                    value={claveUnica}
                    onChange={(e) => setClaveUnica(e.target.value)}
                    placeholder="Ingresa tu Clave Única"
                  />
                  <small className="text-muted">
                    En un entorno real, aquí se redirigiría al flujo oficial de
                    Clave Única del Estado.
                  </small>
                </div>

                {error && (
                  <p className="text-danger mt-2 mb-0">
                    <strong>Error:</strong> {error}
                  </p>
                )}

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setPaso("config");
                      setError("");
                      setMensajeSistema("");
                    }}
                  >
                    ← Volver a configuración
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={handleConfirmarClave}
                    disabled={cargandoClave}
                  >
                    {cargandoClave
                      ? "Confirmando..."
                      : "Confirmar con Clave Única"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Mensaje final */}
          {paso === "final" && seleccionada && (
            <div className="alert alert-success mt-4">
              <h5 className="alert-heading mb-2">
                Préstamo confirmado correctamente
              </h5>
              <p className="mb-1">
                Oferta: <strong>{seleccionada.nombre_oferta}</strong>
              </p>
              <p className="mb-1">
                Monto solicitado:{" "}
                <strong>
                  $
                  {Number(montoSolicitado).toLocaleString("es-CL")}
                </strong>
              </p>
              <p className="mb-1">
                Cuotas: <strong>{cuotasSeleccionadas}</strong>
              </p>
              {prestamoCreado && (
                <>
                  <p className="mb-1">
                    ID préstamo creado: <strong>{prestamoCreado.id}</strong>
                  </p>
                  <p className="mb-0">
                    Fecha inicio:{" "}
                    {prestamoCreado.fecha_inicio
                      ? new Date(
                          prestamoCreado.fecha_inicio
                        ).toLocaleDateString("es-CL")
                      : "-"}
                  </p>
                </>
              )}
              {!prestamoCreado && (
                <p className="mb-0">
                  El sistema ha registrado tu nuevo préstamo en la plataforma.
                </p>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
