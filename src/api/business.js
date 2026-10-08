import axios from "axios";
import api from "./axios.js";
import { API_BASE_URL, authHeader } from "./config.js";

export const BUSINESS_ROLE = "ROLE_BUSINESS";

// Business site (APP_MODE=business). In `next dev` everything runs on one server.
export const BUSINESS_URL =
  process.env.NEXT_PUBLIC_BUSINESS_URL ??
  (process.env.NODE_ENV === "development" ? "" : "https://business.gigfine.com");

// Creates the account and a PENDING business in one request, and logs in
// data: { name, email, mobile, password, registrationNo, panNo, businessLocation, ownerName, ownerPhone }
export async function registerBusiness(data) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register-business`, data);
  localStorage.setItem("token", response.data.token);
  return response.data; // { token, user }
}

// Token handed over from the main site (/business/login#token=...)
export async function businessLoginWithToken(token) {
  const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.setItem("token", token);
  return response.data; // user
}

export const isBusiness = (user) => !!user?.roles?.includes(BUSINESS_ROLE);

export const BUSINESS_STATUS_LABEL = {
  PENDING: "Pending",
  APPROVED: "Approved",
};

// The logged-in user's business profile, or null if they haven't applied yet
export async function getMyBusiness(userId) {
  try {
    const response = await api.get(`${API_BASE_URL}/api/v1/businesses/${userId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

// { registrationNo, panNo, businessLocation, ownerName, ownerPhone } — starts PENDING
export async function createBusiness(userId, data) {
  const response = await api.post(`${API_BASE_URL}/api/v1/businesses/${userId}`, data, {
    headers: authHeader(),
  });
  return response.data;
}

// Only allowed while the business is still PENDING
export async function updateBusiness(userId, data) {
  const response = await api.put(`${API_BASE_URL}/api/v1/businesses/${userId}`, data, {
    headers: authHeader(),
  });
  return response.data;
}

// type: "rc" = registration certificate, "pc" = PAN card (jpeg/jpg/png, max 5MB)
export async function uploadBusinessDocument(userId, type, file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(
    `${API_BASE_URL}/api/v1/businesses/${userId}/document/${type}`,
    formData,
    { headers: authHeader() },
  );
  return response.data;
}

// Reports an admin forwarded to the logged-in (approved) business
export async function getBusinessReports(status) {
  const response = await api.get(`${API_BASE_URL}/api/v1/reports/business`, {
    params: status ? { status } : {},
    headers: authHeader(),
  });
  return response.data; // ReportDto[]
}
