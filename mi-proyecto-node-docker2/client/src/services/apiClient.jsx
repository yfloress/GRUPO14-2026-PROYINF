import axios from "axios";

// ⚠️ Importante: el frontend en Docker debe usar el nombre del servicio backend
const api = axios.create({
  baseURL: "http://backend:3000/api",
});

export default api;
