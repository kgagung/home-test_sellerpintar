import axios from "axios";

// Buat instance axios dengan baseURL https://test-fe.mysellerpintar.com/api
const api = axios.create({
  baseURL: "https://test-fe.mysellerpintar.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// auto set token dari localStorage jika ada
const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default api;

// Menambahkan interceptor untuk menangani token
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
