import axios from "axios";
import { API_BASE_URL } from "./config.js";

export const ADMIN_ROLE = "ROLE_ADMIN";

export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.gigfine.com";

export const isAdmin = (user) => !!user?.roles?.includes(ADMIN_ROLE);

// Axios instance for admin panel calls — uses adminToken, not the user token
const adminApi = axios.create({ baseURL: API_BASE_URL });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  },
);

// ---------- Auth ----------

export const adminLogin = async ({ phone, password }) => {
  const res = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
    username: phone,
    password,
  });
  if (!isAdmin(res.data.user)) {
    throw new Error("This account does not have admin access.");
  }
  localStorage.setItem("adminToken", res.data.token);
  return res.data;
};

// Validates a token handed over from the user site and stores it if it belongs to an admin
export const adminLoginWithToken = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!isAdmin(res.data)) {
    throw new Error("This account does not have admin access.");
  }
  localStorage.setItem("adminToken", token);
  return res.data;
};

// ---------- Users / Riders ----------

export const getAllUsers = async () => (await adminApi.get("/api/users")).data;

export const getAllRiders = async () =>
  (await adminApi.get("/api/riders")).data;

export const deleteUser = async (id) =>
  (await adminApi.delete(`/api/users/${id}`)).data;

// ---------- Reports ----------

// filters: { userId, status, from, to } — from/to as "YYYY-MM-DD"
export const getReports = async ({ userId, status, from, to } = {}) => {
  const params = {};
  if (userId) params.userId = userId;
  if (status) params.status = status;
  if (from) params.from = `${from}T00:00:00`;
  if (to) params.to = `${to}T23:59:59`;
  return (await adminApi.get("/api/reports", { params })).data;
};

export const updateReportStatus = async (reportId, status) =>
  (await adminApi.put(`/api/reports/${reportId}/status`, { status })).data;

// Mirrors ReportStatus.allowedNext() in the backend
export const NEXT_STATUSES = {
  PENDING: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["RESOLVED", "REJECTED"],
  RESOLVED: [],
  REJECTED: [],
};
