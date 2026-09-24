// import axios from "axios";
import api from "./axios.js";
import { API_BASE_URL, authHeader } from "./config.js";

export const REPORT_STATUS_LABEL = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

// Reporters can edit a report for this long (mirrors EDIT_WINDOW in ReportServiceImpl)
export const REPORT_EDIT_HOURS = 2;

// Must match VOICE_TYPES in the backend ReportController
export const VOICE_EXTENSIONS = ["mp3", "m4a", "aac", "wav", "ogg", "webm", "amr", "3gp"];
export const VOICE_MAX_MB = 10;
export const IMAGE_EXTENSIONS = ["jpeg", "jpg", "png"];
export const IMAGE_MAX_MB = 5;

// riderName / vehicleNumber are kept only when the reporter is in passenger mode.
// problem is optional when a voice note is uploaded afterwards.
export async function addProblem({ service, company, problem, riderName, vehicleNumber }) {
  const response = await api.post(
    `${API_BASE_URL}/api/v1/reports`,
    { service, company, problem, riderName, vehicleNumber },
    { headers: authHeader() },
  );
  return response.data; // ReportDto
}

export async function getReportById(reportId) {
  const response = await api.get(`${API_BASE_URL}/api/v1/reports/${reportId}`, {
    headers: authHeader(),
  });
  return response.data; // ReportDto
}

// Allowed only while report.editable is true (PENDING and < 2h old)
export async function updateReport(reportId, { service, company, problem, riderName, vehicleNumber }) {
  const response = await api.put(
    `${API_BASE_URL}/api/v1/reports/${reportId}`,
    { service, company, problem, riderName, vehicleNumber },
    { headers: authHeader() },
  );
  return response.data; // ReportDto
}

async function uploadReportFile(reportId, kind, file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(
    `${API_BASE_URL}/api/v1/reports/${reportId}/${kind}`,
    formData,
    { headers: authHeader() },
  );
  return response.data; // ReportDto
}

export const uploadReportImage = (reportId, file) => uploadReportFile(reportId, "image", file);

export const uploadReportVoice = (reportId, file) => uploadReportFile(reportId, "voice", file);

// kind: "image" | "voice". The endpoint needs the auth header, so it can't be a plain src.
// Returns an object URL — revoke it with URL.revokeObjectURL when done.
export async function getReportFileUrl(kind, fileName) {
  const response = await api.get(
    `${API_BASE_URL}/api/v1/reports/${kind}/${encodeURIComponent(fileName)}`,
    { headers: authHeader(), responseType: "blob" },
  );
  return URL.createObjectURL(response.data);
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

export const getProblemById = getReportById;

export const updateProblem = updateReport;
