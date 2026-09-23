import api from "./axios.js";
import { API_BASE_URL, authHeader } from "./config.js";

// Logged-in user's profile ({ userId, name, email, mobile, imageName, roles })
export async function getMyProfile() {
  const response = await api.get(`${API_BASE_URL}/api/v1/users/me`, {
    headers: authHeader(),
  });
  return response.data;
}

// Backend replaces email, mobile and name together, so send all three.
// Blank values go as null so an empty email doesn't clash with the unique constraint.
export async function updateMyProfile(userId, { name, email, mobile }) {
  const response = await api.put(
    `${API_BASE_URL}/api/v1/users/${userId}`,
    {
      name: name?.trim() || null,
      email: email?.trim() || null,
      mobile: mobile?.trim() || null,
    },
    { headers: authHeader() },
  );
  return response.data;
}

// Only jpeg/jpg/png under 5MB are accepted by the backend
export async function uploadProfileImage(userId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(
    `${API_BASE_URL}/api/v1/users/file/upload/${userId}`,
    formData,
    { headers: authHeader() },
  );
  return response.data;
}

// The image endpoint needs the auth header, so it can't be used as a plain <img src>.
// Returns an object URL — revoke it with URL.revokeObjectURL when done.
export async function getProfileImageUrl(imageName) {
  const response = await api.get(
    `${API_BASE_URL}/api/v1/users/image/${encodeURIComponent(imageName)}`,
    { headers: authHeader(), responseType: "blob" },
  );
  return URL.createObjectURL(response.data);
}
