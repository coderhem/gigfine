import api from "./axios.js";
import { API_BASE_URL, authHeader } from "./config.js";

// NotificationAudience in the backend
export const AUDIENCE_LABEL = {
  ALL: "All users",
  PASSENGER: "Passengers only",
  RIDER: "Riders only",
};

// sortBy values the backend accepts on /notifications/manage
export const NOTIFICATION_SORTS = {
  "createdAt:desc": "Newest first",
  "createdAt:asc": "Oldest first",
  "updatedAt:desc": "Recently edited",
  "expiresAt:asc": "Expiring soonest",
  "title:asc": "Title A–Z",
};

// Logged-in user's feed: ALL + their current mode, unexpired, newest first
export async function getMyNotifications() {
  const response = await api.get(`${API_BASE_URL}/api/v1/notifications`, {
    headers: authHeader(),
  });
  return response.data; // NotificationDto[]
}

// ---------- Management (business panel, user token) ----------
// The admin panel has the same calls in admin.js with the admin token.

// filters: { audience, q, from, to, sort } — from/to as "YYYY-MM-DD", sort a NOTIFICATION_SORTS key
export function notificationSearchParams({ audience, q, from, to, sort } = {}) {
  const params = {};
  if (audience) params.audience = audience;
  if (q?.trim()) params.q = q.trim();
  if (from) params.from = `${from}T00:00:00`;
  if (to) params.to = `${to}T23:59:59`;
  if (sort) [params.sortBy, params.direction] = sort.split(":");
  return params;
}

// data: { title, message, audience, expiresAt } — expiresAt "YYYY-MM-DDTHH:mm" or empty
export function notificationBody({ title, message, audience, expiresAt }) {
  return { title, message, audience, expiresAt: expiresAt || null };
}

export async function getManagedNotifications(filters) {
  const response = await api.get(`${API_BASE_URL}/api/v1/notifications/manage`, {
    headers: authHeader(),
    params: notificationSearchParams(filters),
  });
  return response.data;
}

export async function createNotification(data) {
  const response = await api.post(
    `${API_BASE_URL}/api/v1/notifications`,
    notificationBody(data),
    { headers: authHeader() },
  );
  return response.data;
}

export async function updateNotification(id, data) {
  const response = await api.put(
    `${API_BASE_URL}/api/v1/notifications/${id}`,
    notificationBody(data),
    { headers: authHeader() },
  );
  return response.data;
}

export async function deleteNotification(id) {
  await api.delete(`${API_BASE_URL}/api/v1/notifications/${id}`, {
    headers: authHeader(),
  });
}

// ---------- Unread badge ----------
// No per-user read state on the backend yet: anything newer than the last
// visit to /notifications counts as unread.

const SEEN_KEY = "notificationsSeenAt";

export function countUnseen(notifications) {
  let seenAt = 0;
  try {
    seenAt = Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {}
  return notifications.filter((n) => new Date(n.createdAt).getTime() > seenAt).length;
}

export function markNotificationsSeen() {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {}
}
