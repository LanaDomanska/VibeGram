import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});

export const API_ORIGIN = (() => {
  try {
    return new URL(BASE_URL).origin; 
  } catch {
    return BASE_URL.replace(/\/api\/?$/, "");
  }
})();


export function fileUrl(raw, { placeholder = "", origin } = {}) {
  if (!raw) return placeholder;
  const s = String(raw);
  if (/^https?:\/\//i.test(s) || s.startsWith("data:")) return s;

  const path = s.replace(/^\/?public/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;

  const ORIGIN = origin || API_ORIGIN; 
  
  return `${ORIGIN}${normalized}`;
}

export const followUser = (userId) => api.post(`/users/${userId}/follow`);
export const unfollowUser = (userId) => api.delete(`/users/${userId}/follow`);
export const fetchFollowers = (userId) => api.get(`/users/${userId}/followers`);
export const fetchFollowing = (userId) => api.get(`/users/${userId}/following`);
export const checkFollowing = (userId) => api.get(`/users/${userId}/follow/check`);

export default api;
