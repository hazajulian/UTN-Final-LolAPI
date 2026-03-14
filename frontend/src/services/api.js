// Configuración y funciones HTTP de la API REST de LoL.
// Incluye manejo de token y endpoints principales para el frontend.

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3010";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

// Interceptor: agrega token de autorización si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- ENDPOINTS DE AUTENTICACIÓN Y UTILIDADES ---

export async function login({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function register({ username, email, password }) {
  const { data } = await api.post("/auth/register", { username, email, password });
  return data;
}

export function forgotPassword({ email }) {
  return api.post("/auth/forgot-password", { email });
}

export function resetPassword({ token, newPassword, confirmPassword }) {
  return api.post("/auth/reset-password", { token, newPassword, confirmPassword });
}

export function sendContact({ subject, message }) {
  return api.post("/contact", { subject, message });
}

// --- ENDPOINTS DE CAMPEONES ---

export async function getChampions({ page = 1, limit = 50, search, name, region, role } = {}) {
  const params = { page, limit };

  if (search) params.search = search;
  if (name) params.name = name;

  if (region) params.region = region;
  if (role) params.role = role;

  const { data } = await api.get("/champions", { params });
  return data;
}

export async function getChampionById(id) {
  const { data } = await api.get(`/champions/${id}`);
  return data;
}

// --- ENDPOINTS DE ITEMS SHOP ---

// LISTA PAGINADA + FILTROS (según schemas reales del back)
export async function getItems({
  lang = "en",
  page = 1,
  limit = 20,

  search,
  tags, // csv "Damage,Health"
  roles, // csv "mage,tank"

  tier, // "basic" | "epic" | "legendary"
  section, // "starter" | "boots" | "consumable" | "trinket" | "basic" | "epic" | "legendary"

  minGold,
  maxGold,

  sort, // "name" | "gold_asc" | "gold_desc"
  includeHidden,
  shopOnly,
} = {}) {
  const params = { lang, page, limit };

  if (search) params.search = search;

  if (tags) params.tags = tags;
  if (roles) params.roles = roles;

  if (tier) params.tier = tier;
  if (section) params.section = section;

  if (minGold != null) params.minGold = minGold;
  if (maxGold != null) params.maxGold = maxGold;

  if (sort) params.sort = sort;
  if (includeHidden != null) params.includeHidden = includeHidden;
  if (shopOnly != null) params.shopOnly = shopOnly;

  const { data } = await api.get("/items", { params });
  return data;
}

// LISTA COMPLETA LIVIANA (según Swagger/back)
// OJO: tu back NO acepta search/tags acá.
export async function getItemsAll({ lang = "en", includeHidden, shopOnly } = {}) {
  const params = { lang };

  if (includeHidden != null) params.includeHidden = includeHidden;
  if (shopOnly != null) params.shopOnly = shopOnly;

  const { data } = await api.get("/items/all", { params });
  return data;
}

// META FILTROS (tiers/sections/roles)
export async function getItemsFiltersMeta({ lang = "en", includeHidden, shopOnly } = {}) {
  const params = { lang };
  if (includeHidden != null) params.includeHidden = includeHidden;
  if (shopOnly != null) params.shopOnly = shopOnly;

  const { data } = await api.get("/items/meta/filters", { params });
  return data;
}

// DETALLE (para modal)
export async function getItemById(id, { lang = "en" } = {}) {
  const params = { lang };
  const { data } = await api.get(`/items/${id}`, { params });
  return data;
}
