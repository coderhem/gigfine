import axios from "axios";
import { API_BASE_URL } from "./config.js";

// Public "delete my account" form (gigfine.com/delete-account, linked from Google Play).
// No login. Body: { name, phone, email?, app: GIGFINE | RENTAL, reason?, confirm: true }
// Reply: { id, status, createdAt } (it never says whether an account matched)
export async function requestAccountDeletion(form) {
  const res = await axios.post(`${API_BASE_URL}/api/v1/account-deletion`, form);
  return res.data;
}
