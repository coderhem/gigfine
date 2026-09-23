// Base URL of the User-Service backend (Spring Boot)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.gigfine.com";

export function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Backend errors look like { message } or { errors: { field: message } }
export function apiErrorMessage(error, fallback = "Something went wrong") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.errors) return Object.values(data.errors).join(", ");
  return fallback;
}
