// api.js - Conectar al servidor Express en puerto 3001
import axios from "axios";
import { Platform } from "react-native";

// Definir host dinámico para emuladores y web
const LAN_IP = "10.0.0.11";
const HOST =
  Platform.OS === "web"
    ? `http://${window.location.hostname}:3001`
    : Platform.OS === "android"
    ? "http://10.0.2.2:3001"
    : Platform.OS === "ios"
    ? `http://${LAN_IP}:3001`
    : `http://${LAN_IP}:3001`;

const api = axios.create({
  baseURL: HOST,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Autenticación
export const registerUser = (userData) => api.post("/register", userData);
export const loginUser = (credentials) => api.post("/login", credentials);
export const getCurrentUser = (token) =>
  api.get("/usuario/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

// Usuario
export const getUsuarioByEmail = (email) =>
  api.get(`/usuario/${encodeURIComponent(email)}`);
export const updateUsuario = (id, data) => api.put(`/usuario/${id}`, data);
// Listar todos los usuarios (para ProfileScreen)
export const getAllUsers = () => api.get("/usuarios");

// Alias en inglés para actualizar perfil
export const updateUser = updateUsuario;

// Países y géneros
export const getAllPaises = () => api.get("/paises");
export const getAllGeneros = () => api.get("/generos");

// Apps
export const getApps = () => api.get("/apps");

// Descargas
export const getDescargas = () => api.get("/descargas");
export const postDescarga = (payload) => api.post("/descargas", payload);
export const deleteDescarga = (id) => api.delete(`/descargas/${id}`);

// Secciones
export const getSecciones = () => api.get("/secciones");
export const getSeccionApps = (id) => api.get(`/secciones/${id}/apps`);

// Aliases for SearchScreen
export const getAllSecciones = getSecciones;
export const getAppsDeSeccion = getSeccionApps;

// Categorías
export const getCategorias = () => api.get("/categorias");
// Alias para compatibilidad: getAllCategorias
export const getAllCategorias = getCategorias;

// Reseñas
export const getAppReviews = (appId) => api.get(`/apps/${appId}/reviews`);
export const postReview = (appId, payload) =>
  api.post(`/apps/${appId}/reviews`, payload);

// Notificaciones
export const getNotificaciones = (usuarioId) =>
  api.get("/notificaciones", { params: { usuario_id: usuarioId } });
// Mis Apps
export const getMisApps = (usuarioId) => api.get(`/mis_apps/${usuarioId}`);
// Registrar app adquirida en la tabla mis_apps
export const postMisApp = (payload) => api.post("/mis_apps", payload);
// Desinstalar app
export const desinstalarApp = (usuarioId, appId) =>
  api.delete(`/desinstalar/${usuarioId}/${appId}`);
// Alias for NotificationsScreen
export const getNotificacionesByUser = getNotificaciones;
