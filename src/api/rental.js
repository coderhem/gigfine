import axios from "axios";
import api from "./axios.js";
import { API_BASE_URL, authHeader } from "./config.js";

export const LANDLORD_ROLE = "ROLE_LANDLORD";

// Rental site (APP_MODE=rental). In `next dev` everything runs on one server.
export const RENT_URL =
  process.env.NEXT_PUBLIC_RENT_URL ??
  (process.env.NODE_ENV === "development" ? "" : "https://rent.gigfine.com");

export const isLandlord = (user) => !!user?.roles?.includes(LANDLORD_ROLE);

// ---------- Labels (mirror the backend enums) ----------

export const APPROVAL_LABEL = { PENDING: "Pending review", APPROVED: "Approved", REJECTED: "Rejected" };

export const APPROVAL_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export const POST_STATUS_LABEL = { ACTIVE: "Active", RENTED: "Rented", INACTIVE: "Hidden" };

export const POST_STATUS_BADGE = {
  ACTIVE: "bg-green-100 text-green-800",
  RENTED: "bg-blue-100 text-blue-800",
  INACTIVE: "bg-gray-200 text-gray-600",
};

export const AMENITY_LABEL = {
  WIFI: "WiFi",
  BIKE_PARKING: "Bike parking",
  CAR_PARKING: "Car parking",
  WATER_24H: "24 hr water",
  SOLAR_HOT_WATER: "Solar hot water",
  CCTV: "CCTV",
  LIFT: "Lift",
  ROOFTOP_ACCESS: "Rooftop access",
  BACKUP_POWER: "Power backup",
};

export const PROPERTY_TYPE_LABEL = { ROOM: "Room", FLAT: "Flat", WHOLE_HOUSE: "Whole house", SHUTTER: "Shutter" };
export const BATHROOM_LABEL = { ATTACHED: "Attached bathroom", SHARED: "Shared bathroom" };
export const KITCHEN_LABEL = { PRIVATE: "Private kitchen", SHARED: "Shared kitchen", NONE: "No kitchen" };
export const FURNISHING_LABEL = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi furnished",
  FULLY_FURNISHED: "Fully furnished",
};

export const PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

// Same rules as RentalSupport in the backend
export const IMAGE_EXTENSIONS = ["jpeg", "jpg", "png", "webp"];
export const VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];
export const IMAGE_MAX_MB = 5;
export const VIDEO_MAX_MB = 50;

// Returns an error message, or null when the file can be uploaded
export function mediaFileError(file, { imagesOnly = false } = {}) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.includes(ext)) {
    return file.size > IMAGE_MAX_MB * 1024 * 1024 ? `${file.name}: images must be under ${IMAGE_MAX_MB}MB` : null;
  }
  if (!imagesOnly && VIDEO_EXTENSIONS.includes(ext)) {
    return file.size > VIDEO_MAX_MB * 1024 * 1024 ? `${file.name}: videos must be under ${VIDEO_MAX_MB}MB` : null;
  }
  return imagesOnly
    ? `${file.name}: use ${IMAGE_EXTENSIONS.join(", ")}`
    : `${file.name}: use images (${IMAGE_EXTENSIONS.join(", ")}) or videos (${VIDEO_EXTENSIONS.join(", ")})`;
}

const get = async (path, params) =>
  (await api.get(`${API_BASE_URL}${path}`, { headers: authHeader(), params })).data;
const post = async (path, body) =>
  (await api.post(`${API_BASE_URL}${path}`, body, { headers: authHeader() })).data;
const put = async (path, body) =>
  (await api.put(`${API_BASE_URL}${path}`, body, { headers: authHeader() })).data;
const del = async (path) => {
  await api.delete(`${API_BASE_URL}${path}`, { headers: authHeader() });
};
const upload = async (path, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return post(path, formData);
};

// ---------- Auth ----------

// Account + PENDING landlord in one request; logs in.
// data: { name, email, mobile, password, panNo, citizenshipNo, permanentAddress }
export async function registerLandlord(data) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register-landlord`, data);
  localStorage.setItem("token", response.data.token);
  return response.data; // { token, user }
}

// Token handed over from the main site (/rent/login#token=...)
export async function rentalLoginWithToken(token) {
  const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.setItem("token", token);
  return response.data; // user
}

// ---------- Landlord profile ----------

// null when the user hasn't become a landlord yet
export async function getMyLandlord(userId) {
  try {
    return await get(`/api/v1/landlords/${userId}`);
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

// { panNo, citizenshipNo, permanentAddress }
export const createLandlord = (userId, data) => post(`/api/v1/landlords/${userId}`, data);
export const updateLandlord = (userId, data) => put(`/api/v1/landlords/${userId}`, data);
export const uploadPanImage = (userId, file) => upload(`/api/v1/landlords/${userId}/pan`, file);

// ---------- Houses ----------

export const getMyHouses = (userId) => get(`/api/v1/users/${userId}/houses`);
export const getHouse = (userId, houseId) => get(`/api/v1/users/${userId}/houses/${houseId}`);
export const createHouse = (userId, data) => post(`/api/v1/users/${userId}/houses`, data);
export const updateHouse = (userId, houseId, data) => put(`/api/v1/users/${userId}/houses/${houseId}`, data);
export const deleteHouse = (userId, houseId) => del(`/api/v1/users/${userId}/houses/${houseId}`);
export const uploadHouseMedia = (userId, houseId, file) =>
  upload(`/api/v1/users/${userId}/houses/${houseId}/media`, file);
export const deleteHouseMedia = (userId, houseId, mediaId) =>
  del(`/api/v1/users/${userId}/houses/${houseId}/media/${mediaId}`);

// ---------- Posts (rooms / flats) ----------

const postsPath = (userId, houseId) => `/api/v1/users/${userId}/houses/${houseId}/posts`;

export const getHousePosts = (userId, houseId) => get(postsPath(userId, houseId));
export const getHousePost = (userId, houseId, postId) => get(`${postsPath(userId, houseId)}/${postId}`);
export const createPost = (userId, houseId, data) => post(postsPath(userId, houseId), data);
export const updatePost = (userId, houseId, postId, data) => put(`${postsPath(userId, houseId)}/${postId}`, data);
export const updatePostStatus = (userId, houseId, postId, status) =>
  put(`${postsPath(userId, houseId)}/${postId}/status`, { status });
export const deletePost = (userId, houseId, postId) => del(`${postsPath(userId, houseId)}/${postId}`);
export const uploadPostMedia = (userId, houseId, postId, file) =>
  upload(`${postsPath(userId, houseId)}/${postId}/media`, file);
export const deletePostMedia = (userId, houseId, postId, mediaId) =>
  del(`${postsPath(userId, houseId)}/${postId}/media/${mediaId}`);

// ---------- Tenants ----------

// filters: { type, district, municipality, minRent, maxRent, bathroom, kitchen, sort } — sort "rent:asc" etc.
export async function searchPosts({ sort, ...filters } = {}) {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null));
  if (sort) [params.sortBy, params.direction] = sort.split(":");
  return get("/api/v1/posts", params);
}

export const getPublicPost = (postId) => get(`/api/v1/posts/${postId}`);

// Media needs the auth header, so it can't be a plain src. Returns an object URL — revoke it when done.
export async function getRentalMediaUrl(fileName) {
  const response = await api.get(`${API_BASE_URL}/api/v1/rentals/media/${encodeURIComponent(fileName)}`, {
    headers: authHeader(),
    responseType: "blob",
  });
  return URL.createObjectURL(response.data);
}
