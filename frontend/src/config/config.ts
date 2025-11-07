const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

console.log("🔧 API Configuration:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  mode: import.meta.env.MODE,
});

export const config = {
  apiUrl: API_BASE_URL,
  adminToken: import.meta.env.VITE_ADMIN_TOKEN || "secret-admin-token-123",
};
