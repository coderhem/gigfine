import axios from "axios";
import api from "./axios.js";
import { API_BASE_URL, authHeader } from "./config.js";

export const LANDLORD_ROLE = "ROLE_LANDLORD";

// Rental site (APP_MODE=rental). In `next dev` everything runs on one server.
export const RENT_URL =
  process.env.NEXT_PUBLIC_RENT_URL ??
  (process.env.NODE_ENV === "development" ? "" : "https://rent.gigfine.com");

// Tenants never get the owner's number — every enquiry goes through the GIGFINE office
export const RENT_CONTACT_PHONE = process.env.NEXT_PUBLIC_RENT_CONTACT_PHONE ?? "9868222043";

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
  GARBAGE_COLLECTION: "Garbage collection",
  PEACEFUL_ENVIRONMENT: "Peaceful environment",
  CCTV: "CCTV",
  GOOD_ROAD: "Good road",
  HOT_WATER: "Hot water",
  BACKUP_POWER: "Power backup",
  WIFI: "WiFi",
  LIFT: "Lift",
  ROOFTOP_ACCESS: "Rooftop access",
  SOLAR_HOT_WATER: "Solar hot water",
  BIKE_PARKING: "Bike parking",
  CAR_PARKING: "Car parking",
  WATER_24H: "24 hr water", // old houses only — replaced by house.water
};

// Amenities the house form asks for under "Parking"; the rest go under "Facilities"
export const PARKING_AMENITIES = ["BIKE_PARKING", "CAR_PARKING"];
export const FACILITY_LABEL = Object.fromEntries(
  Object.entries(AMENITY_LABEL).filter(([k]) => !PARKING_AMENITIES.includes(k) && k !== "WATER_24H"),
);

export const NEARBY_LABEL = {
  HIGHWAY: "Highway",
  HOSPITAL: "Hospital",
  COLLEGE: "College",
  PARK: "Park",
  BUSPARK: "Buspark",
  HOTEL: "Hotel",
  MARKET: "Market",
  MART: "Mart",
  AIRPORT: "Airport",
  PHARMACY: "Pharmacy",
  STUDIO: "Studio",
  GOVERNMENT_OFFICE: "Government office",
  CAFE: "Cafe",
};

export const WATER_LABEL = {
  ALL_DAY: "24 hours",
  ALTERNATE_DAYS: "Alternate days",
  FEW_DAYS_A_WEEK: "Few days a week",
  STORAGE: "Water storage",
};

const yesNo = (v) => (v == null ? null : v ? "Yes" : "No");

// Label / value rows for a house (or a post, which carries its house's details). Empty values are null.
/** @returns {[string, any][]} */
export function houseFacts(h) {
  const parking = (h.amenities ?? []).filter((a) => PARKING_AMENITIES.includes(a));
  return [
    ["Total rooms", h.totalRooms],
    ["Bathrooms", h.totalBathrooms],
    ["Owner lives here", yesNo(h.ownerLivesHere)],
    ["Water", WATER_LABEL[h.water] ?? null],
    // Houses saved with the current form always have water set, so no parking there means "No space"
    ["Parking", parking.length ? parking.map((a) => AMENITY_LABEL[a]).join(", ") : h.water ? "No space" : null],
    ["Gate closes", h.gateClosingTime],
    ["Nearby", h.nearby?.length ? h.nearby.map((n) => NEARBY_LABEL[n] ?? n).join(", ") : null],
  ];
}

export const PROPERTY_TYPE_LABEL = { ROOM: "Room", FLAT: "Flat", WHOLE_HOUSE: "Whole house", SHUTTER: "Shutter" };
// What the post form offers; whole house / shutter remain only for old posts
export const POSTABLE_TYPES = ["ROOM", "FLAT"];

export const FLAT_TYPE_LABEL = { ONE_BK: "1BK", ONE_BHK: "1BHK", TWO_BHK: "2BHK", THREE_BHK: "3BHK", FOUR_PLUS_BHK: "4BHK+" };
export const MINIMUM_STAY_LABEL = { SIX_MONTHS: "6 months", ONE_YEAR: "1 year", TWO_YEARS: "2 years", FLEXIBLE: "Flexible" };
export const RENT_INCREASE_LABEL = { YEARLY: "Yearly", NO_INCREASE: "No increase", NEGOTIABLE: "Negotiable" };
export const TENANT_TYPE_LABEL = {
  FAMILY: "Family",
  BACHELOR: "Bachelor",
  STUDENT: "Student",
  JOB_PROFESSIONAL: "Job professional",
  ANYONE: "Anyone",
};

// Label / value rows for a flat post; empty for rooms
/** @returns {[string, any][]} */
export function flatFacts(p) {
  if (p.type !== "FLAT") return [];
  return [
    ["Flat type", FLAT_TYPE_LABEL[p.flatType] ?? null],
    ["Size", p.areaSqft != null ? `${p.areaSqft} sq ft` : null],
    ["Bathrooms", p.bathrooms],
    ["Balconies", p.balconies],
    ["Minimum stay", MINIMUM_STAY_LABEL[p.minimumStay] ?? null],
    ["Rent increase", RENT_INCREASE_LABEL[p.rentIncrease] ?? null],
    ["Written agreement", yesNo(p.writtenAgreement)],
    ["Preferred tenant", p.preferredTenants?.length ? p.preferredTenants.map((t) => TENANT_TYPE_LABEL[t] ?? t).join(", ") : null],
  ];
}
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
// data: { name, email, mobile, password, panNo? }
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
// PAN photo isn't asked for right now — kept for when it is needed again
export const uploadPanImage = (userId, file) => upload(`/api/v1/landlords/${userId}/pan`, file);
// side: "front" | "back"
export const uploadCitizenshipImage = (userId, side, file) =>
  upload(`/api/v1/landlords/${userId}/citizenship/${side}`, file);

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

// Room photos are public, but PAN / citizenship photos need the auth header — so every file
// is fetched as a blob. Returns an object URL — revoke it when done.
export async function getRentalMediaUrl(fileName) {
  const response = await api.get(`${API_BASE_URL}/api/v1/rentals/media/${encodeURIComponent(fileName)}`, {
    headers: authHeader(),
    responseType: "blob",
  });
  return URL.createObjectURL(response.data);
}
