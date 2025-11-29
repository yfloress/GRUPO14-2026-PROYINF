// client/src/pages/SolicitudPrestamo.js
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SolicitudPrestamo() {
  const { user } = useAuth(); 
  const [monto, setMonto] = useState(0);
  const [cuotas, setCuotas] = useState(2);
  const [loading, setLoading] = useState(false);

  const [historial, setHistorial] = useState([]);

  const interesFijo = 0.0095;

  const interesTotal = monto * interesFijo;
  const cuotaMensual = cuotas > 0 ? (monto + interesTotal) / cuotas : 0;

  const guardarSimulacion = () => {
    if (monto <= 0 || cuotas <= 0) {
      alert("Debe ingresar valores válidos.");
      return;
    }

    const nuevaSimulacion = {
      id: Date.now(),
      monto,
      cuotas,
      interes: Math.round(interesTotal),
      cuotaMensual: Math.round(cuotaMensual),
    };

    setHistorial((prev) => [...prev, nuevaSimulacion]);
    alert("Simulación guardada en el historial.");
  };


  const handleSolicitud = async () => {
    if (monto <= 0 || cuotas <= 0) {
      alert("Por favor ingresa un monto y número de cuotas válidos.");
      return;
    }

    if (!user?.rut) {
      alert("Debes iniciar sesión para solicitar un préstamo.");
      return;
    }

    setLoading(true);

    try {
      const data = {
        rut_cliente: user.rut,
        monto,
        cuotas,
        interesTotal,
        cuotaMensual,
      };

      const response = await fetch("http://localhost:3000/api/prestamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al registrar el préstamo");
      }

      const { prestamo, cuotas: cuotasGeneradas } = result.data || {};


      let correoSeg = null;
      try {
        const userRes = await fetch(
          `http://localhost:3000/api/usuarios/${encodeURIComponent(user.rut)}`
        );
        if (userRes.ok) {
          const userData = await userRes.json();
          correoSeg = userData?.user?.correo_seguridad || null;
        }
      } catch (e) {
        console.error("Error consultando correo de seguridad:", e);
      }


      let mensaje =
        "✅ Préstamo registrado correctamente.\n\n" +
        `RUT cliente: ${prestamo?.rut_cliente}\n` +
        `Monto: $${Math.round(prestamo?.monto || monto).toLocaleString("es-CL")}\n` +
        `Cuotas generadas: ${cuotasGeneradas?.length || cuotas}\n` +
        `Primera vence: ${
          cuotasGeneradas?.[0]?.fecha_vencimiento || "--"
        }`;

      if (correoSeg) {
        mensaje += `\n\n📧 El comprobante ha sido enviado al correo de seguridad: ${correoSeg}`;
      }

      alert(mensaje);

      console.log("Resultado completo:", result);
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Ocurrió un error al registrar el préstamo. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>Solicitud de Préstamo</h1>
      <p>Completa los datos para generar tu solicitud y ver el plan de pagos.</p>

      {/* Monto */}
      <div style={{ marginTop: "30px" }}>
        <label style={{ display: "block", marginBottom: "10px" }}>
          Monto a solicitar:
        </label>
        <input
          type="number"
          min="0"
          step="1"
          value={monto}
          onChange={(e) => setMonto(Number(e.target.value))}
          style={{ padding: "8px", width: "200px", fontSize: "16px" }}
        />
      </div>

      {/* Cuotas */}
      <div style={{ marginTop: "30px" }}>
        <label style={{ display: "block", marginBottom: "10px" }}>
          Número de cuotas:
        </label>

        <select
          value={cuotas}
          onChange={(e) => setCuotas(Number(e.target.value))}
          style={{ padding: "8px", fontSize: "16px", marginBottom: "10px" }}
        >
          {Array.from({ length: 23 }, (_, i) => i + 2).map((n) => (
            <option key={n} value={n}>
              {n} cuotas
            </option>
          ))}
        </select>

        <input
          type="range"
          min="2"
          max="24"
          value={cuotas}
          onChange={(e) => setCuotas(Number(e.target.value))}
          style={{ width: "300px", display: "block", margin: "10px auto" }}
        />
      </div>

      {/* Resumen */}
      <div
        style={{
          marginTop: "40px",
          borderTop: "1px solid #ccc",
          paddingTop: "20px",
        }}
      >
        <h3>Resumen de la Solicitud</h3>
        <p>Monto solicitado: ${Math.round(monto).toLocaleString("es-CL")}</p>
        <p>N° de cuotas: {cuotas}</p>
        <p>Interés a pagar: ${Math.round(interesTotal).toLocaleString("es-CL")}</p>
        <p>Cuota mensual: ${Math.round(cuotaMensual).toLocaleString("es-CL")}</p>

        {/* Botón: Guardar simulación */}
        <button
          onClick={guardarSimulacion}
          style={{
            marginTop: "20px",
            padding: "8px 20px",
            fontSize: "16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Guardar simulación
        </button>
      </div>

      {/* Botón solicitar */}
      <button
        onClick={handleSolicitud}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          fontSize: "18px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Enviando..." : "Solicitar"}
      </button>

      {historial.length > 0 && (
        <div style={{ marginTop: "50px" }}>
          <h2>Historial de Simulaciones</h2>

          <table
            style={{
              width: "80%",
              margin: "20px auto",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Monto
                </th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Cuotas
                </th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Interés
                </th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Cuota Mensual
                </th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {historial.map((sim) => (
                <tr key={sim.id}>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    ${sim.monto.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    {sim.cuotas}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    ${sim.interes.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    ${sim.cuotaMensual.toLocaleString("es-CL")}
                  </td>

                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    <button
                      onClick={() => {
                        setMonto(sim.monto);
                        setCuotas(sim.cuotas);
                        alert("Simulación cargada en el formulario.");
                      }}
                      style={{
                        background: "#17a2b8",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        marginRight: "5px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Usar esta simulación
                    </button>

                    <button
                      onClick={() =>
                        setHistorial((hist) =>
                          hist.filter((h) => h.id !== sim.id)
                        )
                      }
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
