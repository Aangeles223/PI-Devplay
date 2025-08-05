import axios from "axios";
import { Platform } from "react-native";

// HOST dinámico para emulador y dispositivos:
// Android emulator: 10.0.2.2, iOS simulator: localhost, physical devices: LAN_IP
// Determinar host dinámico: web usa window.location; native usa debuggerHost de Expo
// API FastAPI corre en puerto 8000. Configurar host según plataforma:
// Android emulator: 10.0.2.2, iOS simulator: 127.0.0.1, dispositivos físicos: LAN_IP
const LAN_IP = "10.0.0.11"; // refresca con tu IP LAN si cambia
const HOST =
  Platform.OS === "web"
    ? `http://${window.location.hostname}:8000`
    : Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : Platform.OS === "ios"
    ? "http://127.0.0.1:8000"
    : `http://${LAN_IP}:8000`;
console.log("API Host:", HOST);

const api = axios.create({
  baseURL: HOST, // API root URL
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30 seconds timeout for API requests
});

// Obtener apps (Express) en /apps
// Obtener lista de apps con URL absoluta para evitar fallos de baseURL
export const getApps = () => api.get("/apps").then((response) => response.data);
export const getDescargas = () => api.get("/descargas");
export const postDescarga = (payload) => api.post("/descargas", payload);
// …exporta más endpoints según tus routers…

// Usuarios & Auth endpoints
export const registerUser = (userData) =>
  axios.post(`${HOST}/usuarios`, null, { params: userData });

export const loginUser = (loginData) => axios.post(`${HOST}/token`, loginData);

export const getAllUsuarios = () => api.get(`/usuarios`);
// alias para compatibilidad con screens que usan getAllUsers
export const getAllUsers = getAllUsuarios;

export const getCurrentUser = (token) =>
  axios.get(`${HOST}/usuarios/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateUser = (id, userData, token) =>
  axios.put(`${HOST}/usuarios/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteUser = (id, token) =>
  axios.delete(`${HOST}/usuarios/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Valoraciones endpoints (crear, listar, actualizar y eliminar valoraciones)
export const createValoracion = (params) =>
  api.post("/valoraciones", null, { params });

export const getValoraciones = (token) =>
  api.get("/valoraciones", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateValoracion = (id, params, token) =>
  api.put(`/valoraciones/${id}`, null, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteValoracion = (id, token) =>
  api.delete(`/valoraciones/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Versiones endpoints (crear, listar y gestionar versiones de apps)
export const createVersion = (versionData) =>
  api.post("/versiones", versionData);

export const getVersions = () => api.get("/versiones");

export const getVersionsByApp = (appId) => api.get(`/versiones/app/${appId}`);

export const getVersion = (versionId) => api.get(`/versiones/${versionId}`);

export const updateVersion = (versionId, versionData) =>
  api.put(`/versiones/${versionId}`, versionData);

export const deleteVersion = (versionId) =>
  api.delete(`/versiones/${versionId}`);

// Status endpoints (crear, listar, obtener por ID, actualizar y eliminar)
export const createStatus = (nombre) =>
  axios.post(`${HOST}/status`, null, { params: { nombre } });

export const getAllStatus = () => axios.get(`${HOST}/status`);

export const getStatusById = (id) => axios.get(`${HOST}/status/${id}`);

export const updateStatus = (id, nombre) =>
  axios.put(`${HOST}/status/${id}`, null, { params: { nombre } });

export const deleteStatus = (id) => axios.delete(`${HOST}/status/${id}`);
// Paises and Generos endpoints
export const getAllPaises = () => api.get(`/paises`);
export const getAllGeneros = () => api.get(`/generos`);

// Secciones endpoints (listar, obtener, crear, actualizar y eliminar)
export const getAllSecciones = () => axios.get(`${HOST}/secciones`);

export const getSeccionById = (id) => axios.get(`${HOST}/secciones/${id}`);

export const createSeccion = (data) =>
  axios.post(`${HOST}/secciones`, null, { params: data });

export const updateSeccion = (id, data) =>
  axios.put(`${HOST}/secciones/${id}`, null, { params: data });

export const deleteSeccion = (id) => axios.delete(`${HOST}/secciones/${id}`);

// Notificaciones endpoints (crear, listar, actualizar y eliminar notificaciones)
export const createNotificacion = (data, token) =>
  api.post("/notificaciones", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getNotificaciones = (token) =>
  api.get("/notificaciones", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateNotificacion = (id, data, token) =>
  api.put(`/notificaciones/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteNotificacion = (id, token) =>
  api.delete(`/notificaciones/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
// Obtener notificaciones por usuario (legacy sin auth)
export const getNotificacionesByUser = (usuarioId) =>
  axios.get(`${HOST}/notificaciones`, { params: { usuario_id: usuarioId } });

// Mis Apps endpoints (agregar, listar, actualizar y eliminar apps del usuario)
export const createMisApp = (data, token) =>
  api.post("/mis-apps", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMisApps = (token) =>
  api.get("/mis-apps", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateMisApp = (id, data, token) =>
  api.put(`/mis-apps/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteMisApp = (id, token) =>
  api.delete(`/mis-apps/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Estadísticas endpoints (apps más descargadas, mejor valoradas, estadísticas por app, desarrolladores top y resumen general)
export const getAppsMasDescargadas = (limite = 10) =>
  api.get("/apps-mas-descargadas", { params: { limite } });

export const getAppsMejorValoradas = (limite = 10) =>
  api.get("/apps-mejor-valoradas", { params: { limite } });

export const getEstadisticasApp = (appId) =>
  api.get(`/estadisticas-app/${appId}`);

export const getDesarrolladoresTop = (limite = 10) =>
  api.get("/desarrolladores-top", { params: { limite } });

export const getResumenGeneral = () => api.get("/resumen-general");

// Descubrimiento endpoints (apps destacadas, nuevas, en tendencia, gratis top, por sección y recomendaciones)
export const getAppsDestacadas = (limite = 10) =>
  api.get("/apps-destacadas", { params: { limite } });

export const getAppsNuevas = (limite = 10) =>
  api.get("/apps-nuevas", { params: { limite } });

export const getAppsTendencia = (limite = 10) =>
  api.get("/apps-tendencia", { params: { limite } });

export const getAppsGratisTop = (limite = 10) =>
  api.get("/apps-gratis-top", { params: { limite } });

export const getAppsPorSeccion = (idSeccion, limite = 20) =>
  api.get(`/apps-por-seccion/${idSeccion}`, { params: { limite } });

export const getRecomendaciones = (usuarioId, limite = 10) =>
  api.get(`/recomendaciones/${usuarioId}`, { params: { limite } });

// Descargas endpoints (listar, crear, actualizar y eliminar descargas con autenticación)
export const getDescargasAuth = (token) =>
  api.get("/descargas", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createDescargaAuth = (params, token) =>
  api.post("/descargas", null, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateDescarga = (id, params, token) =>
  api.put(`/descargas/${id}`, null, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteDescargaAuth = (id, token) =>
  api.delete(`/descargas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Desarrolladores endpoints (listar, obtener, crear, actualizar y eliminar)
export const getAllDesarrolladores = () => axios.get(`${HOST}/desarrolladores`);

export const getDesarrolladorById = (id) =>
  axios.get(`${HOST}/desarrolladores/${id}`);

export const createDesarrollador = (data) =>
  axios.post(`${HOST}/desarrolladores`, null, { params: data });

export const updateDesarrollador = (id, data) =>
  axios.put(`${HOST}/desarrolladores/${id}`, null, { params: data });

export const deleteDesarrollador = (id) =>
  axios.delete(`${HOST}/desarrolladores/${id}`);

// Categorías endpoints (listar, obtener, crear, actualizar y eliminar categorías)
export const getAllCategorias = () => api.get(`/categorias`);
// API client for FastAPI routes under /api
export const getAppsFastAPI = () => api.get("/app");
export const getCategoriasFastAPI = () => api.get("/categorias");

export const getCategoriaById = (id) => axios.get(`${HOST}/categorias/${id}`);

export const createCategoria = (nombre) =>
  axios.post(`${HOST}/categorias`, null, { params: { nombre } });

export const updateCategoria = (id, nombre) =>
  axios.put(`${HOST}/categorias/${id}`, null, { params: { nombre } });

export const deleteCategoria = (id) => axios.delete(`${HOST}/categorias/${id}`);

// Búsqueda endpoints (búsqueda simple y búsqueda completa)
export const searchApps = (q, categoria_id = null, limite = 10) =>
  api.get("/buscar", { params: { q, categoria_id, limite } });

export const searchAppsComplete = (
  q,
  categoria_id = null,
  desarrollador_id = null,
  gratis = null,
  rango_edad = null,
  limite = 20
) =>
  api.get("/buscar-completa", {
    params: { q, categoria_id, desarrollador_id, gratis, rango_edad, limite },
  });

// Apps-Desarrollador endpoints (asociar y consultar relaciones app–desarrollador)
export const createAppsDesarrollador = (data) =>
  axios.post(`${HOST}/apps-desarrollador`, null, { params: data });

export const getAllAppsDesarrollador = () =>
  axios.get(`${HOST}/apps-desarrollador`);

export const getAppsDeDesarrollador = (desarrolladorId) =>
  axios.get(`${HOST}/apps-desarrollador/desarrollador/${desarrolladorId}`);

export const getDesarrolladoresDeApp = (appId) =>
  axios.get(`${HOST}/apps-desarrollador/app/${appId}`);

export const updateAppsDesarrollador = (id, data) =>
  axios.put(`${HOST}/apps-desarrollador/${id}`, null, { params: data });

export const deleteAppsDesarrollador = (id) =>
  axios.delete(`${HOST}/apps-desarrollador/${id}`);

// App-Secciones endpoints (asociar y consultar relaciones app–seccion)
export const createAppSeccion = (data) =>
  api.post("/app-secciones", null, { params: data });

export const getAllAppSecciones = () => api.get("/app-secciones");

export const getSeccionesDeApp = (appId) =>
  api.get(`/app-secciones/app/${appId}`);

export const getAppsDeSeccion = (seccionId) =>
  api.get(`/app-secciones/seccion/${seccionId}`);

export const getAppSeccionById = (id) => api.get(`/app-secciones/${id}`);

export const updateAppSeccion = (id, data) =>
  api.put(`/app-secciones/${id}`, null, { params: data });

export const deleteAppSeccion = (id) => api.delete(`/app-secciones/${id}`);

// Aplicación endpoints (crear, listar, actualizar y eliminar apps)
export const createApp = (data) =>
  axios.post(`${HOST}/apps`, null, { params: data });

export const getAllAppsCustom = () => axios.get(`${HOST}/apps`);

export const updateApp = (id, data) =>
  axios.put(`${HOST}/apps/${id}`, null, { params: data });

export const deleteApp = (id) => axios.delete(`${HOST}/apps/${id}`);

// App-Categorias endpoints (asociar app y categoría, listar y gestionar relaciones)
export const createAppCategoria = (data) =>
  api.post("/app-categorias", null, { params: data });

export const getAllAppCategorias = () => api.get("/app-categorias");

export const getCategoriasDeApp = (appId) =>
  api.get(`/app-categorias/app/${appId}`);

export const getAppsDeCategoria = (categoriaId) =>
  api.get(`/app-categorias/categoria/${categoriaId}`);

export const getAppCategoriaById = (id) => api.get(`/app-categorias/${id}`);

export const updateAppCategoria = (id, data) =>
  api.put(`/app-categorias/${id}`, null, { params: data });

export const deleteAppCategoria = (id) => api.delete(`/app-categorias/${id}`);
