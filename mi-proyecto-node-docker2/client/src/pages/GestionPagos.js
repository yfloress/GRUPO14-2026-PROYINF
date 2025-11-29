import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Pagos() {
  const { user } = useAuth();

  const [deudas, setDeudas] = useState([]);
  const [metodo, setMetodo] = useState("transbank");

  const [cargandoDeudas, setCargandoDeudas] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);

  // 🔹 Estado para manejo de orden de la tabla
  const [orden, setOrden] = useState({
    campo: "fecha_vencimiento", // default: ordenar por fecha
    direccion: "asc", // 'asc' o 'desc'
  });

  // 🔹 Cargar lista de deudas del RUT logueado
  useEffect(() => {
    if (!user?.rut) return;

    setCargandoDeudas(true);

    fetch(`http://localhost:3000/api/pagos/deudas?rut=${user.rut}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar deudas");
        }
        return res.json();
      })
      .then((data) => setDeudas(data))
      .catch((err) => {
        console.error(err);
        alert("❌ Error al cargar la lista de deudas");
      })
      .finally(() => setCargandoDeudas(false));
  }, [user]);

  // 🔹 Cambiar orden de la tabla al hacer click en el encabezado
  const cambiarOrden = (campo) => {
    setOrden((prev) => {
      if (prev.campo === campo) {
        // Mismo campo → alternar asc/desc
        return {
          campo,
          direccion: prev.direccion === "asc" ? "desc" : "asc",
        };
      }
      // Campo nuevo → partir en asc
      return { campo, direccion: "asc" };
    });
  };

  // 🔹 Flechita visual de orden
  const flechaDeOrden = (campo) => {
    if (orden.campo !== campo) return "";
    return orden.direccion === "asc" ? " ↑" : " ↓";
  };

  // 🔹 Deudas ordenadas según el estado "orden"
  const deudasOrdenadas = [...deudas].sort((a, b) => {
    let aVal;
    let bVal;

    switch (orden.campo) {
      case "id_prestamo":
        aVal = Number(a.id_prestamo);
        bVal = Number(b.id_prestamo);
        break;
      case "numero_cuota":
        aVal = Number(a.numero_cuota);
        bVal = Number(b.numero_cuota);
        break;
      case "monto_cuota":
        aVal = Number(a.monto_cuota);
        bVal = Number(b.monto_cuota);
        break;
      case "fecha_vencimiento":
        aVal = new Date(a.fecha_vencimiento).getTime();
        bVal = new Date(b.fecha_vencimiento).getTime();
        break;
      default:
        aVal = 0;
        bVal = 0;
    }

    if (aVal < bVal) return orden.direccion === "asc" ? -1 : 1;
    if (aVal > bVal) return orden.direccion === "asc" ? 1 : -1;
    return 0;
  });

  // 🔹 Manejo del pago según método
  const handlePago = async (cuota) => {
    setCargandoPago(true);

    try {
      // 🟦 CASO 1: PAGO CON TRANSBANK (WEBPAY)
      if (metodo === "transbank") {
        const response = await fetch("http://localhost:3000/api/pagos/iniciar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_prestamo: cuota.id_prestamo,
            id_cuota: cuota.id_cuota,
            monto: cuota.monto_cuota,
            metodo_pago: metodo,
          }),
        });

        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }

        const data = await response.json();

        if (data.url_transbank) {
          // Redirigir al flujo real/simulado de Transbank
          window.location.href = data.url_transbank;
        } else {
          alert("✅ Pago registrado localmente (modo demo)");

          // Opcional: si quieres que también desaparezca en modo demo:
          // setDeudas((prev) =>
          //   prev.filter((d) => d.id_cuota !== cuota.id_cuota)
          // );
        }

        return; // 👈 Importante: no seguir a la parte de transferencia
      }

      // 🟩 CASO 2: PAGO CON TRANSFERENCIA
      const responseTransfer = await fetch(
        `http://localhost:3000/api/pagos/cuota/${cuota.id_cuota}/pagar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!responseTransfer.ok) {
        throw new Error("Error al marcar cuota como pagada");
      }

      const dataTransfer = await responseTransfer.json();

      if (!dataTransfer.ok) {
        throw new Error(dataTransfer.error || "No se pudo registrar el pago");
      }

      // Actualizar lista en el frontend: sacar la cuota
      setDeudas((prevDeudas) =>
        prevDeudas.filter((d) => d.id_cuota !== cuota.id_cuota)
      );

      alert("✅ Pago por transferencia registrado. La cuota fue marcada como pagada.");
    } catch (error) {
      console.error(error);
      alert("❌ Error al procesar el pago");
    } finally {
      setCargandoPago(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>💰 Gestión de Pagos</h1>
      <p>Selecciona el método de pago y paga tus cuotas pendientes.</p>

      {/* Selector de método de pago */}
      <div style={{ marginTop: "20px" }}>
        <label>Método de pago:</label>
        <select
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
          style={{ padding: "8px", marginLeft: "10px" }}
        >
          <option value="transbank">Transbank (Webpay)</option>
          <option value="transferencia">Transferencia Bancaria</option>
        </select>
      </div>

      {/* Tabla de deudas pendientes */}
      <div style={{ marginTop: "40px" }}>
        {!user?.rut ? (
          <p>🔒 Debes iniciar sesión para ver tus deudas.</p>
        ) : cargandoDeudas ? (
          <p>⏳ Cargando deudas...</p>
        ) : deudasOrdenadas.length === 0 ? (
          <p>🎉 ¡No tienes deudas pendientes!</p>
        ) : (
          <table
            style={{
              margin: "0 auto",
              borderCollapse: "collapse",
              width: "85%",
              border: "1px solid #ccc",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white" }}>
                <th
                  style={{ padding: "10px", cursor: "pointer" }}
                  onClick={() => cambiarOrden("id_prestamo")}
                >
                  # Préstamo{flechaDeOrden("id_prestamo")}
                </th>
                <th
                  style={{ padding: "10px", cursor: "pointer" }}
                  onClick={() => cambiarOrden("numero_cuota")}
                >
                  # Cuota{flechaDeOrden("numero_cuota")}
                </th>
                <th
                  style={{ padding: "10px", cursor: "pointer" }}
                  onClick={() => cambiarOrden("monto_cuota")}
                >
                  Monto{flechaDeOrden("monto_cuota")}
                </th>
                <th
                  style={{ padding: "10px", cursor: "pointer" }}
                  onClick={() => cambiarOrden("fecha_vencimiento")}
                >
                  Vencimiento{flechaDeOrden("fecha_vencimiento")}
                </th>
                <th style={{ padding: "10px" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {deudasOrdenadas.map((cuota) => (
                <tr key={cuota.id_cuota}>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    {cuota.id_prestamo}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    {cuota.numero_cuota}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    ${cuota.monto_cuota.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    {new Date(cuota.fecha_vencimiento).toLocaleDateString("es-CL")}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    <button
                      onClick={() => handlePago(cuota)}
                      disabled={cargandoPago}
                      style={{
                        padding: "6px 12px",
                        fontSize: "14px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: cargandoPago ? "not-allowed" : "pointer",
                      }}
                    >
                      {cargandoPago ? "Procesando..." : "💳 Pagar ahora"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
