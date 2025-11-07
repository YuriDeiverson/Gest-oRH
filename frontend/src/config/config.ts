const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const config = {
  apiUrl: API_BASE_URL,
  adminToken: import.meta.env.VITE_ADMIN_TOKEN || "secret-admin-token-123",
};
