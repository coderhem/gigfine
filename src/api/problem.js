// import axios from "axios";
import api from "./axios.js";
import { API_BASE_URL, authHeader } from "./config.js";

export const REPORT_STATUS_LABEL = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export async function addProblem({ service, company, problem }) {
  const response = await api.post(
    `${API_BASE_URL}/api/v1/reports`,
    { service, company, problem },
    { headers: authHeader() },
  );
  return response.data;
}

// Reports submitted by one user, optionally filtered by status
export async function getReportsByUser(userId, status) {
  const response = await api.get(`${API_BASE_URL}/api/v1/reports`, {
    params: { userId, ...(status ? { status } : {}) },
    headers: authHeader(),
  });
  return response.data; // ReportDto[]
}

export async function getAllProblem() {
  const token = localStorage.getItem("token");
  const response = await api.get(
    "https://gigfine-api.vercel.app/api/problem/all",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function getProblem() {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "https://gigfine-api.vercel.app/api/problem",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}
export async function deleteProblem(id) {
  const token = localStorage.getItem("token");

  const response = await api.delete(
    `https://gigfine-api.vercel.app/api/problem/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function getProblemById(id) {
  const token = localStorage.getItem("token");

  const response = await api.get(
    `https://gigfine-api.vercel.app/api/problem/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function updateProblem(id, data) {
  const token = localStorage.getItem("token");

  const response = await api.put(
    `https://gigfine-api.vercel.app/api/problem/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}
