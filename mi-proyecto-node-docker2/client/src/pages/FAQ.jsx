import React from "react";

export default function FAQ() {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: "#0066ff" }}>
        Preguntas Frecuentes
      </h2>

      <div className="mb-4">
        <h5>1. ¿Qué es el gestor de solicitudes?</h5>
        <p>
          Es una sección donde puedes revisar todas tus solicitudes de préstamo
          y ver si se encuentran pendientes (con cuotas por pagar) o
          finalizadas (todas las cuotas pagadas).
        </p>
      </div>

      <div className="mb-4">
        <h5>2. ¿Qué significa que una solicitud esté “Pendiente”?</h5>
        <p>
          Significa que el préstamo está vigente y aún quedan cuotas por pagar.
          A medida que pagas las cuotas, el estado eventualmente cambiará a
          “Finalizado”.
        </p>
      </div>

      <div className="mb-4">
        <h5>3. ¿Cómo se decide si mi préstamo es aprobado?</h5>
        <p>
          El sistema utiliza un motor de scoring que evalúa tu información
          financiera (ingresos, deudas, estabilidad, etc.) y calcula un puntaje
          de riesgo. Según este puntaje, se aprueba o rechaza el préstamo, y se
          define el monto máximo disponible.
        </p>
      </div>

      <div className="mb-4">
        <h5>4. ¿Puedo simular mi puntaje de riesgo antes de solicitar?</h5>
        <p>
          Sí. Desde el menú principal puedes acceder a la opción{" "}
          <strong>Evaluación de Riesgo</strong> para simular tu puntaje y ver
          cómo podría afectar tu solicitud.
        </p>
      </div>

      <div className="mb-4">
        <h5>5. ¿Mis datos están seguros?</h5>
        <p>
          El sistema está diseñado para manejar tus datos de manera segura y
          solo se utilizan para la evaluación y gestión de tus préstamos.
        </p>
      </div>
    </div>
  );
}
