// apis/floid.js
//Documentación: https://docs.floid.app/ 

import axios from "axios";

const BASE_URL = process.env.FLOID_API_URL;
const API_KEY = process.env.FLOID_API_KEY;

/**
 * 1️ Crear sesión de conexión bancaria (simulación)
 */
export const crearSesionFloid = async (rut, email) => {
  const headers = { "x-api-key": API_KEY, "Content-Type": "application/json" };

  const body = {
    user_rut: rut,
    user_email: email,
    redirect_url: "http://localhost:3000/api/floid/callback",
  };

  const { data } = await axios.post(`${BASE_URL}/v1/start`, body, { headers });
  return data;
};

/**
 * 2️ Consultar datos financieros (una vez autenticado)
 */
export const obtenerDatosFinancieros = async (session_id) => {
  if (!session_id || typeof session_id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(session_id.trim())) {
    throw new Error("session_id inválido");
  }
  const sanitizedId = encodeURIComponent(session_id.trim());
  const headers = { "x-api-key": API_KEY };
  const { data } = await axios.get(`${BASE_URL}/v1/sessions/${sanitizedId}/accounts`, { headers });
  return data;
};

